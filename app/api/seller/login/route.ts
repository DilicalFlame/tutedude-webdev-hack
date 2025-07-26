import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { verifyPassword } from '@/app/lib/auth/password';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tutedude-b2b-secure-jwt-secret-key-2025';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find seller by email
    const seller = await prisma.seller.findUnique({
      where: { email },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, seller.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { id: seller.id, email: seller.email, role: 'seller' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and user data without password
    const { password: _, ...sellerWithoutPassword } = seller;

    return NextResponse.json({
      message: 'Login successful',
      token,
      seller: sellerWithoutPassword,
    });
  } catch (error) {
    console.error('Error during seller login:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
