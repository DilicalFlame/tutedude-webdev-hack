import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { authenticateSeller } from '@/app/lib/auth/middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateSeller(request);

    const seller = await prisma.seller.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        businessName: true,
        businessType: true,
        businessLicense: true,
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

    return NextResponse.json({ seller });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateSeller(request);
    const body = await request.json();
    const { name, phone, address, businessName, businessType, businessLicense } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: auth.id },
      data: {
        name,
        phone,
        address,
        businessName,
        businessType,
        businessLicense,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        businessName: true,
        businessType: true,
        businessLicense: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      seller: updatedSeller,
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the profile' },
      { status: 500 }
    );
  }
}
