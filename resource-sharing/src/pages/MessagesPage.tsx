import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, MessageCircle, ShoppingBag, X, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type NotificationType = 'order' | 'exchange' | 'system' | 'message';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            link: n.link,
            createdAt: n.created_at,
          }))
        );
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('全部标记已读失败:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  const typeConfig: Record<
    NotificationType,
    { icon: React.ElementType; color: string }
  > = {
    order: { icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
    exchange: { icon: MessageCircle, color: 'text-purple-600 bg-purple-100' },
    system: { icon: Bell, color: 'text-gray-600 bg-gray-100' },
    message: { icon: User, color: 'text-green-600 bg-green-100' },
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后查看消息</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">消息通知</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:text-primary-dark transition"
            >
              全部标为已读 ({unreadCount})
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无消息</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const TypeIcon = typeConfig[notification.type].icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      navigate(notification.link);
                    }
                  }}
                  className={cn(
                    'bg-white rounded-xl p-4 shadow-sm cursor-pointer transition hover:shadow-md relative',
                    !notification.read && 'border-l-4 border-primary'
                  )}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        typeConfig[notification.type].color
                      )}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            'font-medium',
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
