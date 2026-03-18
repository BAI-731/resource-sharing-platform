import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, ShoppingBag, Settings, LogOut, Edit2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function ProfilePage() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <Button onClick={() => navigate('/auth')}>去登录</Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const menuItems = [
    { icon: ShoppingBag, label: '我的订单', path: '/orders', count: 0 },
    { icon: Package, label: '我发布的', path: '/my-items' },
    { icon: Settings, label: '设置', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-light p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {user.user_metadata?.name || user.email}
                </h1>
                <p className="text-white/80 text-sm mt-1">{user.email}</p>
              </div>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">账户管理</h2>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-primary text-white text-sm px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t mt-6 pt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-5 h-5" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
