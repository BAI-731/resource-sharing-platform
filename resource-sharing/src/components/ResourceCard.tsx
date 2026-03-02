import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, MapPin } from 'lucide-react';
import { Card, CardImage, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Resource, ITEM_CATEGORIES, SKILL_CATEGORIES } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const navigate = useNavigate();
  const { dispatch, isFavorite } = useApp();
  const favorite = isFavorite(resource.id, resource.type);

  const categories = resource.type === 'item' ? ITEM_CATEGORIES : SKILL_CATEGORIES;
  const category = categories.find((c) => c.value === resource.category);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'TOGGLE_FAVORITE',
      payload: { id: resource.id, resourceType: resource.type },
    });
  };

  return (
    <Card
      onClick={() => navigate(`/${resource.type === 'item' ? 'items' : 'skills'}/${resource.id}`)}
      className="group"
    >
      <div className="relative">
        <CardImage src={resource.image} alt={resource.title} />
        {resource.isFeatured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-primary to-primary-light text-white">
            精选
          </Badge>
        )}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
            favorite
              ? 'bg-primary text-white shadow-lg scale-110'
              : 'bg-white/90 text-text-muted hover:bg-white hover:text-primary shadow-md'
          )}
        >
          <Heart className={cn('w-5 h-5', favorite && 'fill-current')} />
        </button>
      </div>
      <CardContent>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-text-primary line-clamp-2 flex-1 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
          <span className="text-lg font-bold text-primary whitespace-nowrap">
            {formatPrice(resource.price)}
          </span>
        </div>
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
          {resource.description}
        </p>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {resource.location}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {resource.views}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-text-muted">{formatDate(resource.createdAt)}</span>
          <span className="text-sm">{category?.icon} {category?.label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
