# 🗺️ 定位功能快速配置指南

## 问题说明

之前系统的定位功能只是将GPS坐标简单匹配到预设的大学列表，导致定位不准确。现在已升级为使用**高德地图API**，可以准确地将坐标转换为真实的地址名称。

## 快速配置（推荐）

### 方法一：使用环境变量（推荐用于生产环境）

1. **创建环境变量文件**

   在项目根目录创建 `.env.local` 文件（已在 `.env.example` 中提供模板）：

   ```bash
   cp .env.example .env.local
   ```

2. **配置API密钥**

   编辑 `.env.local` 文件，填写高德地图API密钥：

   ```env
   VITE_AMAP_KEY=你的实际API密钥
   ```

3. **获取API密钥**

   - 访问 https://console.amap.com/dev/key/app
   - 登录/注册高德开放平台账号
   - 创建应用，选择「Web端(JS API)」
   - 获取Web服务类型的Key

4. **重启开发服务器**

   ```bash
   npm run dev
   ```

### 方法二：直接修改代码（仅用于快速测试）

在 `src/components/RealtimeLocation.tsx` 文件的第18行，直接替换API密钥：

```typescript
const AMAP_KEY = '你的实际API密钥';
```

## 配置完成后的效果

### 配置API密钥前（离线模式）

```
当前位置: 距离海南大学 0公里
状态: 离线模式
```

### 配置API密钥后（在线模式）

```
当前位置: 海南大学·海甸校区
地址: 海南省海口市美兰区人民大道58号
状态: 精确定位
```

## 功能特性

### ✅ 双模式支持

1. **在线模式**（高德地图API）
   - 精确到POI级别（如"海南大学·海甸校区图书馆"）
   - 返回详细地址信息
   - 支持中国全境

2. **离线模式**（备用方案）
   - 无需API密钥
   - 匹配预设的15所大学
   - 显示距离信息

### ✅ 自动降级

- API调用失败时自动切换到离线模式
- 网络异常时仍可使用基本定位功能
- 提供清晰的模式指示

### ✅ 灵活配置

- 支持环境变量配置（推荐）
- 支持手动修改代码
- 支持自定义地点列表

## 测试定位功能

### 在浏览器中测试

1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:5173
3. 点击"自动定位我的位置"
4. 允许浏览器定位权限
5. 查看定位结果

### 使用开发者工具模拟定位

1. 打开浏览器开发者工具（F12）
2. 进入 `More tools` → `Sensors`
3. 在 `Location` 下拉框中选择：
   - `Custom location` 自定义坐标
   - 或选择预设城市（如"Shanghai"）
4. 刷新页面重新定位

### 真机测试

使用手机浏览器访问开发服务器（需在同一局域网）：

```bash
# 获取本机IP
ipconfig (Windows)
# 或
ifconfig (Mac/Linux)

# 手机访问
http://你的IP:5173
```

## 常见问题

### Q1: 定位一直显示"离线模式"？

**检查清单**：
- ✅ 是否已配置API密钥？
- ✅ API密钥类型是否为"Web服务"？
- ✅ 网络连接是否正常？
- ✅ 控制台是否有错误信息？

### Q2: API密钥配额不足怎么办？

高德地图个人开发者默认配额为60万次/天，一般不会超限。
如果超限，可以：
- 升级为企业账号
- 或继续使用离线模式

### Q3: 如何添加更多预设地点？

编辑 `src/components/RealtimeLocation.tsx` 中的 `presetLocations` 数组：

```typescript
{ name: '大学名称', lat: 纬度, lng: 经度 },
```

### Q4: 定位不准确怎么办？

1. 检查GPS信号（室内可能不准确）
2. 使用"手动设置"选择准确位置
3. 清除浏览器缓存和位置权限后重试

## 技术说明

### 高德地图逆地理编码API

```
请求: https://restapi.amap.com/v3/geocode/regeo?key={key}&location={lng},{lat}&extensions=base

响应:
{
  "status": "1",
  "regeocode": {
    "formatted_address": "海南省海口市美兰区人民大道58号",
    "pois": [
      {
        "name": "海南大学",
        "address": "人民大道58号"
      }
    ]
  }
}
```

### 定位流程

```
用户点击"自动定位"
    ↓
获取GPS坐标（浏览器Geolocation API）
    ↓
调用高德地图逆地理编码API
    ↓
返回真实地址名称
    ↓
显示给用户并保存到localStorage
```

## 安全建议

⚠️ **重要**：在生产环境中，API密钥不应该直接暴露在客户端代码中。

### 推荐的安全方案

1. **使用环境变量**：通过 `import.meta.env.VITE_AMAP_KEY` 读取
2. **后端代理**：通过自己的后端服务代理高德API请求
3. **IP白名单**：在高德控制台设置IP白名单限制

## 文件清单

本次更新涉及的文件：

- `src/components/RealtimeLocation.tsx` - 定位组件（已更新）
- `.env.example` - 环境变量配置模板（新建）
- `LOCATION_API_CONFIG.md` - 详细配置文档（新建）
- `QUICK_START_LOCATION.md` - 本快速开始指南（新建）

## 下一步

1. ✅ 配置高德地图API密钥
2. ✅ 测试定位功能
3. ✅ 根据需要添加更多预设地点
4. ✅ 优化定位UI和用户体验

## 获取帮助

- 高德地图开放平台：https://lbs.amap.com/
- 技术支持文档：https://lbs.amap.com/api/javascript-api/guide/services/geolocation
- 问题反馈：查看项目Issue或联系开发团队
