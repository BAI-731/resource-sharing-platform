import React, { useState } from 'react';
import { QrCode, CheckCircle, AlertCircle, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface FaceToFaceTradeProps {
  resourceId: string;
  sellerName: string;
  sellerPhone: string;
  price: number;
  onTradeComplete: () => void;
}

export function FaceToFaceTrade({
  resourceId,
  sellerName,
  sellerPhone,
  price,
  onTradeComplete,
}: FaceToFaceTradeProps) {
  const [showModal, setShowModal] = useState(false);
  const [tradeStep, setTradeStep] = useState<'meet' | 'inspect' | 'confirm' | 'completed'>('meet');
  const [qrCode, setQrCode] = useState(`TRADE-${resourceId}-${Date.now()}`);

  // 推荐见面地点
  const suggestedLocations = [
    { name: '紫荆公寓一楼大厅', icon: '🏢', distance: '50m' },
    { name: '学生服务中心', icon: '🏢', distance: '200m' },
    { name: '图书馆一楼', icon: '📚', distance: '300m' },
    { name: '便利店（紫荆店）', icon: '🏪', distance: '100m' },
  ];

  // 安全提醒
  const safetyTips = [
    '📍 选择人流量较大的公共场所见面',
    '⏰ 白天交易，避免夜间单独见面',
    '📱 保留聊天记录和对方联系方式',
    '💰 验货后再扫码确认付款',
    '🚫 不要提前转账给陌生人',
    '👥 可让同学陪同交易',
  ];

  const handleMeet = () => {
    setTradeStep('inspect');
  };

  const handleConfirm = () => {
    setTradeStep('confirm');
  };

  const handleComplete = () => {
    setTradeStep('completed');
    setTimeout(() => {
      onTradeComplete();
      setShowModal(false);
      setTradeStep('meet');
    }, 2000);
  };

  return (
    <>
      <Button
        variant="primary"
        className="w-full gap-2"
        onClick={() => setShowModal(true)}
      >
        <QrCode className="w-5 h-5" />
        当面交易
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  当面交易担保
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTradeStep('meet');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 交易步骤 */}
            <div className="p-4">
              {/* 步骤指示器 */}
              <div className="flex items-center justify-between mb-6">
                {[
                  { step: 'meet', label: '见面' },
                  { step: 'inspect', label: '验货' },
                  { step: 'confirm', label: '确认' },
                  { step: 'completed', label: '完成' },
                ].map((item, index) => (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          tradeStep === item.step
                            ? 'bg-primary text-white'
                            : ['meet', 'inspect', 'confirm', 'completed'].indexOf(tradeStep) > index
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {['meet', 'inspect', 'confirm', 'completed'].indexOf(tradeStep) > index ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="text-xs mt-1 text-text-secondary">{item.label}</span>
                    </div>
                    {index < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          ['meet', 'inspect', 'confirm', 'completed'].indexOf(tradeStep) > index
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* 步骤内容 */}
              {tradeStep === 'meet' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-blue-900">见面地点</span>
                    </div>
                    <div className="space-y-2">
                      {suggestedLocations.map((loc, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-text-primary">{loc.name}</span>
                            <Badge className="bg-green-100 text-green-800">
                              {loc.distance}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-primary">安全提醒</p>
                    {safetyTips.map((tip, index) => (
                      <p key={index} className="text-xs text-text-secondary">
                        {tip}
                      </p>
                    ))}
                  </div>

                  <Button variant="primary" className="w-full" onClick={handleMeet}>
                    已见面，继续验货
                  </Button>
                </div>
              )}

              {tradeStep === 'inspect' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-orange-900">验货确认</span>
                    </div>
                    <div className="text-sm text-orange-800 space-y-2">
                      <p>请仔细检查商品：</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        <li>外观是否与描述一致</li>
                        <li>功能是否正常</li>
                        <li>配件是否齐全</li>
                        <li>是否有损坏或瑕疵</li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-text-secondary mb-4">
                      卖家：<span className="font-semibold">{sellerName}</span>
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ¥{price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setTradeStep('meet')}>
                      返回
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={handleConfirm}>
                      验货通过，确认交易
                    </Button>
                  </div>
                </div>
              )}

              {tradeStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
                    <QrCode className="w-32 h-32 mx-auto text-green-600" />
                    <p className="mt-4 text-sm text-green-800">
                      请卖家扫描此二维码确认收款
                    </p>
                    <p className="mt-2 text-xs text-green-600">
                      交易码：{qrCode}
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-900">
                        扫码后款项将立即转给卖家，请确保已验货完成
                      </span>
                    </div>
                  </div>

                  <Button variant="primary" className="w-full" onClick={handleComplete}>
                    交易完成
                  </Button>
                </div>
              )}

              {tradeStep === 'completed' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-text-primary mb-2">
                    交易完成！
                  </h4>
                  <p className="text-text-secondary">
                    感谢使用当面交易担保功能
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
