import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Resource } from '@/types';

interface ExchangeMatcherProps {
  currentItem: Resource;
  allItems: Resource[];
  onExchangeRequest: (offerItem: Resource, requestItem: Resource) => void;
}

interface MatchResult {
  offerItem: Resource;
  requestItem: Resource;
  score: number;
  matchReasons: string[];
}

export function ExchangeMatcher({ currentItem, allItems, onExchangeRequest }: ExchangeMatcherProps) {
  const [showModal, setShowModal] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 计算物品价值（简单算法）
  const calculateValueScore = (item: Resource): number => {
    let score = item.price;
    if (item.isFeatured) score *= 1.2;
    if (item.rating && item.rating >= 4.5) score *= 1.1;
    if (item.views > 100) score *= 1.05;
    return score;
  };

  // 匹配算法
  useEffect(() => {
    if (!currentItem.availableForExchange) return;

    const potentialMatches: MatchResult[] = [];

    allItems.forEach(item => {
      // 排除自己和不可交换的物品
      if (item.id === currentItem.id || !item.availableForExchange) return;

      let score = 0;
      const reasons: string[] = [];

      // 1. 价值匹配 (权重40%)
      const currentPrice = calculateValueScore(currentItem);
      const itemPrice = calculateValueScore(item);
      const priceRatio = currentPrice / itemPrice;

      if (priceRatio >= 0.8 && priceRatio <= 1.2) {
        score += 40;
        reasons.push('价值相当');
      } else if (priceRatio >= 0.6 && priceRatio <= 1.4) {
        score += 30;
        reasons.push('价值接近');
      }

      // 2. 品类匹配 (权重30%)
      if (item.category === currentItem.category) {
        score += 30;
        reasons.push('同类物品');
      } else if (
        ['books', 'study'].includes(item.category) &&
        ['books', 'study'].includes(currentItem.category)
      ) {
        score += 20;
        reasons.push('学习用品类');
      } else if (
        ['electronics'].includes(item.category) &&
        ['electronics'].includes(currentItem.category)
      ) {
        score += 20;
        reasons.push('电子品类');
      }

      // 3. 距离匹配 (权重20%)
      if (item.campusZone === currentItem.campusZone) {
        score += 20;
        reasons.push('同区域');
      } else if (item.buildingName === currentItem.buildingName) {
        score += 25;
        reasons.push('同楼');
      }

      // 4. 评分匹配 (权重10%)
      if (item.rating && item.rating >= 4.5) {
        score += 10;
        reasons.push('高评分');
      }

      // 5. 新旧程度（根据浏览量和评分推测）
      if (item.views < 50) {
        score += 5;
        reasons.push('较新');
      }

      if (score > 0) {
        potentialMatches.push({
          offerItem: currentItem,
          requestItem: item,
          score,
          matchReasons: reasons,
        });
      }
    });

    // 按分数排序并取前10个
    setMatches(potentialMatches.sort((a, b) => b.score - a.score).slice(0, 10));
  }, [currentItem, allItems]);

  // 过滤匹配结果
  const filteredMatches = matches.filter(match =>
    filterCategory === 'all' || match.requestItem.category === filterCategory
  );

  // 获取可用分类
  const categories = Array.from(
    new Set(matches.map(m => m.requestItem.category))
  );

  const handleExchange = (match: MatchResult) => {
    onExchangeRequest(match.offerItem, match.requestItem);
    setShowModal(false);
  };

  if (!currentItem.availableForExchange) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setShowModal(true)}
      >
        <TrendingUp className="w-5 h-5" />
        找置换
        {matches.length > 0 && (
          <Badge className="bg-primary text-white">
            {matches.length}个匹配
          </Badge>
        )}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  智能置换匹配
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-4">
              {/* 我的物品 */}
              <div className="bg-gradient-to-r from-primary/5 to-primary-light/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-primary">我的物品</span>
                  <Badge className="bg-green-100 text-green-800">
                    估值：¥{calculateValueScore(currentItem).toFixed(0)}
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary">{currentItem.title}</h4>
                    <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                      {currentItem.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {currentItem.campusZone && currentItem.campusZone}
                      </Badge>
                      {currentItem.buildingName && (
                        <span className="text-xs text-text-secondary">
                          {currentItem.buildingName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 分类筛选 */}
              {categories.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <Button
                    size="sm"
                    variant={filterCategory === 'all' ? 'primary' : 'outline'}
                    onClick={() => setFilterCategory('all')}
                  >
                    全部
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={filterCategory === cat ? 'primary' : 'outline'}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              )}

              {/* 匹配结果 */}
              {filteredMatches.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>暂无匹配物品</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMatches.map((match, index) => (
                    <div
                      key={match.requestItem.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex gap-4">
                        <img
                          src={match.requestItem.image}
                          alt={match.requestItem.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-text-primary text-sm">
                              {match.requestItem.title}
                            </h4>
                            <Badge className="bg-blue-100 text-blue-800">
                              匹配度 {match.score}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-green-100 text-green-800">
                              ¥{match.requestItem.price}
                            </Badge>
                            {match.requestItem.rating && (
                              <span className="text-xs text-text-secondary">
                                ⭐ {match.requestItem.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.matchReasons.map((reason, i) => (
                              <Badge
                                key={i}
                                className="text-xs bg-orange-100 text-orange-800"
                              >
                                {reason}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-text-secondary">
                              {match.requestItem.buildingName}
                            </div>
                            <Button
                              size="sm"
                              variant="primary"
                              className="gap-1"
                              onClick={() => handleExchange(match)}
                            >
                              <ArrowRight className="w-4 h-4" />
                              申请置换
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
