import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare_hms',
  jwtSecret: process.env.JWT_SECRET || 'medicare-super-secret-jwt-key-2026-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'medicare-super-secret-refresh-key-2026',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  taxPercentage: parseFloat(process.env.TAX_PERCENTAGE || '5.0'), // 5% GST on hospital services/medicines
  currencySymbol: '₹',
  currencyCode: 'INR',
  timezone: 'Asia/Kolkata',
};
