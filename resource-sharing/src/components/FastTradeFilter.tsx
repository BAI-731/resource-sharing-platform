import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Zap, Filter, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface FastTradeFilterProps {
  resources: any[];
  onFilteredResources: (filtered: any[]) => void;
  userLocation?: { lat: number; lng: number };
}

export function FastTradeFilter({ resources, onFilteredResources, userLocation }: FastTradeFilterProps) {
  const [distanceLimit, setDistanceLimit] = useState<number | null>(null);
  const [showFastOnly, setShowFastOnly] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [showFreeGift, setShowFreeGift] = useState(false);

  // 校园区域坐标
  const campusCoordinates: Record<string, { lat: number; lng: number }> = {
    '紫荆公寓': { lat: 40.0050, lng: 116.3300 },
    '理科图书馆': { lat: 40.0000, lng: 116.3260 },
    '综合体育馆': { lat: 40.0030, lng: 116.3340 },
    '图书馆': { lat: 40.0005, lng: 116.3265 },
    '教学楼': { lat: 40.0010, lng: 116.3280 },
  };

  const calculateDistance = (loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDeliveryLabel = (item: any) => {
    const labels: string[] = [];

    // 极速标签
    if (item.deliverySpeed === 'fast') {
      labels.push({ text: '10分钟达', color: 'bg-red-500 text-white' });
    } else if (item.distance && item.distance <= 1) {
      labels.push({ text: '楼下即取', color: 'bg-orange-500 text-white' });
    }

    // 配送方式标签
    if (item.deliveryType === 'delivery') {
      labels.push({ text: '可上门', color: 'bg-blue-500 text-white' });
    } else if (item.deliveryType === 'pickup') {
      labels.push({ text: '可自提', color: 'bg-green-500 text-white' });
    } else if (item.deliveryType === 'both') {
      labels.push({ text: '上门/自提', color: 'bg-purple-500 text-white' });
    }

    // 免费赠送标签
    if (item.price === 0 || item.isFreeGift) {
      labels.push({ text: '免费送', color: 'bg-pink-500 text-white' });
    }

    // 拼单标签
    if (item.allowBundle) {
      labels.push({ text: '可拼单', color: 'bg-teal-500 text-white' });
    }

    return labels;
  };

  useEffect(() => {
    let filtered = [...resources];

    // 距离筛选
    if (userLocation && distanceLimit) {
      filtered = filtered.map(resource => {
        const coord = Object.entries(campusCoordinates).find(([building]) =>
          resource.buildingName && resource.buildingName.includes(building)
        );

        if (coord) {
          const distance = calculateDistance(userLocation, coord[1]);
          return { ...resource, distance, distanceText: `${(distance * 1000).toFixed(0)}m` };
        }

        return { ...resource, distance: Infinity, distanceText: '未知' };
      });

      filtered = filtered.filter(r => r.distance <= distanceLimit / 1000);
    }

    // 极速筛选
    if (showFastOnly) {
      filtered = filtered.filter(r => r.deliverySpeed === 'fast' || (r.distance && r.distance <= 1));
    }

    // 配送方式筛选
    if (deliveryType === 'pickup') {
      filtered = filtered.filter(r => r.deliveryType === 'pickup' || r.deliveryType === 'both');
    } else if (deliveryType === 'delivery') {
      filtered = filtered.filter(r => r.deliveryType === 'delivery' || r.deliveryType === 'both');
    }

    // 免费赠送筛选
    if (showFreeGift) {
      filtered = filtered.filter(r => r.price === 0 || r.isFreeGift);
    }

    // 为每个资源添加标签
    filtered = filtered.map(resource => ({
      ...resource,
      deliveryLabels: getDeliveryLabel(resource),
    }));

    onFilteredResources(filtered);
  }, [distanceLimit, showFastOnly, deliveryType, showFreeGift, userLocation, resources]);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-text-primary">极速交易</h3>
        <Badge className="bg-orange-500 text-white ml-auto">30分钟内</Badge>
      </div>

      <div className="space-y-3">
        {/* 距离筛选 */}
        <div>
          <p className="text-xs text-text-secondary mb-2">距离筛选</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={distanceLimit === null ? 'primary' : 'outline'}
              onClick={() => setDistanceLimit(null)}
              className="flex-1"
            >
              全部
            </Button>
            <Button
              size="sm"
              variant={distanceLimit === 1000 ? 'primary' : 'outline'}
              onClick={() => setDistanceLimit(1000)}
              className="flex-1"
            >
              1km内
            </Button>
            <Button
              size="sm"
              variant={distanceLimit === 3000 ? 'primary' : 'outline'}
              onClick={() => setDistanceLimit(3000)}
              className="flex-1"
            >
              3km内
            </Button>
          </div>
        </div>

        {/* 配送方式 */}
        <div>
          <p className="text-xs text-text-secondary mb-2">配送方式</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={deliveryType === 'all' ? 'primary' : 'outline'}
              onClick={() => setDeliveryType('all')}
              className="flex-1 gap-1"
            >
              <MapPin className="w-4 h-4" />
              全部
            </Button>
            <Button
              size="sm"
              variant={deliveryType === 'pickup' ? 'primary' : 'outline'}
              onClick={() => setDeliveryType('pickup')}
              className="flex-1"
            >
              可自提
            </Button>
            <Button
              size="sm"
              variant={deliveryType === 'delivery' ? 'primary' : 'outline'}
              onClick={() => setDeliveryType('delivery')}
              className="flex-1"
            >
              可上门
            </Button>
          </div>
        </div>

        {/* 特殊筛选 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showFastOnly ? 'primary' : 'outline'}
            onClick={() => setShowFastOnly(!showFastOnly)}
            className="flex-1 gap-1"
          >
            <Clock className="w-4 h-4" />
            {showFastOnly ? '✓' : ''} 极速达
          </Button>
          <Button
            size="sm"
            variant={showFreeGift ? 'primary' : 'outline'}
            onClick={() => setShowFreeGift(!showFreeGift)}
            className="flex-1 gap-1"
          >
            {showFreeGift ? '✓' : ''} 免费送
          </Button>
        </div>
      </div>
    </div>
  );
}

export function getDeliveryLabels(item: any) {
  const labels: { text: string; color: string }[] = [];

  if (item.deliverySpeed === 'fast') {
    labels.push({ text: '10分钟达', color: 'bg-red-500 text-white' });
  } else if (item.distance && item.distance <= 0.001) {
    labels.push({ text: '楼下即取', color: 'bg-orange-500 text-white' });
  }

  if (item.deliveryType === 'delivery') {
    labels.push({ text: '可上门', color: 'bg-blue-500 text-white' });
  } else if (item.deliveryType === 'pickup') {
    labels.push({ text: '可自提', color: 'bg-green-500 text-white' });
  } else if (item.deliveryType === 'both') {
    labels.push({ text: '上门/自提', color: 'bg-purple-500 text-white' });
  }

  if (item.price === 0 || item.isFreeGift) {
    labels.push({ text: '免费送', color: 'bg-pink-500 text-white' });
  }

  if (item.allowBundle) {
    labels.push({ text: '可拼单', color: 'bg-teal-500 text-white' });
  }

  return labels;
}
