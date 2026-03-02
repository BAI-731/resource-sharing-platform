import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Share2, Check, X, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserTrustBadge } from '@/components/UserTrustBadge';
import { ExchangeMatcher } from '@/components/ExchangeMatcher';
import { FaceToFaceTrade } from '@/components/FaceToFaceTrade';
import { BundlePicker } from '@/components/BundlePicker';

export function ExchangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  // 模拟我的交换物品列表（实际应该从state或localStorage获取）
  const [myExchangeItems, setMyExchangeItems] = useState<any[]>([]);

  // 查找物品（从平台物品和我的物品中查找）
  const platformItem = state.items.find(item => item.id === id);
  const myItem = myExchangeItems.find(item => item.id === id);
  const item = platformItem || myItem;

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!item) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">物品不存在</h2>
          <p className="text-text-secondary mb-4">该物品可能已被删除或不存在</p>
          <Button onClick={() => navigate('/exchange')}>返回交换页面</Button>
        </div>
      </div>
    );
  }

  // 获取所有图片
  const allImages = item.images ? [...item.images] : [item.image];

  // 切换收藏
  const isFavorite = state.favorites.itemIds.includes(item.id);
  const toggleFavorite = () => {
    dispatch({
      type: 'TOGGLE_FAVORITE',
      payload: { id: item.id, resourceType: 'item' },
    });
  };

  // 增加浏览量
  React.useEffect(() => {
    dispatch({ type: 'INCREMENT_VIEWS', payload: item.id });
    dispatch({
      type: 'ADD_TO_HISTORY',
      payload: { id: item.id, type: 'item' },
    });
  }, [item.id, dispatch]);

  // 模拟卖家信息
  const sellerInfo = {
    name: item.contact.split(' ')[0] || '同学',
    studentId: '202100****',
    department: '计算机系',
    major: '计算机科学与技术',
    buildingNumber: item.buildingName?.match(/\d+/)?.[0] || '3',
    roomNumber: '502',
    riskLevel: 'low' as const,
    trustScore: 95,
    cancelledOrders: 0,
  };

  const handleRequestExchange = (offerItem: any, requestItem: any) => {
    alert(`已发送交换请求：${offerItem.title} ⟷ ${requestItem.title}`);
    navigate('/exchange');
  };

  const handleTradeComplete = () => {
    alert('交易完成！');
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleFavorite}>
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            <Button variant="ghost">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧：图片 */}
          <div>
            {/* 主图 */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 cursor-pointer"
                 onClick={() => setShowImageModal(true)}>
              <img
                src={allImages[selectedImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.availableForExchange && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                    <Check className="w-4 h-4 mr-1" />
                    可交换
                  </Badge>
                </div>
              )}
            </div>

            {/* 缩略图 */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：信息 */}
          <div className="space-y-6">
            {/* 标题和价格 */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">{item.title}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ¥{item.price}
                </span>
                <span className="text-text-secondary text-sm">
                  估值 · 仅参考
                </span>
              </div>
            </div>

            {/* 位置和时间 */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
              {item.buildingName && <span>· {item.buildingName}</span>}
              <span>· {item.createdAt}</span>
              <span>· {item.views}人看过</span>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {item.category && (
                <Badge>{item.category}</Badge>
              )}
              {item.deliveryType === 'pickup' && (
                <Badge className="bg-green-100 text-green-800">仅自提</Badge>
              )}
              {item.deliveryType === 'delivery' && (
                <Badge className="bg-blue-100 text-blue-800">可上门</Badge>
              )}
              {item.deliveryType === 'both' && (
                <Badge className="bg-purple-100 text-purple-800">可上门/自提</Badge>
              )}
              {item.deliverySpeed === 'fast' && (
                <Badge className="bg-orange-100 text-orange-800">10分钟达</Badge>
              )}
              {item.allowBundle && (
                <Badge className="bg-teal-100 text-teal-800">可拼单</Badge>
              )}
            </div>

            {/* 描述 */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-3">物品描述</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* 卖家信息 */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-3">卖家信息</h3>
              <UserTrustBadge
                userProfile={sellerInfo}
                isSameBuilding={item.buildingName?.includes('3')}
                isSameDormitory={false}
                isSameMajor={sellerInfo.major === '计算机科学与技术'}
              />
            </div>

            {/* 交易按钮 */}
            <div className="space-y-3">
              {item.availableForExchange && (
                <ExchangeMatcher
                  currentItem={item}
                  allItems={state.items}
                  onExchangeRequest={handleRequestExchange}
                />
              )}

              <FaceToFaceTrade
                resourceId={item.id}
                sellerName={sellerInfo.name}
                sellerPhone={item.contact}
                price={item.price}
                onTradeComplete={handleTradeComplete}
              />

              {item.allowBundle && (
                <BundlePicker
                  availableItems={state.items.filter(i => i.sellerId === item.sellerId)}
                  onCreateBundle={(itemIds) => {
                    alert(`已创建拼单，包含 ${itemIds.length} 件商品`);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 图片放大模态框 */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={allImages[selectedImageIndex]}
              alt={item.title}
              className="w-full h-auto rounded-lg"
            />
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      selectedImageIndex === index ? 'bg-white' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
