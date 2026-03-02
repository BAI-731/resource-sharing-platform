import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Search, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ITEM_CATEGORIES, CAMPUS_ZONES, ItemCategory, CampusZone } from '@/types';
import { generateId } from '@/lib/utils';

export function ExchangePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 用户上传的交换物品
  const [myExchangeItems, setMyExchangeItems] = useState<any[]>([]);

  // 上传表单
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '' as ItemCategory,
    estimatedPrice: '',
    campusZone: '' as CampusZone,
    buildingName: '',
    images: [] as string[],
  });

  // 过滤可交换物品
  const availableForExchange = state.items.filter(item => item.availableForExchange);

  // 搜索过滤
  const filteredItems = availableForExchange.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem = {
      id: generateId(),
      type: 'item' as const,
      title: uploadForm.title,
      description: uploadForm.description,
      price: Number(uploadForm.estimatedPrice) || 0,
      image: uploadForm.images[0] || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop',
      category: uploadForm.category,
      contact: '我的联系方式',
      location: '清华大学',
      campusZone: uploadForm.campusZone,
      buildingName: uploadForm.buildingName,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      isFeatured: false,
      availableForExchange: true,
      sellerId: 'my-user-id',
      images: uploadForm.images,
    };

    setMyExchangeItems(prev => [newItem, ...prev]);
    setShowUploadModal(false);
    setUploadForm({
      title: '',
      description: '',
      category: '' as ItemCategory,
      estimatedPrice: '',
      campusZone: '' as CampusZone,
      buildingName: '',
      images: [],
    });

    alert('交换物品发布成功！');
  };

  const handleAddImage = () => {
    // 模拟添加图片
    const mockImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setUploadForm(prev => ({
      ...prev,
      images: [...prev.images, randomImage],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setUploadForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteMyItem = (itemId: string) => {
    if (confirm('确定要删除这个交换物品吗？')) {
      setMyExchangeItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">以物易物</h1>
              <p className="text-text-secondary">
                发布你的物品，找到合适的交换对象，无需花钱也能获得心仪物品
              </p>
            </div>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-5 h-5" />
              发布交换物品
            </Button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="搜索交换物品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 我的交换物品 */}
        {myExchangeItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">我的交换物品 ({myExchangeItems.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {myExchangeItems.map(item => (
                <Link
                  key={item.id}
                  to={`/exchange/${item.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group relative"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteMyItem(item.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        我要交换
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>估值：¥{item.price}</span>
                      {item.buildingName && <span>{item.buildingName}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 平台可交换物品 */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            平台可交换物品 ({filteredItems.length})
          </h2>
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                暂无交换物品
              </h3>
              <p className="text-text-secondary mb-4">
                发布你的第一个交换物品，开始物物交换吧
              </p>
              <Button
                variant="primary"
                className="gap-2"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-5 h-5" />
                发布交换物品
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredItems.map(item => (
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
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        可交换
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>估值：¥{item.price}</span>
                      {item.buildingName && <span>{item.buildingName}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 上传模态框 */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* 头部 */}
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">发布交换物品</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleUpload} className="p-4 space-y-4">
                {/* 图片上传 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    物品图片
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {uploadForm.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`上传${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {uploadForm.images.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                          <span className="text-xs text-text-secondary">添加图片</span>
                        </div>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    最多上传5张图片，建议拍摄物品多角度照片
                  </p>
                </div>

                {/* 基本信息 */}
                <div className="bg-white rounded-xl p-4 space-y-4">
                  <Input
                    label="物品标题"
                    placeholder="如：iPad Air 5 64G 蓝色"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                  />

                  <Textarea
                    label="详细描述"
                    placeholder="请详细描述物品状况、使用时间、配件情况等"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={4}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        估值（元）
                      </label>
                      <Input
                        type="number"
                        placeholder="0表示免费"
                        value={uploadForm.estimatedPrice}
                        onChange={(e) => setUploadForm({ ...uploadForm, estimatedPrice: e.target.value })}
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        估值仅供参考，用于匹配合适的交换对象
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        分类
                      </label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as ItemCategory })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="">请选择分类</option>
                        {ITEM_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 位置信息 */}
                <div className="bg-white rounded-xl p-4 space-y-4">
                  <h4 className="font-semibold text-text-primary">位置信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        所在区域
                      </label>
                      <select
                        value={uploadForm.campusZone}
                        onChange={(e) => setUploadForm({ ...uploadForm, campusZone: e.target.value as CampusZone })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">请选择校园区域</option>
                        {CAMPUS_ZONES.map(zone => (
                          <option key={zone.value} value={zone.value}>
                            {zone.icon} {zone.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="具体位置"
                      placeholder="如：紫荆公寓3号楼"
                      value={uploadForm.buildingName}
                      onChange={(e) => setUploadForm({ ...uploadForm, buildingName: e.target.value })}
                    />
                  </div>
                </div>

                {/* 提示 */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">💡 交换建议</p>
                    <ul className="text-xs space-y-1">
                      <li>• 提供准确的物品描述和真实图片</li>
                      <li>• 合理估值，有助于匹配合适的交换对象</li>
                      <li>• 选择方便的见面地点进行交换</li>
                      <li>• 可以同时发布多个物品，增加交换机会</li>
                    </ul>
                  </div>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowUploadModal(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    确认发布
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
