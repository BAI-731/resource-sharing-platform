# 校园·社区交易平台 - 核心功能说明

## 🚀 七大核心创新功能

### 1. 「30分钟上门/自提」极速交易

**功能描述：**
- 只显示1km/3km内商品，实现快速交易
- 支持多种配送方式：上门、自提、两者皆可
- 智能标签：可上门、可自提、10分钟达、楼下即取

**实现组件：** `FastTradeFilter.tsx`

**核心特点：**
- 买家不用等快递，卖家不用打包寄件
- 校园内面对面交易，安全快捷
- 大平台无法做到的本地化优势

**使用方法：**
```tsx
import { FastTradeFilter } from '@/components/FastTradeFilter';

<FastTradeFilter
  resources={items}
  onFilteredResources={setFilteredItems}
  userLocation={userLocation}
/>
```

---

### 2. 实名+身份强绑定（校园/社区信任壁垒）

**功能描述：**
- **校园**：学号/院系认证，只对本校开放
- **社区**：楼栋/房号脱敏展示
- 显示：同楼/同寝室楼/同班/同专业，天然信任度远超陌生人

**实现组件：** `UserTrustBadge.tsx`

**核心特点：**
- 信任评分系统（0-100分）
- 风险等级识别（低/中/高）
- 信息脱敏保护隐私

**数据结构：**
```typescript
interface UserProfile {
  studentId?: string;
  department?: string;
  major?: string;
  buildingNumber?: string;
  roomNumber?: string;
  riskLevel: 'low' | 'medium' | 'high';
  trustScore: number;
  cancelledOrders: number;
}
```

**使用方法：**
```tsx
import { UserTrustBadge, getCurrentUserProfile } from '@/components/UserTrustBadge';

<UserTrustBadge
  userProfile={userProfile}
  isSameBuilding={true}
  isSameDormitory={true}
  isSameMajor={false}
/>
```

---

### 3. 「当面交易担保」线下轻验机

**功能描述：**
- 平台生成当面交易二维码
- 见面验货 → 扫码确认 → 钱才到账
- 内置：面交安全提醒、地点推荐（驿站、便利店、大厅）

**实现组件：** `FaceToFaceTrade.tsx`

**交易流程：**
1. **见面**：推荐安全见面地点（校门、图书馆、便利店）
2. **验货**：检查商品外观、功能、配件
3. **确认**：生成交易二维码，卖家扫码收款
4. **完成**：交易成功，双方评价

**安全提醒：**
- 📍 选择人流量较大的公共场所见面
- ⏰ 白天交易，避免夜间单独见面
- 📱 保留聊天记录和对方联系方式
- 💰 验货后再扫码确认付款
- 🚫 不要提前转账给陌生人
- 👥 可让同学陪同交易

**使用方法：**
```tsx
import { FaceToFaceTrade } from '@/components/FaceToFaceTrade';

<FaceToFaceTrade
  resourceId={item.id}
  sellerName={seller.name}
  sellerPhone={seller.phone}
  price={item.price}
  onTradeComplete={() => console.log('Trade completed')}
/>
```

---

### 4. 物物置换（校园/社区最强刚需）

**功能描述：**
- 书本、文具、电器、生活用品直接换
- 系统按品类、价值、距离自动匹配置换对象
- 不用花钱，学生/居民最爱

**实现组件：** `ExchangeMatcher.tsx`

**匹配算法：**
- **价值匹配（40%权重）**：价格比在0.8-1.2之间为最佳匹配
- **品类匹配（30%权重）**：同品类物品优先
- **距离匹配（20%权重）**：同楼/同区域优先
- **评分匹配（10%权重）**：高评分物品优先

**智能匹配规则：**
```typescript
// 1. 价值相当：价格比 0.8-1.2 → 40分
// 2. 价值接近：价格比 0.6-1.4 → 30分
// 3. 同类物品：品类相同 → 30分
// 4. 同区域：同楼/同区 → 20-25分
// 5. 高评分：4.5分以上 → 10分
// 6. 较新：浏览量<50 → 5分
```

**使用方法：**
```tsx
import { ExchangeMatcher } from '@/components/ExchangeMatcher';

<ExchangeMatcher
  currentItem={currentItem}
  allItems={allItems}
  onExchangeRequest={(offer, request) => {
    // 处理置换请求
  }}
/>
```

---

### 5. 小件免费送 / 楼下自取

**功能描述：**
- 书、小工具、日用品0元送
- 只允许自提，不邮寄
- 快速拉高活跃度、发帖量

**数据结构：**
```typescript
{
  isFreeGift: true,       // 标记为免费赠送
  price: 0,               // 价格为0
  deliveryType: 'pickup', // 只能自提
}
```

**特点：**
- 提升平台活跃度
- 建立用户信任
- 促进二次交易
- 环保低碳理念

---

### 6. 拼单自提（社区/宿舍神器）

**功能描述：**
- 多件小件（洗衣液、纸巾、厨具）打包一起卖
- 支持多人拼单，一起楼下取，提高成交量
- 2件95折，3件及以上9折

**实现组件：** `BundlePicker.tsx`

**优惠规则：**
- 2件商品：享受95折
- 3件及以上：享受9折
- 仅限同一卖家的商品拼单

**使用场景：**
- 毕业季清理物品
- 生活用品批量处理
- 图书教材打包
- 学习用品套装

