import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/dbService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { IRoom, IBed, BedStatus } from '../types';

export const getRooms = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = db.getRooms();
    const beds = db.getBeds();

    const withBeds = rooms.map(r => {
      const roomBeds = beds.filter(b => b.roomId === r.id);
      const occupied = roomBeds.filter(b => b.status === 'OCCUPIED').length;
      const available = roomBeds.filter(b => b.status === 'AVAILABLE').length;

      return {
        ...r,
        beds: roomBeds,
        totalBeds: roomBeds.length,
        occupiedBeds: occupied,
        availableBeds: available,
      };
    });

    res.status(200).json({
      success: true,
      data: withBeds,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomNumber, floor, type, capacity, dailyRate } = req.body;

    if (!roomNumber || !floor || !type || !capacity || !dailyRate) {
      throw new AppError('Room number, floor, type, capacity, and daily rate are required', 400);
    }

    const newRoom: IRoom = {
      id: `rm-${uuidv4().substring(0, 8)}`,
      roomNumber,
      floor,
      type,
      capacity: parseInt(capacity, 10),
      dailyRate: parseFloat(dailyRate),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    db.addRoom(newRoom);

    // Automatically generate beds for this room
    for (let i = 1; i <= newRoom.capacity; i++) {
      const bedNumber = `B-${roomNumber}-${i}`;
      const newBed: IBed = {
        id: `bed-${uuidv4().substring(0, 8)}`,
        bedNumber,
        roomId: newRoom.id,
        roomNumber: newRoom.roomNumber,
        roomType: newRoom.type,
        dailyRate: newRoom.dailyRate,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.addBed(newBed);
    }

    res.status(201).json({
      success: true,
      message: 'Room and beds created successfully',
      data: newRoom,
    });
  } catch (error) {
    next(error);
  }
};

export const getBeds = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, roomType, roomId } = req.query;

    let beds = db.getBeds();

    if (status) {
      beds = beds.filter(b => b.status === status);
    }

    if (roomType) {
      beds = beds.filter(b => b.roomType === roomType);
    }

    if (roomId) {
      beds = beds.filter(b => b.roomId === roomId);
    }

    res.status(200).json({
      success: true,
      data: beds,
    });
  } catch (error) {
    next(error);
  }
};

export const getBedMap = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = db.getRooms();
    const beds = db.getBeds();

    const bedMap = rooms.map(room => {
      const roomBeds = beds.filter(b => b.roomId === room.id);
      return {
        room,
        beds: roomBeds,
        occupancyRate: roomBeds.length > 0
          ? Math.round((roomBeds.filter(b => b.status === 'OCCUPIED').length / roomBeds.length) * 100)
          : 0,
      };
    });

    const totalBeds = beds.length;
    const occupiedCount = beds.filter(b => b.status === 'OCCUPIED').length;
    const availableCount = beds.filter(b => b.status === 'AVAILABLE').length;
    const maintenanceCount = beds.filter(b => b.status === 'MAINTENANCE').length;

    res.status(200).json({
      success: true,
      data: {
        bedMap,
        summary: {
          totalBeds,
          occupiedCount,
          availableCount,
          maintenanceCount,
          occupancyPercentage: totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBedStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bed = db.getBedById(id);
    if (!bed) {
      throw new AppError('Bed not found', 404);
    }

    const updated = db.updateBed(bed.id, {
      status: status as BedStatus,
      ...(status === 'AVAILABLE' ? { currentPatientId: undefined, currentPatientName: undefined, currentAdmissionId: undefined, occupiedSince: undefined } : {}),
    });

    res.status(200).json({
      success: true,
      message: `Bed status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
