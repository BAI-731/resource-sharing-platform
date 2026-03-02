import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, SortDesc, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CAMPUS_ZONES, CampusZone } from '@/types';

interface LocationFilterProps {
  resources: any[];
  onSortedResources: (sorted: any[]) => void;
  userLocation?: { lat: number; lng: number };
}

export function LocationFilter({ resources, onSortedResources, userLocation }: LocationFilterProps) {
  const [sortByDistance, setSortByDistance] = useState(false);
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(userLocation || null);

  // 清华大学各区域坐标模拟
  const campusCoordinates: Record<string, { lat: number; lng: number }> = {
    '紫荆公寓': { lat: 40.0050, lng: 116.3300 },
    '理科图书馆': { lat: 40.0000, lng: 116.3260 },
    '综合体育馆': { lat: 40.0030, lng: 116.3340 },
    '图书馆': { lat: 40.0005, lng: 116.3265 },
    '教学楼': { lat: 40.0010, lng: 116.3280 },
  };

  const calculateDistance = (loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }) => {
    const R = 6371; // 地球半径(km)
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('获取位置失败:', error);
          // 默认使用紫荆公寓位置
          setUserLoc(campusCoordinates['紫荆公寓']);
        }
      );
    } else {
      setUserLoc(campusCoordinates['紫荆公寓']);
    }
  };

  useEffect(() => {
    let sorted = [...resources];

    // 按校园区域筛选
    if (selectedZone) {
      sorted = sorted.filter(resource => resource.campusZone === selectedZone);
    }

    // 计算距离并排序
    if (userLoc) {
      sorted = sorted.map(resource => {
        // 查找资源所在建筑物的坐标
        const coord = Object.entries(campusCoordinates).find(([building]) =>
          resource.buildingName && resource.buildingName.includes(building)
        );

        if (coord) {
          const distance = calculateDistance(userLoc, coord[1]);
          return { ...resource, distance, distanceText: `${distance.toFixed(2)}km` };
        }

        return { ...resource, distance: Infinity, distanceText: '未知' };
      });

      // 按距离排序
      if (sortByDistance) {
        sorted.sort((a, b) => a.distance - b.distance);
      }
    }

    onSortedResources(sorted);
  }, [sortByDistance, selectedZone, userLoc, resources]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">校园位置</h3>
        </div>
        {!userLoc && (
          <Button size="sm" variant="outline" className="gap-2" onClick={handleGetLocation}>
            <Navigation className="w-4 h-4" />
            定位我
          </Button>
        )}
      </div>

      {userLoc && (
        <div className="space-y-3">
          <Badge className="bg-green-100 text-green-700">
            ✓ 已定位：紫荆公寓
          </Badge>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={sortByDistance ? 'primary' : 'outline'}
              className="flex-1 gap-2"
              onClick={() => setSortByDistance(!sortByDistance)}
            >
              <SortDesc className="w-4 h-4" />
              按距离排序
            </Button>
          </div>

          <div>
            <p className="text-xs text-text-secondary mb-2">按区域筛选</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedZone === null ? 'primary' : 'outline'}
                onClick={() => setSelectedZone(null)}
              >
                全部
              </Button>
              {CAMPUS_ZONES.map(zone => (
                <Button
                  key={zone.value}
                  size="sm"
                  variant={selectedZone === zone.value ? 'primary' : 'outline'}
                  onClick={() => setSelectedZone(zone.value)}
                  className="gap-1"
                >
                  {zone.icon} {zone.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
