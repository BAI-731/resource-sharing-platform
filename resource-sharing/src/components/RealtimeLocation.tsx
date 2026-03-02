import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, CheckCircle, Loader2, X, Edit2, Locate, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RealtimeLocationProps {
  onLocationUpdate: (location: { name: string; lat: number; lng: number }) => void;
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

// 高德地图API密钥 - 优先从环境变量读取
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || 'af1a9391257bf08e0e650f5c5870d338';

// 高德地图逆地理编码API
const AMAP_REVERSE_GEOCODING_URL = 'https://restapi.amap.com/v3/geocode/regeo';

export function RealtimeLocation({ onLocationUpdate }: RealtimeLocationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [useOfflineMode, setUseOfflineMode] = useState(false);

  // 预设地点列表（作为离线备用）
  const presetLocations = [
    { name: '清华大学', lat: 40.0000, lng: 116.3260 },
    { name: '北京大学', lat: 39.9929, lng: 116.3103 },
    { name: '复旦大学', lat: 31.2989, lng: 121.5034 },
    { name: '上海交通大学', lat: 31.2054, lng: 121.4372 },
    { name: '浙江大学', lat: 30.2637, lng: 120.1277 },
    { name: '南京大学', lat: 32.0579, lng: 118.7779 },
    { name: '华中科技大学', lat: 30.5145, lng: 114.4140 },
    { name: '武汉大学', lat: 30.5419, lng: 114.3935 },
    { name: '中山大学', lat: 23.1291, lng: 113.2644 },
    { name: '四川大学', lat: 30.6586, lng: 104.0647 },
    { name: '西安交通大学', lat: 34.2433, lng: 108.9148 },
    { name: '哈尔滨工业大学', lat: 45.7489, lng: 126.6527 },
    { name: '海南大学', lat: 20.0440, lng: 110.3190 },
    { name: '海南师范大学', lat: 20.0453, lng: 110.3531 },
    { name: '华南热带农业大学', lat: 20.0503, lng: 110.3329 },
  ];

  // Haversine公式计算距离
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // 地球半径
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 使用高德地图API进行逆地理编码
  const getPlaceNameFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `${AMAP_REVERSE_GEOCODING_URL}?key=${AMAP_KEY}&location=${lng},${lat}&extensions=base`;

      console.log('调用高德地图API:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('高德地图API响应:', data);

      if (data.status === '1' && data.regeocode) {
        // 提取POI信息或格式化地址
        const { formatted_address, pois } = data.regeocode;

        console.log('逆地理编码成功:', { formatted_address, pois });

        // 如果有POI（兴趣点），优先显示POI名称
        if (pois && pois.length > 0) {
          return pois[0].name;
        }

        // 否则使用格式化地址
        return formatted_address;
      }

      // API返回失败状态
      const errorMsg = data.info || '逆地理编码失败';
      console.error('高德地图API返回错误:', errorMsg);
      throw new Error(errorMsg);
    } catch (err) {
      console.error('高德地图API调用失败:', err);
      // API调用失败，回退到离线模式
      setUseOfflineMode(true);
      throw err;
    }
  };

  // 离线模式：匹配最近的预设地点
  const getClosestPresetLocation = (lat: number, lng: number): LocationData => {
    let closestLocation = presetLocations[0];
    let minDistance = Infinity;

    presetLocations.forEach(loc => {
      const distance = calculateDistance(lat, lng, loc.lat, loc.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = loc;
      }
    });

    return {
      ...closestLocation,
      address: `距离 ${closestLocation.name} ${minDistance < 1 ? `${(minDistance * 1000).toFixed(0)}米` : `${minDistance.toFixed(2)}公里`}`,
    };
  };

  // 获取当前位置
  const getCurrentPosition = async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('浏览器不支持定位功能');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          console.log('定位成功:', { lat, lng, accuracy: `${accuracy}米` });

          let locationData: LocationData;

          try {
            // 优先使用高德地图API获取真实地名
            const placeName = await getPlaceNameFromCoordinates(lat, lng);
            locationData = {
              name: placeName,
              lat,
              lng,
            };
          } catch (err) {
            // API失败，使用离线模式匹配
            locationData = getClosestPresetLocation(lat, lng);
            console.log('使用离线模式匹配:', locationData);
          }

          setCurrentLocation(locationData);
          onLocationUpdate(locationData);
          setSuccess(true);
          setError(null);

          // 保存到localStorage
          localStorage.setItem(
            'userLocation',
            JSON.stringify({
              ...locationData,
              timestamp: Date.now(),
            })
          );

          resolve(locationData);
        },
        (error) => {
          let errorMessage = '定位失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '用户拒绝了定位请求';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置信息不可用';
              break;
            case error.TIMEOUT:
              errorMessage = '定位请求超时';
              break;
            default:
              errorMessage = '未知错误';
          }
          console.error('定位错误:', error);
          setError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // 手动选择地点
  const handleManualSelect = (location: typeof presetLocations[0]) => {
    const locationData = {
      ...location,
      address: undefined,
    };
    setCurrentLocation(locationData);
    onLocationUpdate(locationData);
    setSuccess(true);
    setError(null);
    setShowManualModal(false);
    setManualLocation('');

    // 保存到localStorage
    localStorage.setItem(
      'userLocation',
      JSON.stringify({
        ...locationData,
        timestamp: Date.now(),
      })
    );
  };

  // 手动输入地点
  const handleManualSubmit = () => {
    if (!manualLocation.trim()) return;

    const locationData: LocationData = {
      name: manualLocation.trim(),
      lat: 0,
      lng: 0,
    };

    setCurrentLocation(locationData);
    onLocationUpdate(locationData);
    setSuccess(true);
    setError(null);
    setShowManualModal(false);
    setManualLocation('');

    // 保存到localStorage
    localStorage.setItem(
      'userLocation',
      JSON.stringify({
        ...locationData,
        timestamp: Date.now(),
      })
    );
  };

  const handleRefreshLocation = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    getCurrentPosition();
  };

  // 加载保存的位置
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        // 检查位置是否过期（10分钟）
        if (Date.now() - parsed.timestamp < 600000) {
          setCurrentLocation({
            name: parsed.name,
            lat: parsed.lat,
            lng: parsed.lng,
          });
          onLocationUpdate(parsed);
          setSuccess(true);
        }
      } catch (err) {
        console.error('加载保存的位置失败:', err);
      }
    }
  }, [onLocationUpdate]);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm text-text-primary">位置设置</h3>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setShowManualModal(true)}
            >
              <Edit2 className="w-4 h-4" />
              手动设置
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleRefreshLocation}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {loading ? '定位中...' : '重新定位'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 rounded-lg p-3 mb-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">定位失败</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && currentLocation && (
          <div className="bg-green-50 rounded-lg p-3 mb-3 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800 flex-1">
              <p className="font-semibold">当前位置</p>
              <p className="text-xs mt-1 font-medium">{currentLocation.name}</p>
              {currentLocation.address && (
                <p className="text-xs text-green-700 mt-1">{currentLocation.address}</p>
              )}
              {useOfflineMode && (
                <Badge className="mt-2 bg-yellow-100 text-yellow-800 text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  离线模式
                </Badge>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 rounded-lg p-3 mb-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-800">正在获取您的位置...</span>
          </div>
        )}

        {!currentLocation && !error && !loading && (
          <Button
            variant="primary"
            className="w-full gap-2"
            onClick={handleRefreshLocation}
          >
            <Locate className="w-5 h-5" />
            自动定位我的位置
          </Button>
        )}

        {currentLocation && (
          <div className="text-xs text-text-secondary space-y-1">
            <p>💡 提示：</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>点击"自动定位"使用GPS获取位置</li>
              <li>点击"手动设置"选择或输入地点</li>
              <li>支持常见大学和校园地点</li>
              <li>位置信息缓存10分钟</li>
            </ul>
          </div>
        )}
      </div>

      {/* 手动设置模态框 */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                手动设置位置
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-4 space-y-4">
              {/* 快速选择 */}
              <div>
                <p className="text-sm font-medium text-text-primary mb-3">快速选择</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {presetLocations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => handleManualSelect(loc)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{loc.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义输入 */}
              <div>
                <p className="text-sm font-medium text-text-primary mb-3">或自定义位置</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如：海南大学·海甸校区"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualSubmit();
                      }
                    }}
                  />
                  <Button onClick={handleManualSubmit} disabled={!manualLocation.trim()}>
                    确认
                  </Button>
                </div>
              </div>

              {/* 说明 */}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 选择位置后，系统将优先显示该地点附近的闲置物品和服务
                </p>
                {AMAP_KEY === '您的API密钥' && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                    <p className="text-xs text-yellow-800">
                      ⚠️ 当前使用离线模式，需要配置高德地图API密钥以获得精准定位
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 底部 */}
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowManualModal(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 导出计算距离的工具函数
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 导出格式化距离的工具函数
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(2)}km`;
}
