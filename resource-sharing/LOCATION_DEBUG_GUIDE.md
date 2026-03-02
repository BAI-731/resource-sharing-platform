# 🐛 定位功能调试指南

## 问题：始终使用离线模式

如果定位功能一直显示"离线模式"，可能的原因和解决方案如下：

## 🔍 调试步骤

### 第一步：直接测试高德地图API

在浏览器中直接访问以下URL：

```
https://restapi.amap.com/v3/geocode/regeo?key=659258fde76dad36caa17a239b826fb0&location=110.3190,20.0440&extensions=base
```

**期望结果：**
```json
{
  "status": "1",
  "regeocode": {
    "formatted_address": "海南省海口市美兰区人民大道58号 海南大学",
    "pois": [
      {
        "name": "海南大学",
        "address": "人民大道58号"
      }
    ]
  }
}
```

**如果返回错误：**
- `status: "0"` - 查看返回的 `info` 字段了解错误原因
- `info: "INVALID_USER_KEY"` - API密钥无效或未激活
- `info: "DAILY_QUERY_OVER_LIMIT"` - 配额超限
- `info: "SERVICE_NOT_AVAILABLE"` - 服务不可用

### 第二步：使用内置测试页面

访问测试页面：
```
http://localhost:5173/test-location
```

点击"测试高德地图API"按钮，查看详细的API响应信息。

### 第三步：查看浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console（控制台）标签
3. 点击"自动定位我的位置"
4. 查看控制台输出

**正常输出：**
```
定位成功: { lat: 20.044, lng: 110.319, accuracy: "50米" }
调用高德地图API: https://restapi.amap.com/v3/geocode/regeo?key=...
高德地图API响应: { status: "1", regeocode: {...} }
逆地理编码成功: { formatted_address: "...", pois: [...] }
```

**错误输出示例：**
```
定位成功: { lat: 20.044, lng: 110.319, accuracy: "50米" }
调用高德地图API: https://restapi.amap.com/v3/geocode/regeo?key=...
高德地图API响应: { status: "0", info: "INVALID_USER_KEY" }
高德地图API返回错误: INVALID_USER_KEY
使用离线模式匹配: { name: "海南大学", ... }
```

## 🚨 常见错误及解决方案

### 1. API密钥无效 (INVALID_USER_KEY)

**症状：** 控制台显示 `INVALID_USER_KEY`

**原因：**
- API密钥不正确
- API密钥类型错误（需要Web服务类型）
- API密钥未激活或已过期

**解决方案：**
1. 确认API密钥: `659258fde76dad36caa17a239b826fb0`
2. 检查API密钥类型：必须是 **Web服务** 类型，不是 **Web端(JS API)**
3. 在高德控制台重新获取密钥：https://console.amap.com/dev/key/app

**重要：**
- **Web服务**：用于服务器端调用（fetch、axios等）
- **Web端(JS API)**：用于前端JavaScript SDK（地图显示）

我们的项目使用的是Web服务类型。

### 2. 配额超限 (DAILY_QUERY_OVER_LIMIT)

**症状：** 控制台显示 `DAILY_QUERY_OVER_LIMIT`

**解决方案：**
- 等待次日重置（个人开发者60万次/天）
- 或升级为企业账号

### 3. 跨域问题

**症状：** 控制台显示CORS错误

**解决方案：**
高德地图API支持跨域，如果遇到CORS问题：
1. 检查网络连接
2. 尝试使用代理服务
3. 或使用后端代理API请求

### 4. 网络问题

**症状：** 控制台显示网络错误或超时

**解决方案：**
1. 检查网络连接
2. 尝试刷新页面
3. 检查防火墙设置
4. 使用离线模式作为备用

## 🛠️ 临时解决方案

### 方案1：使用离线模式（已自动启用）

如果API调用失败，系统会自动使用离线模式，匹配预设的15所大学。

**优点：**
- 无需API密钥
- 无需网络
- 响应快速

**缺点：**
- 精度较低（大学级别）
- 不支持自定义地点

### 方案2：手动选择位置

点击"手动设置"按钮，选择预设地点或输入自定义位置。

## 📋 API密钥类型检查

在高德开放平台控制台（https://console.amap.com/dev/key/app）检查：

### 必须的配置

✅ **应用名称**：任意名称（如"校园易物"）
✅ **服务平台**：Web服务
✅ **IP白名单**：开发环境留空或设置为 `*`
✅ **域名白名单**：开发环境留空或设置为 `*`

### 错误的配置

❌ **服务平台**：Web端(JS API) - 这是用于显示地图的，不是用于逆地理编码
❌ **服务平台**：Android/iOS - 这是用于原生应用的

## 🔄 重新配置API密钥

如果需要更换API密钥：

### 方式1：修改代码

编辑 `src/components/RealtimeLocation.tsx` 第18行：
```typescript
const AMAP_KEY = '新的API密钥';
```

### 方式2：使用环境变量

1. 创建 `.env.local` 文件：
```env
VITE_AMAP_KEY=新的API密钥
```

2. 重启开发服务器：
```bash
npm run dev
```

## 📞 获取帮助

### 高德地图官方支持

- 文档中心：https://lbs.amap.com/api/webservice/guide/api/georegeo
- 控制台：https://console.amap.com/
- 技术支持：https://lbs.amap.com/contact

### 调试信息收集

如果问题仍然存在，请收集以下信息：

1. **API测试结果**：直接访问API URL的返回结果
2. **控制台输出**：完整的控制台日志
3. **网络请求**：开发者工具 Network 标签中的请求详情
4. **浏览器信息**：浏览器类型和版本
5. **错误提示**：页面显示的错误信息

## 🎯 快速检查清单

- [ ] API密钥是否正确：`659258fde76dad36caa17a239b826fb0`
- [ ] API密钥类型是否为"Web服务"
- [ ] IP白名单是否允许访问
- [ ] 网络连接是否正常
- [ ] 浏览器控制台是否有错误
- [ ] 直接访问API URL是否返回正确结果
- [ ] 是否已重启开发服务器

## 💡 建议的开发流程

1. **第一步**：直接在浏览器测试API URL
2. **第二步**：访问 `/test-location` 测试页面
3. **第三步**：在首页测试定位功能，查看控制台
4. **第四步**：如果API失败，检查配置
5. **第五步**：使用离线模式作为备用

## 📝 总结

定位功能使用高德地图Web服务API进行逆地理编码。如果一直显示离线模式，最可能的原因是：

1. **API密钥类型错误**：使用的是JS API而不是Web服务
2. **API密钥无效**：密钥未激活或已过期
3. **网络问题**：无法访问高德地图API服务

按照上述调试步骤逐一检查，应该能够找到并解决问题。
