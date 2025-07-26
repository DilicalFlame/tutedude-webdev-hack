'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  businessLicense?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sellerToken');

    if (!token) {
      router.push('/seller/login');
      return;
    }

    fetchSellerData(token);
  }, [router]);

  const fetchSellerData = async (token: string) => {
    try {
      const response = await fetch('/api/seller/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setSeller(data.seller);

      // Mock stats for demonstration (you can implement actual stats endpoints later)
      setStats({
        totalProducts: 12,
        totalOrders: 45,
        totalRevenue: 2850.50,
        pendingOrders: 8,
      });
    } catch (error) {
      setError('Failed to load seller data');
      localStorage.removeItem('sellerToken');
      router.push('/seller/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    router.push('/seller/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Seller Dashboard</h1>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-blue-600">{seller?.businessName || 'Food Business'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {seller?.name}</span>
              <button
                onClick={() => router.push('/seller')}
                className="text-blue-600 hover:text-blue-700 px-3 py-2"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-medium">O</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-sm font-medium">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.totalRevenue}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-medium">!</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingOrders}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Product Management</h3>
                <p className="mt-2 text-sm text-gray-500">Add, edit, and manage your food products</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/seller/products')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Manage Products
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order Management</h3>
                <p className="mt-2 text-sm text-gray-500">View and process customer orders</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/seller/orders')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Business Analytics</h3>
                <p className="mt-2 text-sm text-gray-500">Track your sales and performance</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/seller/analytics')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Settings</h3>
                <p className="mt-2 text-sm text-gray-500">Update your business information</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/seller/profile/edit')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Support</h3>
                <p className="mt-2 text-sm text-gray-500">Get help and support</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/seller/support')}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => router.push('/seller/products/add')}
                    className="w-full bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => router.push('/seller/orders?status=pending')}
                    className="w-full bg-orange-500 text-white px-3 py-1 text-sm rounded hover:bg-orange-600 transition-colors"
                  >
                    Check Pending Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
