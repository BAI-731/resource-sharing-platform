-- 创建profiles表（用户资料表）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  student_id TEXT,
  department TEXT,
  major TEXT,
  building_number TEXT,
  room_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  complaint_count INTEGER NOT NULL DEFAULT 0,
  trust_score INTEGER NOT NULL DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建resources表（资源表）
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('item', 'skill')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  contact TEXT NOT NULL,
  location TEXT NOT NULL,
  campus_zone TEXT,
  building_name TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  available_for_exchange BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_type TEXT NOT NULL DEFAULT 'both' CHECK (delivery_type IN ('delivery', 'pickup', 'both')),
  delivery_speed TEXT NOT NULL DEFAULT 'normal' CHECK (delivery_speed IN ('fast', 'normal', 'slow')),
  is_free_gift BOOLEAN NOT NULL DEFAULT FALSE,
  allow_bundle BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 创建favorites表（收藏表）
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('item', 'skill')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- 创建exchange_requests表（以物易物请求表）
CREATE TABLE IF NOT EXISTS exchange_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offer_item_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  request_item_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建orders表（订单表）
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'exchange')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup', 'both')),
  meet_location TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建notifications表（通知表）
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order', 'exchange', 'system', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_resources_seller ON resources(seller_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_created ON resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_is_featured ON resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_from_user ON exchange_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_to_user ON exchange_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 创建触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为profiles表添加updated_at触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为orders表添加updated_at触发器
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全性（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 注意：PostgreSQL 不支持 CREATE POLICY IF NOT EXISTS
-- 如果策略已存在，需要先 DROP 再 CREATE

-- 删除可能存在的旧策略（用于重新部署）
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的资料" ON profiles;
DROP POLICY IF EXISTS "所有人可以查看发布过资源的用户资料" ON profiles;

DROP POLICY IF EXISTS "所有人可以查看资源" ON resources;
DROP POLICY IF EXISTS "用户可以创建资源" ON resources;
DROP POLICY IF EXISTS "用户可以更新自己的资源" ON resources;
DROP POLICY IF EXISTS "用户可以删除自己的资源" ON resources;

DROP POLICY IF EXISTS "用户可以查看自己的收藏" ON favorites;
DROP POLICY IF EXISTS "用户可以添加收藏" ON favorites;
DROP POLICY IF EXISTS "用户可以删除自己的收藏" ON favorites;

DROP POLICY IF EXISTS "用户可以查看相关的交换请求" ON exchange_requests;
DROP POLICY IF EXISTS "用户可以创建交换请求" ON exchange_requests;
DROP POLICY IF EXISTS "用户可以更新自己的交换请求" ON exchange_requests;

DROP POLICY IF EXISTS "用户可以查看自己的订单" ON orders;
DROP POLICY IF EXISTS "买家可以创建订单" ON orders;
DROP POLICY IF EXISTS "用户可以更新自己的订单" ON orders;

DROP POLICY IF EXISTS "用户可以查看自己的通知" ON notifications;
DROP POLICY IF EXISTS "用户可以标记自己的通知已读" ON notifications;
DROP POLICY IF EXISTS "用户可以删除自己的通知" ON notifications;
DROP POLICY IF EXISTS "系统/其他用户可以创建通知" ON notifications;

-- Profiles策略
CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "所有人可以查看发布过资源的用户资料" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resources WHERE resources.seller_id = profiles.id
    )
  );

-- Resources策略
CREATE POLICY "所有人可以查看资源" ON resources
  FOR SELECT USING (true);

CREATE POLICY "用户可以创建资源" ON resources
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "用户可以更新自己的资源" ON resources
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "用户可以删除自己的资源" ON resources
  FOR DELETE USING (auth.uid() = seller_id);

-- Favorites策略
CREATE POLICY "用户可以查看自己的收藏" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加收藏" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的收藏" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Exchange Requests策略
CREATE POLICY "用户可以查看相关的交换请求" ON exchange_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "用户可以创建交换请求" ON exchange_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "用户可以更新自己的交换请求" ON exchange_requests
  FOR UPDATE USING (auth.uid() = from_user_id);

-- Orders策略
CREATE POLICY "用户可以查看自己的订单" ON orders
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "买家可以创建订单" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "用户可以更新自己的订单" ON orders
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Notifications策略
CREATE POLICY "用户可以查看自己的通知" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以标记自己的通知已读" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的通知" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "系统/其他用户可以创建通知" ON notifications
  FOR INSERT WITH CHECK (true);

-- 创建视图：资源列表视图（包含卖家信息）
CREATE OR REPLACE VIEW resources_with_seller AS
SELECT
  r.*,
  p.name as seller_name,
  p.email as seller_email,
  p.phone as seller_phone,
  p.trust_score as seller_trust_score,
  p.risk_level as seller_risk_level,
  p.department as seller_department,
  p.major as seller_major,
  p.building_number as seller_building_number,
  p.room_number as seller_room_number
FROM resources r
LEFT JOIN profiles p ON r.seller_id = p.id;

-- 创建函数：创建新用户profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：当新用户注册时自动创建profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 添加注释
COMMENT ON TABLE profiles IS '用户资料表';
COMMENT ON TABLE resources IS '资源表（物品和技能）';
COMMENT ON TABLE favorites IS '收藏表';
COMMENT ON TABLE exchange_requests IS '以物易物请求表';
COMMENT ON TABLE orders IS '订单表';
COMMENT ON TABLE notifications IS '通知表';

COMMENT ON COLUMN resources.type IS '资源类型：item-物品，skill-技能';
COMMENT ON COLUMN resources.delivery_type IS '配送方式：delivery-可上门，pickup-可自提，both-都可';
COMMENT ON COLUMN resources.delivery_speed IS '配送速度：fast-极速达，normal-普通，slow-慢速';
COMMENT ON COLUMN resources.is_free_gift IS '是否免费赠送';
COMMENT ON COLUMN resources.allow_bundle IS '是否支持拼单';
COMMENT ON COLUMN profiles.risk_level IS '风险等级：low-低风险，medium-中等风险，high-高风险';
COMMENT ON COLUMN profiles.trust_score IS '信任分数：0-100分';
