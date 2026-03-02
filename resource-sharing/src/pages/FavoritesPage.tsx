import React, { useState } from 'react';
import { Heart, Package, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ResourceCard } from '@/components/ResourceCard';
import { cn } from '@/lib/utils';

type TabType = 'items' | 'skills';

export function FavoritesPage() {
  const { getFavoriteItems, getFavoriteSkills } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('items');

  const favoriteItems = getFavoriteItems();
  const favoriteSkills = getFavoriteSkills();

  const tabs = [
    { key: 'items' as TabType, label: '闲置物品', count: favoriteItems.length, icon: Package },
    { key: 'skills' as TabType, label: '技能服务', count: favoriteSkills.length, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">我的收藏</h1>
          </div>
          <p className="text-text-secondary">
            收藏你感兴趣的资源和物品
          </p>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 pb-4 px-2 transition-colors relative',
                activeTab === tab.key
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'ml-1 px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-muted'
                )}
              >
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* 收藏列表 */}
        {activeTab === 'items' ? (
          favoriteItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteItems.map((item) => (
                <ResourceCard key={item.id} resource={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="暂无收藏物品"
              description="浏览闲置物品时，可以点击心形图标收藏感兴趣的物品"
            />
          )
        ) : favoriteSkills.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteSkills.map((skill) => (
              <ResourceCard key={skill.id} resource={skill} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="暂无收藏服务"
            description="浏览技能服务时，可以点击心形图标收藏感兴趣的技能服务"
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-text-muted" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mx-auto">{description}</p>
    </div>
  );
}
