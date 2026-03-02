import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Archive, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';

export function ExpiryReminder() {
  const { state, dispatch } = useApp();
  const [expiringResources, setExpiringResources] = useState<any[]>([]);
  const [expiredResources, setExpiredResources] = useState<any[]>([]);
  const [showReminder, setShowReminder] = useState(false);

  // 检查资源到期情况
  useEffect(() => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allResources = [...state.items, ...state.skills];

    // 将要过期的资源(7天内)
    const expiring = allResources
      .filter(r => r.expiresAt)
      .filter(r => {
        const expiryDate = new Date(r.expiresAt || '');
        return expiryDate <= oneWeekLater && expiryDate > now;
      })
      .sort((a, b) => new Date(a.expiresAt || '').getTime() - new Date(b.expiresAt || '').getTime());

    // 已过期的资源
    const expired = allResources
      .filter(r => r.expiresAt)
      .filter(r => new Date(r.expiresAt!) <= now);

    setExpiringResources(expiring);
    setExpiredResources(expired);

    // 如果有即将到期或已过期的资源,显示提醒
    if (expiring.length > 0 || expired.length > 0) {
      setShowReminder(true);
    }
  }, [state.items, state.skills]);

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatusColor = (days: number) => {
    if (days <= 1) return 'bg-red-100 text-red-700 border-red-200';
    if (days <= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getExpiryStatusText = (days: number) => {
    if (days <= 1) return '即将到期';
    if (days <= 3) return '3天内到期';
    return `还有${days}天到期`;
  };

  const handleArchive = (resourceId: string) => {
    // 归档已过期的资源(这里简化处理,实际可能需要移到归档列表)
    dispatch({
      type: 'SET_ITEMS',
      payload: state.items.filter(i => i.id !== resourceId),
    });
    dispatch({
      type: 'SET_SKILLS',
      payload: state.skills.filter(s => s.id !== resourceId),
    });
  };

  const handleAutoArchive = () => {
    // 自动归档所有已过期的资源
    expiredResources.forEach(r => handleArchive(r.id));
  };

  if (!showReminder) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">资源到期提醒</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowReminder(false)}
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* 即将到期 */}
          {expiringResources.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="font-medium text-sm text-text-primary mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                即将过期 ({expiringResources.length})
              </h4>
              <div className="space-y-2">
                {expiringResources.map((resource) => {
                  const days = getDaysUntilExpiry(resource.expiresAt);
                  return (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{resource.title}</p>
                        <Badge className={`text-xs ${getExpiryStatusColor(days)}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {getExpiryStatusText(days)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 已过期 */}
          {expiredResources.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm text-text-primary flex items-center gap-2">
                  <Archive className="w-4 h-4 text-red-500" />
                  已过期 ({expiredResources.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1"
                  onClick={handleAutoArchive}
                >
                  <Trash2 className="w-3 h-3" />
                  全部归档
                </Button>
              </div>
              <div className="space-y-2">
                {expiredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-3 p-2 bg-red-50 rounded-lg"
                  >
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-12 h-12 object-cover rounded opacity-60"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-red-700">{resource.title}</p>
                      <p className="text-xs text-red-600">已过期</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100"
                      onClick={() => handleArchive(resource.id)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="bg-gray-50 p-3 border-t border-gray-100">
          <p className="text-xs text-text-muted text-center">
            提示:过期的资源会自动降低曝光度,建议及时归档
          </p>
        </div>
      </div>
    </div>
  );
}
