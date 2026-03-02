import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Filter, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ResourceCard } from '@/components/ResourceCard';
import { Button } from '@/components/ui/Button';
import { ITEM_CATEGORIES, ItemCategory } from '@/types';
import { cn } from '@/lib/utils';

export function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>(
    (searchParams.get('category') as ItemCategory) || 'all'
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const filteredItems = useMemo(() => {
    let result = state.items;

    // 搜索过滤
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 价格过滤
    result = result.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    return result;
  }, [state.items, state.searchQuery, selectedCategory, priceRange]);

  const handleCategoryChange = (category: ItemCategory | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">闲置物品</h1>
          </div>
          <p className="text-text-secondary">
            发现身边的闲置好物，让资源重新流动
          </p>
        </div>

        <div className="flex gap-8">
          {/* 侧边栏筛选 - 桌面端 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-text-primary">筛选条件</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    清除
                  </button>
                )}
              </div>

              {/* 分类筛选 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-text-primary mb-3">分类</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors',
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-50 text-text-secondary'
                    )}
                  >
                    全部分类
                  </button>
                  {ITEM_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2',
                        selectedCategory === cat.value
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-50 text-text-secondary'
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 价格筛选 */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">价格区间</h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="最低"
                    value={priceRange[0] || ''}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value) || 0, priceRange[1]])
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="number"
                    placeholder="最高"
                    value={priceRange[1] === 10000 ? '' : priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value) || 10000])
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* 主内容区 */}
          <div className="flex-1">
            {/* 移动端筛选按钮 */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="w-full gap-2"
              >
                <Filter className="w-5 h-5" />
                筛选
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    已选
                  </span>
                )}
              </Button>
            </div>

            {/* 结果统计 */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-text-secondary">
                共找到 <span className="font-semibold text-text-primary">{filteredItems.length}</span> 件物品
              </p>
              {state.searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">搜索: "{state.searchQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchParams({});
                      state.searchQuery = '';
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 物品列表 */}
            {filteredItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">暂无物品</h3>
                <p className="text-text-secondary mb-6">试试调整筛选条件或发布你的闲置物品</p>
                <Button onClick={clearFilters}>清除筛选</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端筛选弹窗 */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">筛选条件</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">分类</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={cn(
                      'px-4 py-2 rounded-full transition-colors',
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary'
                    )}
                  >
                    全部
                  </button>
                  {ITEM_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={cn(
                        'px-4 py-2 rounded-full transition-colors',
                        selectedCategory === cat.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-secondary'
                      )}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  清除
                </Button>
                <Button onClick={() => setShowFilters(false)} className="flex-1">
                  应用
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
