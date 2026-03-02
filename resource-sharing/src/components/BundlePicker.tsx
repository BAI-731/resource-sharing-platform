import React, { useState } from 'react';
import { ShoppingCart, Package, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface BundleItem {
  id: string;
  title: string;
  price: number;
  image: string;
  sellerId: string;
  buildingName?: string;
}

interface BundlePickerProps {
  availableItems: BundleItem[];
  onCreateBundle: (itemIds: string[]) => void;
}

export function BundlePicker({ availableItems, onCreateBundle }: BundlePickerProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // 只允许同一卖家的物品拼单
  const getSellerItems = (sellerId: string) => {
    return availableItems.filter(item => item.sellerId === sellerId);
  };

  const handleToggleItem = (itemId: string) => {
    const item = availableItems.find(i => i.id === itemId);
    if (!item) return;

    // 如果已选了其他卖家的物品，清空
    if (selectedItems.length > 0) {
      const firstItem = availableItems.find(i => i.id === selectedItems[0]);
      if (firstItem && firstItem.sellerId !== item.sellerId) {
        setSelectedItems([itemId]);
        return;
      }
    }

    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCreateBundle = () => {
    onCreateBundle(selectedItems);
    setShowModal(false);
    setSelectedItems([]);
  };

  const totalAmount = selectedItems.reduce((sum, id) => {
    const item = availableItems.find(i => i.id === id);
    return sum + (item?.price || 0);
  }, 0);

  const discount = selectedItems.length >= 3 ? 0.1 : selectedItems.length >= 2 ? 0.05 : 0;
  const finalAmount = totalAmount * (1 - discount);

  // 获取当前卖家信息
  const currentSeller = selectedItems.length > 0
    ? availableItems.find(i => i.id === selectedItems[0])?.sellerId
    : null;

  const sellerItems = currentSeller ? getSellerItems(currentSeller) : [];

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setShowModal(true)}
      >
        <ShoppingCart className="w-5 h-5" />
        拼单自提
        <Badge className="bg-teal-500 text-white">
          {discount > 0 ? `-${(discount * 100).toFixed(0)}%` : ''}
        </Badge>
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-500" />
                  拼单自提
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
              {/* 说明 */}
              <div className="bg-teal-50 rounded-xl p-4 mb-4 border border-teal-200">
                <div className="text-sm text-teal-900">
                  <p className="font-semibold mb-1">拼单规则</p>
                  <ul className="text-xs space-y-1">
                    <li>• 可选择同一卖家的多件商品</li>
                    <li>• 2件商品享受95折，3件及以上享受9折</li>
                    <li>• 统一下楼自提，节省时间</li>
                  </ul>
                </div>
              </div>

              {/* 可选商品 */}
              <div className="space-y-3 mb-4">
                {sellerItems.map(item => {
                  const isSelected = selectedItems.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                      onClick={() => handleToggleItem(item.id)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-text-primary line-clamp-1">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-primary">
                              ¥{item.price}
                            </span>
                            {isSelected ? (
                              <Check className="w-5 h-5 text-teal-500" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          {item.buildingName && (
                            <span className="text-xs text-text-secondary">
                              {item.buildingName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sellerItems.length === 0 && (
                  <div className="text-center py-8 text-text-secondary">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>暂无可拼单商品</p>
                  </div>
                )}
              </div>

              {/* 底部操作栏 */}
              {selectedItems.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-secondary">
                      已选 {selectedItems.length} 件
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-text-secondary line-through">
                        ¥{totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xl font-bold text-primary">
                        ¥{finalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-100 text-green-800">
                        已优惠 ¥{(totalAmount * discount).toFixed(2)}
                      </Badge>
                      <span className="text-xs text-text-secondary">
                        {selectedItems.length >= 3 ? '3件及以上9折' : '2件95折'}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full gap-2"
                    onClick={handleCreateBundle}
                  >
                    <Check className="w-4 h-4" />
                    确认拼单
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
