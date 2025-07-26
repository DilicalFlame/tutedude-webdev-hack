import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tutedude-b2b-secure-jwt-secret-key-2025';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token
    const decoded = verify(token, JWT_SECRET) as any;

    // Check if the token is for a seller
    if (decoded.role !== 'seller') {
      return NextResponse.json(
        { error: 'Invalid token role. Expected seller token.' },
        { status: 403 }
      );
    }

    // Find seller by ID from token
    const seller = await prisma.seller.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        businessType: true,
        businessLicense: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Token verified successfully',
      seller,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
