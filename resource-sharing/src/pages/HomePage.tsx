import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Sparkles, TrendingUp, Shield, Lightbulb, MapPin, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ResourceCard } from '@/components/ResourceCard';
import { RealtimeLocation } from '@/components/RealtimeLocation';
import { Button } from '@/components/ui/Button';
import { ITEM_CATEGORIES, SKILL_CATEGORIES } from '@/types';

export function HomePage() {
  const { state, getRecommendations } = useApp();
  const [userLocation, setUserLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);

  const featuredItems = state.items.filter((item) => item.isFeatured).slice(0, 4);
  const featuredSkills = state.skills.filter((skill) => skill.isFeatured).slice(0, 4);

  // 智能推荐
  const recommendedItems = getRecommendations('item').slice(0, 4);
  const recommendedSkills = getRecommendations('skill').slice(0, 4);
  const showRecommendations = recommendedItems.length > 0 || recommendedSkills.length > 0;

  // 可交换物品
  const exchangeItems = state.items.filter((item) => item.availableForExchange).slice(0, 4);

  const stats = [
    { value: state.items.length + state.skills.length, label: '在架资源' },
    { value: state.favorites.itemIds.length + state.favorites.skillIds.length, label: '我的收藏' },
    { value: '1000+', label: '本校/社区成员' },
  ];

  const handleLocationUpdate = useCallback((location: { name: string; lat: number; lng: number }) => {
    setUserLocation(location);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary-light/10 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyRUNjNzEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 animate-fade-in">
              校园·社区
              <span className="text-primary block mt-2">本地资源共享平台</span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 animate-slide-up">
              就在身边的闲置物品交易、技能服务分享。同学间互助，邻里间互通，让资源在校园社区高效流动。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link
                to="/items"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium rounded-lg bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Package className="w-5 h-5" />
                浏览闲置
              </Link>
              <Link
                to="/exchange"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
              >
                <ArrowRightLeft className="w-5 h-5" />
                以物易物
              </Link>
              <Link
                to="/skills"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" />
                技能服务
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4" />
              <span>当前位置：{userLocation?.name || '未设置'}</span>
            </div>
            <div className="mt-4 max-w-md mx-auto">
              <RealtimeLocation onLocationUpdate={handleLocationUpdate} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 智能推荐 */}
      {showRecommendations && (
        <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-primary-light/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">为你推荐</h2>
                  <p className="text-sm text-text-secondary">基于你的浏览和收藏历史</p>
                </div>
              </div>
            </div>
            
            {recommendedItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4">推荐物品</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedItems.map((item) => (
                    <ResourceCard key={item.id} resource={item} />
                  ))}
                </div>
              </div>
            )}
            
            {recommendedSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">推荐服务</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedSkills.map((skill) => (
                    <ResourceCard key={skill.id} resource={skill} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Quick Access */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 物品分类 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary">闲置物品</h2>
                <Link to="/items" className="text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {ITEM_CATEGORIES.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.value}
                    to={`/items?category=${cat.value}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs text-text-secondary">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 技能分类 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary">技能服务</h2>
                <Link to="/skills" className="text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  查看全部 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {SKILL_CATEGORIES.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.value}
                    to={`/skills?category=${cat.value}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs text-text-secondary">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">精选物品</h2>
            </div>
            <Link to="/items" className="text-primary flex items-center gap-1 hover:gap-2 transition-all">
              更多 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Items */}
      {exchangeItems.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <ArrowRightLeft className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">以物易物</h2>
                  <p className="text-sm text-text-secondary">无需花钱，用你的物品换心仪之物</p>
                </div>
              </div>
              <Link to="/exchange" className="text-primary flex items-center gap-1 hover:gap-2 transition-all">
                更多 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {exchangeItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/exchange/${item.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        可交换
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">估值：¥{item.price}</span>
                      {item.buildingName && (
                        <span className="text-xs text-text-secondary">{item.buildingName}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Skills */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">热门技能</h2>
            </div>
            <Link to="/skills" className="text-primary flex items-center gap-1 hover:gap-2 transition-all">
              更多 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSkills.map((skill) => (
              <ResourceCard key={skill.id} resource={skill} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">校园·社区专属</h2>
            <p className="text-text-secondary">就在你身边，放心安全</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">闲置变现</h3>
              <p className="text-text-secondary">宿舍、家中的闲置物品，同学邻里间快速交易，省心省力</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">技能互助</h3>
              <p className="text-text-secondary">课业辅导、技能教学、兴趣爱好，同学间互帮互学共同进步</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">同城交易</h3>
              <p className="text-text-secondary">基于校园社区地理范围，面对面交易更安全便捷</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - 更新为包含新功能 */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">创新功能</h2>
            <p className="text-text-secondary">让校园/社区资源共享更智能、更便捷</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/"
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">智能推荐</h3>
              <p className="text-sm text-text-secondary">基于你的专业兴趣，推荐身边同学闲置物品</p>
              <div className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">查看推荐 →</div>
            </Link>
            <Link
              to="/items"
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">评价系统</h3>
              <p className="text-sm text-text-secondary">同学间真实评价，了解物品和服务质量</p>
              <div className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">浏览物品 →</div>
            </Link>
            <Link
              to="/items"
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">物品交换</h3>
              <p className="text-sm text-text-secondary">以物易物，宿舍楼下、食堂门口当面交换</p>
              <div className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">开始交换 →</div>
            </Link>
            <Link
              to="/items"
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">区域定位</h3>
              <p className="text-sm text-text-secondary">精确到宿舍/教学楼，快速找到身边资源</p>
              <div className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">发现附近 →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">校园易物</span>
            </div>
            <p className="text-gray-400">© 2024 校园易物·让资源在校园社区流动</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
