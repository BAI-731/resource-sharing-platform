import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Image as ImageIcon, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ITEM_CATEGORIES, SKILL_CATEGORIES, CAMPUS_ZONES, ResourceType, ItemCategory, SkillCategory, CampusZone } from '@/types';
import { generateId, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function PublishPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [resourceType, setResourceType] = useState<ResourceType>('item');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后才能发布资源</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    contact: '',
    location: '清华大学',
    campusZone: '' as CampusZone,
    buildingName: '',
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop',
  });

  const categories = resourceType === 'item' ? ITEM_CATEGORIES : SKILL_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      alert('请先登录');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('resources').insert({
        seller_id: user.id,
        type: resourceType,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        image_url: formData.image,
        category: formData.category,
        contact: formData.contact,
        location: formData.location || '清华大学',
        campus_zone: formData.campusZone,
        building_name: formData.buildingName,
        views: 0,
        is_featured: false,
        available_for_exchange: false,
        delivery_type: 'both',
        delivery_speed: 'normal',
        is_free_gift: Number(formData.price) === 0,
        allow_bundle: false,
      }).select().single();

      if (error) throw error;

      const newResource = {
        id: data.id,
        sellerId: data.seller_id,
        type: data.type as ResourceType,
        title: data.title,
        description: data.description,
        price: data.price,
        image: data.image_url,
        category: data.category,
        contact: data.contact,
        location: data.location,
        campusZone: data.campus_zone,
        buildingName: data.building_name,
        views: data.views,
        isFeatured: data.is_featured,
        availableForExchange: data.available_for_exchange,
        deliveryType: data.delivery_type,
        deliverySpeed: data.delivery_speed,
        isFreeGift: data.is_free_gift,
        allowBundle: data.allow_bundle,
        createdAt: data.created_at,
      };

      if (resourceType === 'item') {
        dispatch({ type: 'ADD_ITEM', payload: newResource });
      } else {
        dispatch({ type: 'ADD_SKILL', payload: newResource });
      }

      alert('发布成功！');
      navigate(resourceType === 'item' ? '/items' : '/skills');
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">发布闲置</h1>
          </div>
          <p className="text-text-secondary">
            分享你的闲置物品或技能服务，让校园社区资源流动起来
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 类型选择 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-text-primary mb-4">选择发布类型</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setResourceType('item');
                  setFormData({ ...formData, category: '' });
                }}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  resourceType === 'item'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                )}
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-medium text-text-primary">闲置物品</div>
                <div className="text-sm text-text-muted">出售或转让不再需要的物品</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResourceType('skill');
                  setFormData({ ...formData, category: '' });
                }}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  resourceType === 'skill'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                )}
              >
                <div className="text-2xl mb-2">✨</div>
                <div className="font-medium text-text-primary">技能服务</div>
                <div className="text-sm text-text-muted">提供专业技能或服务</div>
              </button>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-text-primary mb-4">基本信息</h3>

            <Input
              label="标题"
              placeholder="请输入物品或服务标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Textarea
              label="详细描述"
              placeholder="请详细描述物品状况或服务内容"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label={resourceType === 'item' ? '价格 (元)' : '服务费用 (元/次)'}
                type="number"
                placeholder="0 表示免费"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 校园位置 */}
            {resourceType === 'item' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    所在区域
                  </label>
                  <select
                    value={formData.campusZone}
                    onChange={(e) => setFormData({ ...formData, campusZone: e.target.value as CampusZone })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">请选择校园区域</option>
                    {CAMPUS_ZONES.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.icon} {zone.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="具体位置"
                  placeholder="如：紫荆公寓3号楼"
                  value={formData.buildingName}
                  onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* 图片 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-text-primary mb-4">展示图片</h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={formData.image}
                  alt="预览"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e5e7eb/9ca3af?text=图片';
                  }}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="输入图片链接"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                <p className="text-xs text-text-muted mt-2">
                  支持输入图片链接，建议使用 16:9 比例的图片
                </p>
              </div>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-text-primary mb-4">联系方式</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="联系电话/邮箱"
                placeholder="请输入联系方式"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
              <Input
                label="所在地区"
                placeholder="如：北京市朝阳区"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? '发布中...' : '确认发布'}
              {!isSubmitting && <Upload className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
