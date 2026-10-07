import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IMedicine, IPharmacyTransaction, IInvoiceItem, IInvoice } from '../types';

export const getMedicines = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, lowStock, expiringSoon } = req.query;

    let medicines = db.getMedicines();

    if (search) {
      const q = (search as string).toLowerCase();
      medicines = medicines.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.medicineCode.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q)
      );
    }

    if (category) {
      medicines = medicines.filter(m => m.category === category);
    }

    if (lowStock === 'true') {
      medicines = medicines.filter(m => m.currentStock <= m.reorderLevel);
    }

    if (expiringSoon === 'true') {
      const now = new Date();
      const in60Days = new Date();
      in60Days.setDate(now.getDate() + 60);

      medicines = medicines.filter(m => {
        const exp = new Date(m.expiryDate);
        return exp <= in60Days;
      });
    }

    medicines.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    next(error);
  }
};

export const addMedicine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      genericName,
      brand,
      category,
      manufacturer,
      batchNumber,
      expiryDate,
      purchasePrice,
      sellingPrice,
      currentStock,
      reorderLevel,
      unit = 'TABLET',
      locationShelf,
    } = req.body;

    if (!name || !batchNumber || !expiryDate || !sellingPrice || currentStock === undefined) {
      throw new AppError('Name, batch number, expiry date, selling price, and stock are required', 400);
    }

    const seq = (db.getMedicines().length + 1).toString().padStart(3, '0');
    const medicineCode = `MED-${seq}`;

    const newMedicine: IMedicine = {
      id: `med-${uuidv4().substring(0, 8)}`,
      medicineCode,
      name,
      genericName: genericName || name,
      brand: brand || name,
      category: category || 'OTHER',
      manufacturer: manufacturer || 'Standard Pharmaceuticals',
      batchNumber,
      expiryDate,
      purchasePrice: parseFloat(purchasePrice || '0'),
      sellingPrice: parseFloat(sellingPrice),
      currentStock: parseInt(currentStock, 10),
      reorderLevel: parseInt(reorderLevel || '30', 10),
      unit,
      locationShelf: locationShelf || 'Rack A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addMedicine(newMedicine);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'MEDICINE_ADDED',
      resource: 'PHARMACY',
      resourceId: newMedicine.id,
      metadata: { name: newMedicine.name, stock: newMedicine.currentStock, batchNumber },
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added to pharmacy inventory',
      data: newMedicine,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = db.getMedicineById(id);
    if (!existing) {
      throw new AppError('Medicine not found', 404);
    }

    const updated = db.updateMedicine(existing.id, req.body);

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'MEDICINE_STOCK_UPDATED',
      resource: 'PHARMACY',
      resourceId: existing.id,
      metadata: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Medicine inventory updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const dispensePrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prescriptionId } = req.body;
    if (!prescriptionId) {
      throw new AppError('Prescription ID is required', 400);
    }

    const prescription = db.getPrescriptionById(prescriptionId);
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    if (prescription.status === 'DISPENSED') {
      throw new AppError('This prescription has already been dispensed', 400);
    }

    const dispensedItems: {
      medicineId: string;
      medicineName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    // Check stock for all items first
    for (const item of prescription.items) {
      const medicine = db.getMedicines().find(
        m => m.id === item.medicineId || m.name.toLowerCase() === item.medicineName.toLowerCase()
      );

      if (!medicine) {
        throw new AppError(`Medicine '${item.medicineName}' not found in pharmacy inventory`, 404);
      }

      if (medicine.currentStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for '${item.medicineName}'. Available: ${medicine.currentStock}, Requested: ${item.quantity}`,
          400
        );
      }

      dispensedItems.push({
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.sellingPrice,
        totalPrice: medicine.sellingPrice * item.quantity,
      });
    }

    // Atomic Stock Deduction
    for (const item of dispensedItems) {
      const med = db.getMedicineById(item.medicineId);
      if (med) {
        const newStock = med.currentStock - item.quantity;
        db.updateMedicine(med.id, { currentStock: newStock });

        // Trigger low stock warning if needed
        if (newStock <= med.reorderLevel) {
          db.addNotification({
            id: `notif-${uuidv4()}`,
            role: 'PHARMACIST',
            type: 'INVENTORY',
            title: 'Low Stock Alert',
            message: `${med.name} stock has reached ${newStock} units (Reorder level: ${med.reorderLevel}).`,
            link: '/pharmacy',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Update prescription
    const updatedPrescription = db.updatePrescription(prescription.id, {
      status: 'DISPENSED',
      dispensedAt: new Date().toISOString(),
      dispensedBy: req.user ? `${req.user.name} (${req.user.role})` : 'Manoj Kumar (Pharmacist)',
      items: prescription.items.map(i => ({ ...i, isDispensed: true })),
    });

    const totalAmount = dispensedItems.reduce((sum, i) => sum + i.totalPrice, 0);

    // Record pharmacy transaction
    const tx: IPharmacyTransaction = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      items: dispensedItems,
      totalAmount,
      dispensedBy: req.user?.id || 'usr-pharmacy-1',
      dispensedByName: req.user?.name || 'Manoj Kumar',
      transactionDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.addPharmacyTransaction(tx);

    // Check if patient has an active pending invoice for today, otherwise create one
    const todayDate = new Date().toISOString().split('T')[0];
    let invoice = db.getInvoices().find(
      i => i.patientId === prescription.patientId && i.issueDate === todayDate && i.status === 'PENDING'
    );

    const pharmacyInvoiceItems: IInvoiceItem[] = dispensedItems.map(d => ({
      id: `item-${uuidv4().substring(0, 6)}`,
      category: 'PHARMACY',
      description: `Pharmacy: ${d.medicineName} (${d.quantity} units)`,
      referenceId: prescription.id,
      unitPrice: d.unitPrice,
      quantity: d.quantity,
      amount: d.totalPrice,
    }));

    if (invoice) {
      const mergedItems = [...invoice.items, ...pharmacyInvoiceItems];
      const subtotal = mergedItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = parseFloat(((subtotal * invoice.taxPercentage) / 100).toFixed(2));
      const totalAmountWithTax = parseFloat((subtotal + taxAmount - invoice.discountAmount).toFixed(2));
      const balanceAmount = parseFloat((totalAmountWithTax - invoice.paidAmount).toFixed(2));

      db.updateInvoice(invoice.id, {
        items: mergedItems,
        subtotal,
        taxAmount,
        totalAmount: totalAmountWithTax,
        balanceAmount,
      });
    } else {
      const subtotal = totalAmount;
      const taxAmount = parseFloat(((subtotal * 5.0) / 100).toFixed(2));
      const grandTotal = parseFloat((subtotal + taxAmount).toFixed(2));
      const invSeq = (db.getInvoices().length + 1).toString().padStart(4, '0');

      const newInv: IInvoice = {
        id: `inv-${uuidv4().substring(0, 8)}`,
        invoiceNumber: `INV-2026-${invSeq}`,
        patientId: prescription.patientId,
        patientName: prescription.patientName || 'Patient',
        items: pharmacyInvoiceItems,
        subtotal,
        taxPercentage: 5.0,
        taxAmount,
        discountAmount: 0,
        totalAmount: grandTotal,
        paidAmount: 0,
        balanceAmount: grandTotal,
        status: 'PENDING',
        issueDate: todayDate,
        dueDate: todayDate,
        payments: [],
        notes: `Pharmacy Dispensed Prescription #${prescription.prescriptionNumber}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.addInvoice(newInv);
    }

    db.logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PRESCRIPTION_DISPENSED',
      resource: 'PHARMACY',
      resourceId: prescription.id,
      metadata: {
        prescriptionNumber: prescription.prescriptionNumber,
        patientName: prescription.patientName,
        totalAmount,
        itemsCount: dispensedItems.length,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Medicines dispensed successfully and pharmacy inventory updated',
      data: {
        prescription: updatedPrescription,
        transaction: tx,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPharmacyAlerts = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medicines = db.getMedicines();
    const now = new Date();
    const in45Days = new Date();
    in45Days.setDate(now.getDate() + 45);

    const lowStock = medicines.filter(m => m.currentStock <= m.reorderLevel);
    const expiringSoon = medicines.filter(m => new Date(m.expiryDate) <= in45Days);

    res.status(200).json({
      success: true,
      data: {
        lowStock,
        expiringSoon,
        lowStockCount: lowStock.length,
        expiringSoonCount: expiringSoon.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
