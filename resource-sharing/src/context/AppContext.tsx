import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Resource, UserFavorites, ResourceType, UserHistory, Review, ExchangeRequest } from '@/types';
import { initialItems, initialSkills } from '@/data/initialData';
import { supabase, type Resources as DBResources, type Favorites as DBFavorites } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'resource-sharing-data';

interface AppState {
  items: Resource[];
  skills: Resource[];
  favorites: UserFavorites;
  searchQuery: string;
  history: UserHistory;
  reviews: Review[];
  exchangeRequests: ExchangeRequest[];
}

type Action =
  | { type: 'SET_ITEMS'; payload: Resource[] }
  | { type: 'SET_SKILLS'; payload: Resource[] }
  | { type: 'ADD_ITEM'; payload: Resource }
  | { type: 'ADD_SKILL'; payload: Resource }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string; resourceType: ResourceType } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'INCREMENT_VIEWS'; payload: string }
  | { type: 'ADD_TO_HISTORY'; payload: { id: string; type: ResourceType } }
  | { type: 'ADD_SEARCH_TO_HISTORY'; payload: string }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'ADD_EXCHANGE_REQUEST'; payload: ExchangeRequest }
  | { type: 'UPDATE_EXCHANGE_STATUS'; payload: { id: string; status: ExchangeRequest['status'] } }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  items: initialItems,
  skills: initialSkills,
  favorites: { itemIds: [], skillIds: [] },
  searchQuery: '',
  history: { viewedItems: [], viewedSkills: [], searchHistory: [] },
  reviews: [],
  exchangeRequests: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_SKILLS':
      return { ...state, skills: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'ADD_SKILL':
      return { ...state, skills: [action.payload, ...state.skills] };
    case 'TOGGLE_FAVORITE': {
      const { id, resourceType } = action.payload;
      if (resourceType === 'item') {
        const isFavorite = state.favorites.itemIds.includes(id);
        return {
          ...state,
          favorites: {
            ...state.favorites,
            itemIds: isFavorite
              ? state.favorites.itemIds.filter((itemId) => itemId !== id)
              : [...state.favorites.itemIds, id],
          },
        };
      } else {
        const isFavorite = state.favorites.skillIds.includes(id);
        return {
          ...state,
          favorites: {
            ...state.favorites,
            skillIds: isFavorite
              ? state.favorites.skillIds.filter((skillId) => skillId !== id)
              : [...state.favorites.skillIds, id],
          },
        };
      }
    }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'INCREMENT_VIEWS': {
      const resourceId = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === resourceId ? { ...item, views: item.views + 1 } : item
        ),
        skills: state.skills.map((skill) =>
          skill.id === resourceId ? { ...skill, views: skill.views + 1 } : skill
        ),
      };
    }
    case 'ADD_TO_HISTORY': {
      const { id, type } = action.payload;
      if (type === 'item') {
        const viewedItems = [id, ...state.history.viewedItems.filter((i) => i !== id)].slice(0, 50);
        return { ...state, history: { ...state.history, viewedItems } };
      } else {
        const viewedSkills = [id, ...state.history.viewedSkills.filter((s) => s !== id)].slice(0, 50);
        return { ...state, history: { ...state.history, viewedSkills } };
      }
    }
    case 'ADD_SEARCH_TO_HISTORY': {
      const query = action.payload;
      if (!query.trim()) return state;
      const searchHistory = [query, ...state.history.searchHistory.filter((s) => s !== query)].slice(0, 20);
      return { ...state, history: { ...state.history, searchHistory } };
    }
    case 'ADD_REVIEW': {
      const newReview = action.payload;
      const reviews = [...state.reviews, newReview];
      
      // 更新资源的平均评分
      const resourceReviews = reviews.filter(r => r.resourceId === newReview.resourceId);
      const avgRating = resourceReviews.reduce((sum, r) => sum + r.rating, 0) / resourceReviews.length;
      
      const updateRating = (items: Resource[]) =>
        items.map(item =>
          item.id === newReview.resourceId
            ? { ...item, rating: avgRating, ratingCount: resourceReviews.length }
            : item
        );
      
      return {
        ...state,
        reviews,
        items: updateRating(state.items),
        skills: updateRating(state.skills),
      };
    }
    case 'ADD_EXCHANGE_REQUEST': {
      return { ...state, exchangeRequests: [...state.exchangeRequests, action.payload] };
    }
    case 'UPDATE_EXCHANGE_STATUS': {
      return {
        ...state,
        exchangeRequests: state.exchangeRequests.map(req =>
          req.id === action.payload.id ? { ...req, status: action.payload.status } : req
        ),
      };
    }
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getFavoriteItems: () => Resource[];
  getFavoriteSkills: () => Resource[];
  isFavorite: (id: string, type: ResourceType) => boolean;
  getRecommendations: (type: ResourceType) => Resource[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  createExchangeRequest: (offerItemId: string, requestItemId: string) => void;
  updateExchangeStatus: (id: string, status: ExchangeRequest['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (resourcesError) throw resourcesError;

        if (resourcesData) {
          const items = resourcesData
            .filter((r: DBResources) => r.type === 'item')
            .map((r: DBResources) => ({
              id: r.id,
              type: r.type,
              title: r.title,
              description: r.description,
              price: r.price,
              image: r.image_url,
              category: r.category,
              sellerId: r.seller_id,
              contact: r.contact,
              location: r.location,
              campusZone: r.campus_zone,
              buildingName: r.building_name,
              views: r.views,
              isFeatured: r.is_featured,
              rating: r.rating,
              ratingCount: r.rating_count,
              tags: r.tags,
              availableForExchange: r.available_for_exchange,
              deliveryType: r.delivery_type,
              deliverySpeed: r.delivery_speed,
              isFreeGift: r.is_free_gift,
              allowBundle: r.allow_bundle,
              createdAt: r.created_at,
              expiresAt: r.expires_at,
            }));

          const skills = resourcesData
            .filter((r: DBResources) => r.type === 'skill')
            .map((r: DBResources) => ({
              id: r.id,
              type: r.type,
              title: r.title,
              description: r.description,
              price: r.price,
              image: r.image_url,
              category: r.category,
              sellerId: r.seller_id,
              contact: r.contact,
              location: r.location,
              campusZone: r.campus_zone,
              buildingName: r.building_name,
              views: r.views,
              isFeatured: r.is_featured,
              rating: r.rating,
              ratingCount: r.rating_count,
              tags: r.tags,
              availableForExchange: r.available_for_exchange,
              deliveryType: r.delivery_type,
              deliverySpeed: r.delivery_speed,
              isFreeGift: r.is_free_gift,
              allowBundle: r.allow_bundle,
              createdAt: r.created_at,
              expiresAt: r.expires_at,
            }));

          dispatch({ type: 'SET_ITEMS', payload: items });
          dispatch({ type: 'SET_SKILLS', payload: skills });
        }

        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        if (favoritesData) {
          const itemIds = favoritesData
            .filter((f: DBFavorites) => f.resource_type === 'item')
            .map((f: DBFavorites) => f.resource_id);
          const skillIds = favoritesData
            .filter((f: DBFavorites) => f.resource_type === 'skill')
            .map((f: DBFavorites) => f.resource_id);

          dispatch({
            type: 'LOAD_DATA',
            payload: {
              ...state,
              favorites: { itemIds, skillIds },
            },
          });
        }
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
      }
    };

    loadData();
  }, [user]);



  const getFavoriteItems = () => {
    return state.items.filter((item) => state.favorites.itemIds.includes(item.id));
  };

  const getFavoriteSkills = () => {
    return state.skills.filter((skill) => state.favorites.skillIds.includes(skill.id));
  };

  const isFavorite = (id: string, type: ResourceType) => {
    if (type === 'item') {
      return state.favorites.itemIds.includes(id);
    }
    return state.favorites.skillIds.includes(id);
  };

  // 智能推荐算法
  const getRecommendations = (type: ResourceType): Resource[] => {
    const resources = type === 'item' ? state.items : state.skills;
    const viewedIds = type === 'item' ? state.history.viewedItems : state.history.viewedSkills;
    const favoriteIds = type === 'item' ? state.favorites.itemIds : state.favorites.skillIds;
    
    // 计算资源得分
    const scoredResources = resources.map(resource => {
      let score = 0;
      
      // 如果浏览过,加分
      if (viewedIds.includes(resource.id)) {
        score += 2;
      }
      
      // 如果收藏过,加分
      if (favoriteIds.includes(resource.id)) {
        score += 3;
      }
      
      // 相同类别的资源加分
      if (viewedIds.length > 0 || favoriteIds.length > 0) {
        const allRelatedIds = [...viewedIds, ...favoriteIds];
        const relatedResources = resources.filter(r => allRelatedIds.includes(r.id));
        const sameCategory = relatedResources.some(r => r.category === resource.category);
        if (sameCategory) {
          score += 4;
        }
      }
      
      // 评分高的资源加分
      if (resource.rating && resource.rating >= 4) {
        score += 2;
      }
      
      // 浏览量高的资源加分
      if (resource.views > 100) {
        score += 1;
      }
      
      return { ...resource, score };
    });
    
    // 排除已浏览和已收藏的,按得分排序
    return scoredResources
      .filter(r => !viewedIds.includes(r.id) && !favoriteIds.includes(r.id))
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 8)
      .map(({ score, ...resource }) => resource);
  };

  const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REVIEW', payload: newReview });
  };

  const createExchangeRequest = async (offerItemId: string, requestItemId: string) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const { error } = await supabase.from('exchange_requests').insert({
        from_user_id: user.id,
        to_user_id: 'other-user',
        offer_item_id: offerItemId,
        request_item_id: requestItemId,
        status: 'pending',
      });

      if (error) throw error;

      const newRequest: ExchangeRequest = {
        id: `exchange-${Date.now()}`,
        fromUserId: user.id,
        toUserId: 'other-user',
        offerItemId,
        requestItemId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_EXCHANGE_REQUEST', payload: newRequest });
    } catch (error) {
      console.error('Failed to create exchange request:', error);
      alert('创建交换请求失败');
    }
  };

  const updateExchangeStatus = (id: string, status: ExchangeRequest['status']) => {
    dispatch({ type: 'UPDATE_EXCHANGE_STATUS', payload: { id, status } });
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      getFavoriteItems,
      getFavoriteSkills,
      isFavorite,
      getRecommendations,
      addReview,
      createExchangeRequest,
      updateExchangeStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
