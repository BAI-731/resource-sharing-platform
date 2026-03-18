# Supabase 集成说明

## 概述

本项目已成功集成 Supabase 数据库，用于存储用户数据、资源信息、收藏、订单等数据。

## 配置文件

### 环境变量

在项目根目录的 `.env` 文件中配置了 Supabase 连接信息：

```env
VITE_SUPABASE_URL=https://yaksaxjnaqqsewylhaah.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase 客户端

创建了 `src/lib/supabase.ts` 文件，包含：

- Supabase 客户端实例
- 数据库表类型定义（TypeScript）
- 类型导出供组件使用

## 数据库表结构

### 1. profiles（用户资料表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户ID（关联auth.users） |
| email | TEXT | 邮箱 |
| name | TEXT | 姓名 |
| student_id | TEXT | 学号 |
| department | TEXT | 院系 |
| major | TEXT | 专业 |
| building_number | TEXT | 楼号 |
| room_number | TEXT | 房间号 |
| phone | TEXT | 电话 |
| avatar_url | TEXT | 头像URL |
| risk_level | TEXT | 风险等级（low/medium/high） |
| cancelled_orders | INTEGER | 取消订单数 |
| complaint_count | INTEGER | 投诉数 |
| trust_score | INTEGER | 信任分数（0-100） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2. resources（资源表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 资源ID |
| seller_id | UUID | 卖家ID |
| type | TEXT | 类型（item/skill） |
| title | TEXT | 标题 |
| description | TEXT | 描述 |
| price | NUMERIC | 价格 |
| image_url | TEXT | 图片URL |
| category | TEXT | 分类 |
| contact | TEXT | 联系方式 |
| location | TEXT | 位置 |
| campus_zone | TEXT | 校园区域 |
| building_name | TEXT | 楼名 |
| views | INTEGER | 浏览量 |
| is_featured | BOOLEAN | 是否精选 |
| rating | NUMERIC | 评分（0-5） |
| rating_count | INTEGER | 评分人数 |
| tags | TEXT[] | 标签数组 |
| available_for_exchange | BOOLEAN | 是否可交换 |
| delivery_type | TEXT | 配送方式（delivery/pickup/both） |
| delivery_speed | TEXT | 配送速度（fast/normal/slow） |
| is_free_gift | BOOLEAN | 是否免费赠送 |
| allow_bundle | BOOLEAN | 是否支持拼单 |
| created_at | TIMESTAMP | 创建时间 |
| expires_at | TIMESTAMP | 过期时间 |

### 3. favorites（收藏表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 收藏ID |
| user_id | UUID | 用户ID |
| resource_id | UUID | 资源ID |
| resource_type | TEXT | 资源类型（item/skill） |
| created_at | TIMESTAMP | 创建时间 |

### 4. exchange_requests（以物易物请求表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 请求ID |
| from_user_id | UUID | 发起用户ID |
| to_user_id | UUID | 接收用户ID |
| offer_item_id | UUID | 提供物品ID |
| request_item_id | UUID | 请求物品ID |
| status | TEXT | 状态（pending/accepted/rejected/completed） |
| created_at | TIMESTAMP | 创建时间 |

### 5. orders（订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 订单ID |
| buyer_id | UUID | 买家ID |
| seller_id | UUID | 卖家ID |
| resource_id | UUID | 资源ID |
| type | TEXT | 订单类型（purchase/exchange） |
| status | TEXT | 状态（pending/confirmed/completed/cancelled） |
| delivery_type | TEXT | 配送方式 |
| meet_location | TEXT | 见面地点 |
| qr_code | TEXT | 二维码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 安全策略

已启用行级安全性（RLS），确保：

- 用户只能查看和修改自己的数据
- 所有用户都可以查看资源列表
- 用户只能操作自己的收藏、订单和交换请求
- 新用户注册时自动创建 profile

## 使用方法

### 1. 导入 Supabase 客户端

```typescript
import { supabase } from '@/lib/supabase'
import { Resources, Profiles } from '@/lib/supabase'
```

### 2. 查询数据

```typescript
// 查询所有资源
const { data, error } = await supabase
  .from('resources')
  .select('*')
  .order('created_at', { ascending: false })

// 查询特定类型的资源
const { data, error } = await supabase
  .from('resources')
  .select('*')
  .eq('type', 'item')
```

### 3. 插入数据

```typescript
// 创建新资源
const { data, error } = await supabase
  .from('resources')
  .insert([{
    seller_id: userId,
    type: 'item',
    title: '二手课本',
    description: '计算机导论课本，九成新',
    price: 50,
    image_url: 'https://example.com/image.jpg',
    category: 'books',
    contact: '138****8888',
    location: '紫荆公寓3栋'
  }])
```

### 4. 更新数据

```typescript
// 更新资源信息
const { data, error } = await supabase
  .from('resources')
  .update({ price: 45 })
  .eq('id', resourceId)
```

### 5. 删除数据

```typescript
// 删除资源
const { error } = await supabase
  .from('resources')
  .delete()
  .eq('id', resourceId)
```

### 6. 用户认证

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: '张三'
    }
  }
})

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// 登出
const { error } = await supabase.auth.signOut()

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()
```

## 索引优化

已为以下字段创建索引以提高查询性能：

- resources: seller_id, type, category, created_at, is_featured
- favorites: user_id, resource_id
- orders: buyer_id, seller_id
- exchange_requests: from_user_id, to_user_id

## 触发器

1. **update_profiles_updated_at**: 自动更新 profiles 表的 updated_at 字段
2. **update_orders_updated_at**: 自动更新 orders 表的 updated_at 字段
3. **on_auth_user_created**: 新用户注册时自动创建 profile 记录

## 视图

创建了 `resources_with_seller` 视图，包含资源信息及卖家详细信息，方便查询。

## 下一步集成建议

1. **替换 LocalStorage**: 将当前使用 LocalStorage 存储的数据迁移到 Supabase
2. **添加实时订阅**: 使用 Supabase Realtime 功能实现数据实时更新
3. **实现文件上传**: 使用 Supabase Storage 存储图片文件
4. **添加认证UI**: 实现登录、注册、找回密码等页面
5. **数据同步**: 确保 Context 状态管理与 Supabase 数据同步

## 注意事项

- 确保环境变量正确配置
- 生产环境应使用 Service Role Key 而非 Anon Key 进行服务端操作
- 定期备份数据库
- 监控数据库性能和错误日志
