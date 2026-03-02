import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Eye, MapPin, Calendar, Phone, Mail, Share2, Package, Sparkles, Star, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ReviewForm } from '@/components/ReviewForm';
import { ExchangeRequest } from '@/components/ExchangeRequest';
import { ITEM_CATEGORIES, SKILL_CATEGORIES } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch, isFavorite, addReview } = useApp();

  // 通过路由路径判断资源类型
  const isItemRoute = location.pathname.startsWith('/items');
  const resourceType: 'item' | 'skill' = isItemRoute ? 'item' : 'skill';
  const resources = resourceType === 'item' ? state.items : state.skills;
  const resource = resources.find((r) => r.id === id);
  const favorite = resource ? isFavorite(resource.id, resource.type) : false;

  const categories = resourceType === 'item' ? ITEM_CATEGORIES : SKILL_CATEGORIES;
  const category = resource?.category ? categories.find((c) => c.value === resource.category) : null;

  useEffect(() => {
    if (id) {
      dispatch({ type: 'INCREMENT_VIEWS', payload: id });
      dispatch({ type: 'ADD_TO_HISTORY', payload: { id, type: resourceType } });
    }
  }, [id, dispatch, resourceType]);

  if (!resource) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">资源不存在</h2>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    );
  }

  const handleFavorite = () => {
    dispatch({
      type: 'TOGGLE_FAVORITE',
      payload: { id: resource.id, resourceType: resource.type },
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mt-6 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 图片区域 */}
          <div className="relative aspect-[16/9] md:aspect-[2/1]">
            <img
              src={resource.image}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            {resource.isFeatured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-primary-light text-white">
                精选推荐
              </Badge>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleFavorite}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm',
                  favorite
                    ? 'bg-primary text-white shadow-lg scale-110'
                    : 'bg-white/90 text-text-muted hover:bg-white hover:text-primary shadow-md'
                )}
              >
                <Heart className={cn('w-6 h-6', favorite && 'fill-current')} />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-text-muted hover:text-primary shadow-md transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* 标题和价格 */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{category?.icon}</span>
                  <span className="text-sm text-text-muted">{category?.label}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {resource.title}
                </h1>
              </div>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(resource.price)}
                </div>
                {resource.price === 0 && (
                  <span className="text-sm text-text-muted">可免费领取</span>
                )}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-text-secondary">
                <Eye className="w-5 h-5" />
                <span>{resource.views} 次浏览</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-5 h-5" />
                <span>{resource.location}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-5 h-5" />
                <span>发布于 {formatDate(resource.createdAt)}</span>
              </div>
              {resource.rating && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>{resource.rating.toFixed(1)} ({resource.ratingCount}条评价)</span>
                </div>
              )}
            </div>

            {/* 描述 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">详细描述</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>

            {/* 联系方式 */}
            <div className="bg-gradient-to-br from-primary/5 to-primary-light/10 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">联系方式</h2>
              <div className="space-y-3">
                {resource.contact.includes('@') ? (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-text-primary">{resource.contact}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-text-primary">{resource.contact}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleFavorite}
                variant={favorite ? 'secondary' : 'primary'}
                className="flex-1 gap-2"
              >
                <Heart className={cn('w-5 h-5', favorite && 'fill-current')} />
                {favorite ? '取消收藏' : '立即收藏'}
              </Button>
              {resourceType === 'item' && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate('/items')}
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  请求交换
                </Button>
              )}
              {resourceType === 'item' ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate('/items')}
                >
                  <Package className="w-5 h-5" />
                  查看更多物品
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate('/skills')}
                >
                  <Sparkles className="w-5 h-5" />
                  查看更多服务
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 评价系统 */}
        <div className="mt-8">
          <ReviewForm
            resourceId={resource.id}
            resourceType={resource.type}
            existingReviews={state.reviews.filter(r => r.resourceId === resource.id)}
          />
        </div>

        {/* 物品交换(仅物品类型显示) */}
        {resourceType === 'item' && resource.availableForExchange && (
          <div className="mt-8">
            <ExchangeRequest />
          </div>
        )}

        {/* 相关推荐 */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-text-primary mb-6">相关推荐</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources
              .filter((r) => r.id !== resource.id && r.category === resource.category)
              .slice(0, 4)
              .map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/${isItemRoute ? 'items' : 'skills'}/${r.id}`)}
                >
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-text-primary line-clamp-1">{r.title}</h3>
                    <p className="text-primary font-semibold">{formatPrice(r.price)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
