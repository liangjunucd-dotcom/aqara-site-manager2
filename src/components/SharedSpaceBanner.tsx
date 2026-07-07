import React from 'react';
import { Share2 } from 'lucide-react';
import { SpacePermissions } from '../utils/accountContext';

interface SharedSpaceBannerProps {
  permissions: SpacePermissions;
  spaceType: 'personal_space' | 'org_space';
  orgName?: string;
}

export default function SharedSpaceBanner({ permissions, spaceType, orgName }: SharedSpaceBannerProps) {
  if (!permissions.isShared) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-900">
      <Share2 size={14} className="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-extrabold">
          共享视图 · {permissions.role}
          {spaceType === 'org_space' && orgName ? ` · ${orgName}` : ''}
        </p>
        <p className="text-amber-700/80 mt-0.5 leading-relaxed">
          {spaceType === 'personal_space'
            ? '您通过 personal_space 共享获得访问权，无法删除或转让此空间。'
            : '您通过 org_space 邀请自动加入组织，仅能操作授权范围内的设备与工单，无法删除项目或管理组织成员。'}
        </p>
      </div>
    </div>
  );
}
