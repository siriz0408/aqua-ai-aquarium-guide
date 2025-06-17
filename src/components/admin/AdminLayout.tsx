
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  LifeBuoy, 
  BarChart3, 
  Settings,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const { adminProfile } = useAdminAuth();
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users, permission: 'user_management' },
    { name: 'Support Tickets', href: '/admin/tickets', icon: LifeBuoy, permission: 'ticket_management' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'analytics' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                  <Badge variant="secondary" className="text-xs">
                    {adminProfile?.admin_role}
                  </Badge>
                </div>
              </div>
            </div>

            <nav className="mt-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User info and actions */}
            <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t bg-white">
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.email}</p>
                  <p className="text-gray-500">Administrator</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Main App
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminLayout;
