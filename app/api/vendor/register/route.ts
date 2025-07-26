import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { hashPassword } from '@/app/lib/auth/password';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, businessName, foodType } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if vendor with email already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: 'A vendor with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new vendor
    const newVendor = await prisma.vendor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        businessName,
        foodType,
      },
    });

    // Return new vendor without password
    const { password: _, ...vendorWithoutPassword } = newVendor;

    return NextResponse.json(
      { message: 'Vendor registered successfully', vendor: vendorWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering vendor:', error);
    return NextResponse.json(
      { error: 'An error occurred while registering the vendor' },
      { status: 500 }
    );
  }
}