**使用方法：**
```tsx
import { BundlePicker } from '@/components/BundlePicker';

<BundlePicker
  availableItems={sellerItems}
  onCreateBundle={(itemIds) => {
    // 创建拼单订单
  }}
/>
```

---

### 7. 风险用户轻预警（简单好做）

**功能描述：**
- 多次取消订单、恶意砍价、被投诉
- 给对方显示谨慎交易提示，不用复杂AI

**实现方式：**

**风险等级判定：**
```typescript
// 低风险（绿色）
cancelledOrders < 3 && complaintCount === 0

// 中风险（黄色）⚠️ 交易谨慎
cancelledOrders >= 3 || complaintCount > 0

// 高风险（红色）🚫 高风险用户
cancelledOrders >= 5 || complaintCount >= 3
```

**信任评分计算：**
```typescript
trustScore = 100 - (cancelledOrders * 5) - (complaintCount * 10)
```

**展示效果：**
- 同楼同院系标识（紫色/靛蓝/青色标签）
- 信任等级徽章（高信任/中信任/一般/低信任）
- 风险提示（黄色/红色警告框）

---

## 📊 技术架构

### 数据模型更新

**Resource 接口扩展：**
```typescript
interface Resource {
  // ... 原有字段
  deliveryType?: 'delivery' | 'pickup' | 'both';
  deliverySpeed?: 'fast' | 'normal' | 'slow';
  isFreeGift?: boolean;
  allowBundle?: boolean;
  sellerId: string;
}
```

**新增接口：**
```typescript
interface UserProfile {
  id: string;
  name: string;
  studentId?: string;
  department?: string;
  major?: string;
  buildingNumber?: string;
  roomNumber?: string;
  phone: string;
  riskLevel: 'low' | 'medium' | 'high';
  cancelledOrders: number;
  complaintCount: number;
  trustScore: number;
}

interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  resourceId: string;
  type: 'purchase' | 'exchange';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  deliveryType: DeliveryType;
  meetLocation?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface BundleOrder {
  id: string;
  buyerIds: string[];
  sellerId: string;
  resourceIds: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickupLocation: string;
  pickupTime?: string;
  createdAt: string;
}
```

---

## 🎯 核心优势对比

| 功能 | 闲鱼/转转 | 本平台 |
|------|-----------|--------|
| 配送速度 | 需等待快递 | 10分钟达/楼下即取 |
| 身份认证 | 仅手机号 | 学号+院系+楼栋 |
| 交易方式 | 在线支付 | 当面验货担保 |
| 置换功能 | 无 | 智能匹配算法 |
| 免费物品 | 较少 | 专门的免费送板块 |
| 拼单优惠 | 无 | 95折/9折优惠 |
| 风险识别 | 复杂AI | 简单规则判定 |
| 本地化 | 城市级 | 校园/社区级 |

---

## 📝 使用示例

### 在物品列表页集成所有功能

```tsx
import { FastTradeFilter } from '@/components/FastTradeFilter';
import { getDeliveryLabels } from '@/components/FastTradeFilter';
import { UserTrustBadge } from '@/components/UserTrustBadge';

export function ItemsPage() {
  // 极速交易筛选
  const handleFastTradeFilter = (filtered) => {
    setFilteredItems(filtered);
  };

  return (
    <div>
      <FastTradeFilter
        resources={items}
        onFilteredResources={handleFastTradeFilter}
      />

      {/* 列表项展示 */}
      {filteredItems.map(item => (
        <div key={item.id}>
          <img src={item.image} />
          <h3>{item.title}</h3>

          {/* 配送标签 */}
          <div className="flex gap-1">
            {getDeliveryLabels(item).map(label => (
              <Badge key={label.text} className={label.color}>
                {label.text}
              </Badge>
            ))}
          </div>

          {/* 卖家信任信息 */}
          <UserTrustBadge
            userProfile={item.seller}
            isSameBuilding={item.seller.building === currentUser.building}
          />

          {/* 交易按钮 */}
          <FaceToFaceTrade {...item} />
          {item.availableForExchange && <ExchangeMatcher {...item} />}
          {item.allowBundle && <BundlePicker {...item} />}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 配置说明

### 环境变量

```env
# 校园配置
CAMPUS_NAME=清华大学
DEFAULT_CAMPUS_ZONE=dormitory

# 交易配置
FAST_TRADE_DISTANCE_LIMIT=3000  # 极速交易距离限制(米)
FACE_TO_FACE_TIMEOUT=30  # 面对面交易超时时间(分钟)
BUNDLE_MIN_ITEMS=2  # 拼单最小件数
BUNDLE_DISCOUNT_2=0.05  # 2件折扣
BUNDLE_DISCOUNT_3=0.10  # 3件折扣

# 风险控制
RISK_CANCEL_THRESHOLD=3  # 取消订单风险阈值
RISK_COMPLAINT_THRESHOLD=1  # 投诉风险阈值
```

---

## 🚀 部署说明

1. **构建项目**
   ```bash
   npm run build
   ```

2. **启动服务**
   ```bash
   npm run dev
   ```

3. **访问地址**
   ```
   http://localhost:5173
   ```

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目仓库：[GitHub]
- 邮箱：support@campus-trade.com

---

**版本：** v2.0.0
**更新日期：** 2024-03-02
**作者：** 校园易物团队
