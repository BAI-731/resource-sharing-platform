import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Filter, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ResourceCard } from '@/components/ResourceCard';
import { Button } from '@/components/ui/Button';
import { SKILL_CATEGORIES, SkillCategory } from '@/types';
import { cn } from '@/lib/utils';

export function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>(
    (searchParams.get('category') as SkillCategory) || 'all'
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const filteredSkills = useMemo(() => {
    let result = state.skills;

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter(
        (skill) =>
          skill.title.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((skill) => skill.category === selectedCategory);
    }

    result = result.filter(
      (skill) => skill.price >= priceRange[0] && skill.price <= priceRange[1]
    );

    return result;
  }, [state.skills, state.searchQuery, selectedCategory, priceRange]);

  const handleCategoryChange = (category: SkillCategory | 'all') => {
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
    setPriceRange([0, 5000]);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 5000;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">技能服务</h1>
          </div>
          <p className="text-text-secondary">
            发现专业技能，让服务触手可及
          </p>
        </div>

        <div className="flex gap-8">
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
                  {SKILL_CATEGORIES.map((cat) => (
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
                    value={priceRange[1] === 5000 ? '' : priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value) || 5000])
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
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

            <div className="mb-6 flex items-center justify-between">
              <p className="text-text-secondary">
                共找到 <span className="font-semibold text-text-primary">{filteredSkills.length}</span> 项服务
              </p>
              {state.searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">搜索: "{state.searchQuery}"</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {filteredSkills.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSkills.map((skill) => (
                  <ResourceCard key={skill.id} resource={skill} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">暂无服务</h3>
                <p className="text-text-secondary mb-6">试试调整筛选条件或发布你的技能服务</p>
                <Button onClick={clearFilters}>清除筛选</Button>
              </div>
            )}
          </div>
        </div>
      </div>

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
                  {SKILL_CATEGORIES.map((cat) => (
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
