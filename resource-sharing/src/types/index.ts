export type ResourceType = 'item' | 'skill';

export type ItemCategory =
  | 'electronics'
  | 'books'
  | 'furniture'
  | 'clothing'
  | 'sports'
  | 'toys'
  | 'home'
  | 'study'
  | 'other';

export type SkillCategory =
  | 'design'
  | 'education'
  | 'programming'
  | 'photography'
  | 'music'
  | 'cooking'
  | 'fitness'
  | 'tutoring'
  | 'other';

export type CampusZone =
  | 'dormitory'
  | 'library'
  | 'canteen'
  | 'sports'
  | 'teaching'
  | 'laboratory'
  | 'gate'
  | 'community'
  | 'other';

export type DeliveryType = 'delivery' | 'pickup' | 'both';
export type DeliverySpeed = 'fast' | 'normal' | 'slow';

export interface UserProfile {
  id: string;
  name: string;
  studentId?: string;
  department?: string;
  major?: string;
  roomNumber?: string;
  buildingNumber?: string;
  phone: string;
  avatar?: string;
  riskLevel: 'low' | 'medium' | 'high';
  cancelledOrders: number;
  complaintCount: number;
  trustScore: number; // 0-100
}

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  price: number;
  image: string;
  category: ItemCategory | SkillCategory;
  contact: string;
  location: string;
  campusZone?: CampusZone;
  buildingName?: string;
  createdAt: string;
  expiresAt?: string;
  views: number;
  isFeatured?: boolean;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
  availableForExchange?: boolean;
  deliveryType?: DeliveryType;
  deliverySpeed?: DeliverySpeed;
  isFreeGift?: boolean;
  allowBundle?: boolean; // 支持拼单
  sellerId: string;
}

export interface UserFavorites {
  itemIds: string[];
  skillIds: string[];
}

export interface UserHistory {
  viewedItems: string[];
  viewedSkills: string[];
  searchHistory: string[];
}

export interface Review {
  id: string;
  resourceId: string;
  resourceType: ResourceType;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ExchangeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  offerItemId: string;
  requestItemId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface Order {
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

export interface BundleOrder {
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

export const ITEM_CATEGORIES: { value: ItemCategory; label: string; icon: string }[] = [
  { value: 'electronics', label: '电子产品', icon: '📱' },
  { value: 'books', label: '图书教材', icon: '📚' },
  { value: 'furniture', label: '家具家电', icon: '🪑' },
  { value: 'clothing', label: '服装配饰', icon: '👔' },
  { value: 'sports', label: '运动户外', icon: '⚽' },
  { value: 'toys', label: '玩具游戏', icon: '🧸' },
  { value: 'home', label: '家居日用', icon: '🏠' },
  { value: 'study', label: '学习用品', icon: '✏️' },
  { value: 'other', label: '其他', icon: '📦' },
];

export const SKILL_CATEGORIES: { value: SkillCategory; label: string; icon: string }[] = [
  { value: 'design', label: '设计', icon: '🎨' },
  { value: 'education', label: '教育培训', icon: '📖' },
  { value: 'programming', label: '编程开发', icon: '💻' },
  { value: 'photography', label: '摄影摄像', icon: '📷' },
  { value: 'music', label: '音乐乐器', icon: '🎵' },
  { value: 'cooking', label: '烹饪烘焙', icon: '🍳' },
  { value: 'fitness', label: '健身运动', icon: '🏋️' },
  { value: 'tutoring', label: '课业辅导', icon: '🎓' },
  { value: 'other', label: '其他', icon: '✨' },
];

export const CAMPUS_ZONES: { value: CampusZone; label: string; icon: string }[] = [
  { value: 'dormitory', label: '宿舍区', icon: '🏢' },
  { value: 'library', label: '图书馆', icon: '📚' },
  { value: 'canteen', label: '食堂区', icon: '🍽️' },
  { value: 'sports', label: '运动场', icon: '⚽' },
  { value: 'teaching', label: '教学楼', icon: '🏫' },
  { value: 'laboratory', label: '实验楼', icon: '🔬' },
  { value: 'gate', label: '校门', icon: '🚪' },
  { value: 'community', label: '社区广场', icon: '🌳' },
  { value: 'other', label: '其他', icon: '📍' },
];
