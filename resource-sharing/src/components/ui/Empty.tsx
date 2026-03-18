import React from 'react';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Search,
  ShoppingBag,
  Heart,
  Package,
  AlertCircle,
} from 'lucide-react';

export interface EmptyProps {
  type?: 'default' | 'search' | 'orders' | 'favorites' | 'items' | 'error';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Empty({
  type = 'default',
  title,
  description,
  action,
  className,
}: EmptyProps) {
  const config = {
    default: {
      icon: Inbox,
      defaultTitle: '暂无数据',
      defaultDescription: '这里暂时没有任何内容',
    },
    search: {
      icon: Search,
      defaultTitle: '未找到结果',
      defaultDescription: '尝试换个关键词搜索看看',
    },
    orders: {
      icon: ShoppingBag,
      defaultTitle: '暂无订单',
      defaultDescription: '你还没有任何订单，快去浏览商品吧',
    },
    favorites: {
      icon: Heart,
      defaultTitle: '暂无收藏',
      defaultDescription: '收藏你喜欢的商品，方便随时查看',
    },
    items: {
      icon: Package,
      defaultTitle: '暂无商品',
      defaultDescription: '这里还没有任何商品发布',
    },
    error: {
      icon: AlertCircle,
      defaultTitle: '出错了',
      defaultDescription: '加载失败，请稍后重试',
    },
  };

  const { icon: Icon, defaultTitle, defaultDescription } = config[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-gray-500 max-w-sm mb-6">{description || defaultDescription}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
