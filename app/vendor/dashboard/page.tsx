'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Helper functions for cookie management
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export default function VendorDashboard() {
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('vendorToken');

      if (!token) {
        // No token found, redirect to login
        router.replace('/vendor');
        return;
      }

      try {
        // Verify token with the API
        const response = await fetch('/api/vendor/verify', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid, clear it and redirect
          eraseCookie('vendorToken');
          localStorage.removeItem('vendorToken');
          router.replace('/vendor');
          return;
        }

        const data = await response.json();
        setVendorData(data.vendor);
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, clear token and redirect
        eraseCookie('vendorToken');
        localStorage.removeItem('vendorToken');
        router.replace('/vendor');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    // Clear token from cookies and localStorage
    eraseCookie('vendorToken');
    localStorage.removeItem('vendorToken');

    // Redirect to login page
    router.push('/vendor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {vendorData?.name}</h2>
          <p className="text-gray-600 mb-2">Email: {vendorData?.email}</p>
          <p className="text-gray-600 mb-6">Business: {vendorData?.businessName}</p>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">
              This is your vendor dashboard. Here you'll be able to manage your products,
              view orders, and connect with retailers in the food supply chain.
            </p>
          </div>
        </div>

        {/* Dashboard content would go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Products</h3>
            <p className="text-gray-600 mb-4">Manage your product inventory</p>
            <div className="flex justify-end">
              <button className="text-indigo-600 hover:text-indigo-800">
                View Products →
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Orders</h3>
            <p className="text-gray-600 mb-4">Track and manage customer orders</p>
            <div className="flex justify-end">
              <button className="text-indigo-600 hover:text-indigo-800">
                View Orders →
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Retailers</h3>
            <p className="text-gray-600 mb-4">Connect with retailers in your area</p>
            <div className="flex justify-end">
              <button className="text-indigo-600 hover:text-indigo-800">
                Browse Retailers →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
