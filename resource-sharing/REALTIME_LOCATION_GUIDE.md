# 实时定位功能说明

## 📌 功能概述

实现了基于浏览器原生Geolocation API的实时定位功能，能够获取用户的真实地理位置并进行持续更新。

---

## 🚀 功能特性

### 1. 高精度定位
- ✅ 使用 `enableHighAccuracy: true` 启用GPS高精度模式
- ✅ 支持移动设备和桌面设备
- ✅ 实时显示定位精度（米）

### 2. 实时更新
- ✅ 使用 `watchPosition` 持续监听位置变化
- ✅ 自动更新位置信息
- ✅ 30秒后自动停止监听（节省电量）
- ✅ 可手动刷新位置

### 3. 反向地理编码
- ✅ 使用高德地图API将坐标转换为地址
- ✅ 显示详细地址信息
- ✅ 支持缓存地址信息

### 4. 错误处理
- ✅ 用户拒绝定位权限提示
- ✅ 定位超时处理
- ✅ 位置信息不可用处理
- ✅ 友好的错误提示

### 5. 缓存机制
- ✅ 位置信息缓存到localStorage
- ✅ 缓存有效期10分钟
- ✅ 页面刷新后自动加载缓存

---

## 📱 使用方法

### 集成到页面

```tsx
import { RealtimeLocation } from '@/components/RealtimeLocation';

export function YourPage() {
  const [userLocation, setUserLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const handleLocationUpdate = (location: {
    address: string;
    lat: number;
    lng: number;
  }) => {
    setUserLocation(location);
    console.log('位置更新:', location);
  };

  return (
    <div>
      <RealtimeLocation onLocationUpdate={handleLocationUpdate} />
      {userLocation && (
        <div>
          当前位置: {userLocation.address}
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 技术实现

### 1. 获取当前位置

```typescript
const getCurrentPosition = async (): Promise<{
  lat: number;
  lng: number;
  address: string;
} | null> => {
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

        console.log('定位成功:', {
          lat,
          lng,
          accuracy: `${accuracy}米`,
        });

        try {
          const address = await reverseGeocode(lat, lng);

          const locationData = {
            lat,
            lng,
            address,
          };

          setCurrentLocation(locationData);
          onLocationUpdate(locationData);
          setSuccess(true);
          setError(null);

          resolve(locationData);
        } catch (err) {
          setError('获取地址信息失败');
          resolve({
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
        }
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
```

### 2. 实时位置监听

```typescript
const startWatching = () => {
  if (!navigator.geolocation) {
    setError('浏览器不支持定位功能');
    return;
  }

  setLoading(true);
  setError(null);
  setSuccess(false);

  // 先获取一次当前位置
  getCurrentPosition();

  // 开启实时定位监听
  const watchIdValue = navigator.geolocation.watchPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      console.log('位置更新:', {
        lat,
        lng,
        accuracy: `${accuracy}米`,
        timestamp: new Date().toLocaleTimeString(),
      });

      try {
        const address = await reverseGeocode(lat, lng);

        const locationData = {
          lat,
          lng,
          address,
        };

        setCurrentLocation(locationData);
        onLocationUpdate(locationData);
        setLoading(false);
        setSuccess(true);
      } catch (err) {
        console.error('处理位置更新失败:', err);
      }
    },
    (error) => {
      console.error('实时定位错误:', error);
      setLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  );

  setWatchId(watchIdValue);

  // 30秒后停止监听
  setTimeout(() => {
    if (watchIdValue !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setLoading(false);
    }
  }, 30000);
};
```

### 3. 反向地理编码

```typescript
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // 使用高德地图API
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=YOUR_AMAP_KEY&location=${lng},${lat}&extensions=base`
    );

    if (!response.ok) {
      throw new Error('获取地址失败');
    }

    const data = await response.json();

    if (data.status === '1' && data.regeocode) {
      const formattedAddress = data.regeocode.formatted_address;
      const parts = formattedAddress.split(' ');
      if (parts.length >= 3) {
        return parts.slice(0, 3).join(' ');
      }
      return formattedAddress;
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    console.error('反向地理编码失败:', err);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};
```

### 4. 计算距离

```typescript
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // 地球半径(km)
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

// 格式化距离显示
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(2)}km`;
}
```

---

## ⚙️ 配置说明

### 定位参数

```typescript
{
  enableHighAccuracy: true,  // 高精度模式
  timeout: 10000,           // 10秒超时
  maximumAge: 0             // 不使用缓存
}
```

**参数说明：**
- `enableHighAccuracy`: 是否使用高精度模式（GPS）
- `timeout`: 定位请求超时时间（毫秒）
- `maximumAge`: 可接受的最旧缓存时间（毫秒）

### 缓存配置

```typescript
// 缓存位置到localStorage
localStorage.setItem('userLocation', JSON.stringify({
  lat,
  lng,
  address,
  timestamp: Date.now(),
}));

// 读取缓存
const savedLocation = localStorage.getItem('userLocation');
if (savedLocation) {
  const parsed = JSON.parse(savedLocation);
  // 检查是否过期（10分钟）
  if (Date.now() - parsed.timestamp < 600000) {
    // 使用缓存位置
  }
}
```

---

## 📊 UI状态说明

### 1. 未定位状态
- 显示"开始定位"按钮
- 点击后启动定位流程

### 2. 定位中状态
- 显示加载动画
- 显示"正在获取您的位置..."提示

### 3. 定位成功状态
- 显示绿色成功提示
- 显示地址信息
- 显示坐标信息
- 显示刷新按钮

### 4. 定位失败状态
- 显示红色错误提示
- 显示错误原因
- 可重试定位

---

## 🔐 权限说明

### 浏览器定位权限

**首次使用：**
1. 浏览器会弹出定位权限请求
2. 用户选择"允许"或"拒绝"
3. 选择"允许"后才能获取位置

**拒绝处理：**
- 显示友好的错误提示
- 引导用户在浏览器设置中允许定位

**权限类型：**
- GPS定位（高精度，需要设备支持）
- WiFi定位（中等精度）
- IP定位（低精度，最后备选）

---

## 🌍 地图API说明

### 高德地图API

**申请地址：** https://console.amap.com/

**API端点：**
```
https://restapi.amap.com/v3/geocode/regeo
```

**参数：**
- `key`: 您的API密钥
- `location`: 经度,纬度
- `extensions`: 返回数据类型

**响应示例：**
```json
{
  "status": "1",
  "regeocode": {
    "formatted_address": "北京市海淀区清华大学紫荆公寓"
  }
}
```

**注意：**
- 需要替换 `YOUR_AMAP_KEY` 为您的真实API密钥
- 免费配额通常足够个人使用
- 也可以使用百度地图或腾讯地图API

---

## 📱 设备兼容性

### 支持的设备

✅ **移动设备（推荐）**
- iOS Safari
- Android Chrome
- 微信内置浏览器

✅ **桌面设备**
- Chrome
- Firefox
- Safari
- Edge

❌ **不支持的设备**
- 不支持Geolocation API的老旧浏览器
- 禁用定位功能的设备

### 定位精度

| 设备类型 | 精度范围 | 说明 |
|---------|---------|------|
| GPS设备 | 5-20米 | 手机GPS，户外效果好 |
| WiFi定位 | 20-100米 | 城市WiFi密集区 |
| IP定位 | 100-1000米 | 最后备选方案 |

---

## 💡 使用建议

### 1. 首次使用
- 引导用户允许定位权限
- 说明定位用途和隐私保护

### 2. 持续定位
- 实时监听30秒后自动停止
- 需要时手动刷新位置

### 3. 电量优化
- 高精度模式耗电较快
- 30秒监听后自动停止
- 避免长时间持续定位

### 4. 隐私保护
- 位置信息仅存储在本地
- 不会上传到服务器（除非需要）
- 用户可随时清除缓存

---

## 🐛 常见问题

### Q: 定位一直显示"定位中"
A: 可能原因：
- GPS信号弱（室内或地下）
- 网络连接问题
- 浏览器权限未授权

### Q: 定位精度不准确
A: 改善方法：
- 移到窗户边或室外
- 检查设备是否支持GPS
- 关闭省电模式

### Q: 反向地理编码失败
A: 解决方案：
- 检查API密钥是否正确
- 检查网络连接
- API配额是否用完

### Q: 缓存位置过期
A: 处理方法：
- 自动清除10分钟前的缓存
- 手动刷新位置

---

## 🚀 后续优化

1. **离线地图**
   - 集成离线地图SDK
   - 无需网络也能显示位置

2. **地图可视化**
   - 在地图上显示用户位置
   - 显示周边资源

3. **位置分享**
   - 生成位置分享链接
   - 二维码分享位置

4. **多源定位**
   - 同时使用多个定位源
   - 提高定位准确性和可靠性

5. **后台定位**
   - 支持后台持续定位
   - 实时导航功能

---

**更新日期：** 2024-03-02
**版本：** v1.0.0
**状态：** ✅ 已完成
