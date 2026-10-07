import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = db.getUserByEmail(email);
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        doctorProfileId: user.doctorProfileId,
        patientProfileId: user.patientProfileId,
        departmentId: user.departmentId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwtRefreshSecret,
      { expiresIn: '30d' }
    );

    db.logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      resource: 'AUTH',
      resourceId: user.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      metadata: { role: user.role }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role = 'PATIENT', phone, bloodGroup, gender, dob, address } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${uuidv4().substring(0, 8)}`;

    let patientProfileId: string | undefined;

    // If registering as a patient, also create a patient record
    if (role === 'PATIENT') {
      const patientSeq = (db.getPatients().length + 1).toString().padStart(4, '0');
      const patientId = `PAT-2026-${patientSeq}`;
      const newPatient = {
        id: `pat-${uuidv4().substring(0, 8)}`,
        patientId,
        userId,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        fullName: name,
        dob: dob || '1995-01-01',
        age: dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30,
        gender: (gender || 'MALE') as any,
        bloodGroup: (bloodGroup || 'O+') as any,
        phone: phone || '+91 98000 00000',
        email,
        address: address || 'City Center',
        city: 'Bengaluru',
        state: 'Karnataka',
        emergencyContactName: 'Family Contact',
        emergencyContactPhone: phone || '+91 98000 00000',
        emergencyContactRelation: 'Relative',
        allergies: [],
        existingConditions: [],
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.addPatient(newPatient);
      patientProfileId = newPatient.id;
    }

    const newUser = {
      id: userId,
      name,
      email,
      password: passwordHash,
      role: role as UserRole,
      phone,
      patientProfileId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        patientProfileId: newUser.patientProfileId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    db.logAudit({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      resource: 'AUTH',
      resourceId: newUser.id,
      metadata: { role: newUser.role }
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = db.getUserById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const getDemoAccounts = async (_req: Request, res: Response): Promise<void> => {
  const users = db.getUsers();
  const demoList = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    departmentId: u.departmentId,
  }));

  res.status(200).json({
    success: true,
    data: demoList,
  });
};
