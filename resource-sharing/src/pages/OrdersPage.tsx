import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { cn } from '@/lib/utils';

type OrderStatus = Order['status'];

export function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setOrders(
          data.map((order: any) => ({
            id: order.id,
            buyerId: order.buyer_id,
            sellerId: order.seller_id,
            resourceId: order.resource_id,
            type: order.type,
            status: order.status,
            deliveryType: order.delivery_type,
            meetLocation: order.meet_location,
            qrCode: order.qr_code,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
          }))
        );
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    } catch (error) {
      console.error('更新订单状态失败:', error);
    }
  };

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  const statusConfig: Record<
    OrderStatus,
    { icon: React.ElementType; color: string; label: string }
  > = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: '待确认' },
    confirmed: {
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      label: '进行中',
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      label: '已完成',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
      label: '已取消',
    },
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后查看订单</p>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">我的订单</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg whitespace-nowrap transition',
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            全部订单
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setFilter(status as OrderStatus)}
              className={cn(
                'px-4 py-2 rounded-lg whitespace-nowrap transition',
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {config.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无订单</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        订单号: {order.id.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                        statusConfig[order.status].color
                      )}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[order.status].label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700">
                        {order.type === 'purchase' ? '购买' : '交换'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.id === order.sellerId ? '买家' : '卖家'}订单
                      </p>
                    </div>

                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        {user?.id === order.sellerId && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                        {user?.id === order.buyerId && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            取消
                          </button>
                        )}
                      </div>
                    )}
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
