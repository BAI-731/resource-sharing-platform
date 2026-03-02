import React from 'react';
import { ArrowRightLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function ExchangeRequest() {
  const { state, createExchangeRequest, updateExchangeStatus } = useApp();

  const handleCreateExchange = () => {
    // 示例:创建交换请求
    if (state.items.length >= 2) {
      createExchangeRequest(state.items[0].id, state.items[1].id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待确认';
      case 'accepted':
        return '已接受';
      case 'rejected':
        return '已拒绝';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          物品交换
        </h3>
        <Badge className="bg-gradient-to-r from-primary to-primary-light text-white">
          以物易物
        </Badge>
      </div>

      {/* 我的交换请求 */}
      {state.exchangeRequests.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-text-secondary">我的交换请求</h4>
          {state.exchangeRequests.map((request) => {
            const offerItem = state.items.find(i => i.id === request.offerItemId);
            const requestItem = state.items.find(i => i.id === request.requestItemId);

            return (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <Clock className="w-4 h-4 text-text-muted" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-text-muted mb-1">我提供</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={offerItem?.image}
                        alt={offerItem?.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{offerItem?.title}</p>
                        <p className="text-xs text-text-muted">{offerItem?.category}</p>
                      </div>
                    </div>
                  </div>

                  <ArrowRightLeft className="w-6 h-6 text-primary flex-shrink-0" />

                  <div className="flex-1">
                    <p className="text-xs text-text-muted mb-1">我想要</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={requestItem?.image}
                        alt={requestItem?.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{requestItem?.title}</p>
                        <p className="text-xs text-text-muted">{requestItem?.category}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateExchangeStatus(request.id, 'accepted')}
                    >
                      接受交换
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => updateExchangeStatus(request.id, 'rejected')}
                    >
                      拒绝交换
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-secondary text-sm">暂无交换请求</p>
        </div>
      )}

      {/* 快速发起交换 */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-medium text-text-primary mb-3">快速发起交换</h4>
        <p className="text-xs text-text-muted mb-4">
          选择两件物品进行交换,无需金钱交易
        </p>
        <Button className="w-full gap-2" onClick={handleCreateExchange}>
          <ArrowRightLeft className="w-4 h-4" />
          创建交换请求
        </Button>
      </div>
    </div>
  );
}
