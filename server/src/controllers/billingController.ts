import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IInvoice, IPayment, PaymentMethod } from '../types';

export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, status, search } = req.query;

    let invoices = db.getInvoices();

    if (req.user?.role === 'PATIENT') {
      const pId = req.user.patientProfileId || req.user.id;
      invoices = invoices.filter(i => i.patientId === pId);
    }

    if (patientId) {
      invoices = invoices.filter(i => i.patientId === patientId);
    }

    if (status) {
      invoices = invoices.filter(i => i.status === status);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      invoices = invoices.filter(
        i =>
          i.patientName.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q)
      );
    }

    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = db.getInvoiceById(id);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    const patient = db.getPatientById(invoice.patientId);
    const setting = db.getHospitalSetting();

    res.status(200).json({
      success: true,
      data: {
        ...invoice,
        patient,
        hospital: setting,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      patientId,
      items = [],
      discountAmount = 0,
      taxPercentage = 5.0,
      notes,
    } = req.body;

    if (!patientId || items.length === 0) {
      throw new AppError('Patient and at least one billable item are required', 400);
    }

    const patient = db.getPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const formattedItems = items.map((i: any) => ({
      id: `item-${uuidv4().substring(0, 6)}`,
      category: i.category || 'OTHER',
      description: i.description,
      unitPrice: parseFloat(i.unitPrice),
      quantity: parseInt(i.quantity || '1', 10),
      amount: parseFloat(i.unitPrice) * parseInt(i.quantity || '1', 10),
    }));

    const subtotal = formattedItems.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = parseFloat(((subtotal * parseFloat(taxPercentage)) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount - parseFloat(discountAmount || '0')).toFixed(2));

    const seq = (db.getInvoices().length + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-2026-${seq}`;
    const todayDate = new Date().toISOString().split('T')[0];

    const newInvoice: IInvoice = {
      id: `inv-${uuidv4().substring(0, 8)}`,
      invoiceNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      items: formattedItems,
      subtotal,
      taxPercentage: parseFloat(taxPercentage),
      taxAmount,
      discountAmount: parseFloat(discountAmount || '0'),
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: 'PENDING',
      issueDate: todayDate,
      dueDate: todayDate,
      payments: [],
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addInvoice(newInvoice);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'INVOICE_CREATED',
      resource: 'BILLING',
      resourceId: newInvoice.id,
      metadata: { invoiceNumber, patientName: patient.fullName, totalAmount },
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { invoiceId, amount, paymentMethod = 'UPI', transactionReference } = req.body;

    if (!invoiceId || !amount) {
      throw new AppError('Invoice ID and payment amount are required', 400);
    }

    const invoice = db.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    const payAmount = parseFloat(amount);
    if (payAmount <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    if (payAmount > invoice.balanceAmount + 0.01) {
      throw new AppError(`Payment amount (₹${payAmount}) exceeds outstanding balance (₹${invoice.balanceAmount})`, 400);
    }

    const seq = (db.getPayments().length + 1).toString().padStart(4, '0');
    const receiptNumber = `RCPT-2026-${seq}`;

    const newPayment: IPayment = {
      id: `pay-${uuidv4().substring(0, 8)}`,
      receiptNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: payAmount,
      paymentMethod: paymentMethod as PaymentMethod,
      transactionReference: transactionReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      receivedBy: req.user?.id || 'usr-accountant-1',
      receivedByName: req.user?.name || 'Ramesh Gupta (Accountant)',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.addPayment(newPayment);

    const newPaidAmount = parseFloat((invoice.paidAmount + payAmount).toFixed(2));
    const newBalance = parseFloat((invoice.totalAmount - newPaidAmount).toFixed(2));
    const newStatus = newBalance <= 0.01 ? 'PAID' : 'PARTIALLY_PAID';

    const updatedInvoice = db.updateInvoice(invoice.id, {
      paidAmount: newPaidAmount,
      balanceAmount: Math.max(0, newBalance),
      status: newStatus,
      payments: [...invoice.payments, newPayment],
    });

    // Notify Patient
    db.addNotification({
      id: `notif-${uuidv4()}`,
      userId: invoice.patientId,
      type: 'BILLING',
      title: 'Payment Received',
      message: `Payment of ₹${payAmount.toLocaleString('en-IN')} for Invoice #${invoice.invoiceNumber} was successfully received. Receipt #${receiptNumber}.`,
      link: '/billing',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PAYMENT_RECEIVED',
      resource: 'BILLING',
      resourceId: newPayment.id,
      metadata: {
        receiptNumber,
        invoiceNumber: invoice.invoiceNumber,
        amount: payAmount,
        paymentMethod,
        patientName: invoice.patientName,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment recorded and receipt generated successfully',
      data: {
        payment: newPayment,
        invoice: updatedInvoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFinancialSummary = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoices = db.getInvoices();
    const payments = db.getPayments();

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = invoices
      .filter(i => i.status === 'PENDING' || i.status === 'PARTIALLY_PAID')
      .reduce((sum, i) => sum + i.balanceAmount, 0);

    const byMethod = payments.reduce((acc: Record<string, number>, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalBilled,
        totalCollected,
        totalPending,
        paymentCount: payments.length,
        invoiceCount: invoices.length,
        breakdownByMethod: byMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};
