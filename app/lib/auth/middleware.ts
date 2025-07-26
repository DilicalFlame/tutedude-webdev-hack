import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tutedude-b2b-secure-jwt-secret-key-2025';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: 'seller' | 'vendor';
  };
}

export async function authenticateSeller(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'seller') {
      throw new Error('Invalid token role. Expected seller token.');
    }

    // Verify seller exists in database
    const seller = await prisma.seller.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
      },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: 'seller' as const,
      seller,
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

export async function authenticateVendor(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'vendor') {
      throw new Error('Invalid token role. Expected vendor token.');
    }

    // Verify vendor exists in database
    const vendor = await prisma.vendor.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: 'vendor' as const,
      vendor,
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

export async function authenticateUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as any;

    if (decoded.role === 'seller') {
      return await authenticateSeller(request);
    } else if (decoded.role === 'vendor') {
      return await authenticateVendor(request);
    } else {
      throw new Error('Invalid token role');
    }
  } catch (error) {
    throw new Error('Authentication failed');
  }
}
