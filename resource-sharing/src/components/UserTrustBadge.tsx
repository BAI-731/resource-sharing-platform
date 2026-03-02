import React from 'react';
import { ShieldCheck, GraduationCap, MapPin, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface UserTrustBadgeProps {
  userProfile?: {
    studentId?: string;
    department?: string;
    major?: string;
    buildingNumber?: string;
    roomNumber?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    trustScore?: number;
    cancelledOrders?: number;
  };
  isSameBuilding?: boolean;
  isSameDormitory?: boolean;
  isSameMajor?: boolean;
}

export function UserTrustBadge({
  userProfile,
  isSameBuilding,
  isSameDormitory,
  isSameMajor,
}: UserTrustBadgeProps) {
  // 脱敏展示房间号
  const getMaskedRoom = (buildingNumber?: string, roomNumber?: string) => {
    if (!buildingNumber || !roomNumber) return '';
    const maskedRoom = roomNumber.slice(0, -2) + '**';
    return `${buildingNumber}栋 ${maskedRoom}室`;
  };

  // 脱敏展示学号
  const getMaskedStudentId = (studentId?: string) => {
    if (!studentId) return '';
    return studentId.slice(0, 3) + '****' + studentId.slice(-3);
  };

  // 信任等级计算
  const getTrustLevel = (trustScore?: number) => {
    if (!trustScore) return { label: '未认证', color: 'bg-gray-500 text-white' };
    if (trustScore >= 90) return { label: '高信任', color: 'bg-green-500 text-white' };
    if (trustScore >= 70) return { label: '中信任', color: 'bg-blue-500 text-white' };
    if (trustScore >= 50) return { label: '一般', color: 'bg-yellow-500 text-white' };
    return { label: '低信任', color: 'bg-red-500 text-white' };
  };

  // 风险等级展示
  const getRiskBadge = () => {
    if (!userProfile?.riskLevel || userProfile.riskLevel === 'low') return null;

    const riskConfig = {
      medium: {
        color: 'bg-yellow-100 text-yellow-800',
        text: '⚠️ 交易谨慎',
      },
      high: {
        color: 'bg-red-100 text-red-800',
        text: '🚫 高风险用户',
      },
    };

    const config = riskConfig[userProfile.riskLevel];
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <AlertTriangle className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const trustLevel = getTrustLevel(userProfile?.trustScore);

  return (
    <div className="space-y-2">
      {/* 信任等级 */}
      <Badge className={`${trustLevel.color} flex items-center gap-1`}>
        <ShieldCheck className="w-3 h-3" />
        {trustLevel.label} {userProfile?.trustScore && `(${userProfile.trustScore}分)`}
      </Badge>

      {/* 同楼同院系标识 */}
      <div className="flex flex-wrap gap-1">
        {isSameDormitory && (
          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            同寝室楼
          </Badge>
        )}
        {isSameBuilding && (
          <Badge className="bg-indigo-100 text-indigo-800 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            同楼
          </Badge>
        )}
        {isSameMajor && (
          <Badge className="bg-cyan-100 text-cyan-800 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            同专业
          </Badge>
        )}
      </div>

      {/* 学校身份信息 */}
      {userProfile?.studentId && (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            <span>学号：{getMaskedStudentId(userProfile.studentId)}</span>
          </div>
          {userProfile.department && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              <span>院系：{userProfile.department}</span>
            </div>
          )}
          {userProfile.major && (
            <div className="flex items-center gap-1 mt-1">
              <span>专业：{userProfile.major}</span>
            </div>
          )}
          {userProfile.buildingNumber && userProfile.roomNumber && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              <span>位置：{getMaskedRoom(userProfile.buildingNumber, userProfile.roomNumber)}</span>
            </div>
          )}
        </div>
      )}

      {/* 风险提示 */}
      {getRiskBadge()}

      {/* 取消订单提示 */}
      {userProfile?.cancelledOrders && userProfile.cancelledOrders > 3 && (
        <div className="text-xs text-orange-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          近期取消订单较多
        </div>
      )}
    </div>
  );
}

export function getCurrentUserProfile() {
  // 模拟当前用户信息
  return {
    id: 'current-user',
    name: '张三',
    studentId: '2021001234',
    department: '计算机系',
    major: '计算机科学与技术',
    buildingNumber: '3',
    roomNumber: '502',
    phone: '138****8888',
    riskLevel: 'low' as const,
    cancelledOrders: 0,
    complaintCount: 0,
    trustScore: 95,
  };
}
