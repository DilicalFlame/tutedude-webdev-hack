import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { hashPassword } from '@/app/lib/auth/password';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, businessName, businessType, businessLicense } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if seller with email already exists
    const existingSeller = await prisma.seller.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return NextResponse.json(
        { error: 'A seller with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new seller
    const newSeller = await prisma.seller.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        businessName,
        businessType,
        businessLicense,
      },
    });

    // Return new seller without password
    const { password: _, ...sellerWithoutPassword } = newSeller;

    return NextResponse.json(
      { message: 'Seller registered successfully', seller: sellerWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering seller:', error);
    return NextResponse.json(
      { error: 'An error occurred while registering the seller' },
      { status: 500 }
    );
  }
}
