export interface Device {
  id: string;
  name: string;
  type: 'hub' | 'camera' | 'sensor' | 'switch' | 'lock' | 'light' | 'curtain';
  model: string;
  status: 'online' | 'offline' | 'warning';
  batteryLevel?: number;
  signalStrength?: number;
  room?: string;
  x?: number;
  y?: number;
}

export interface SiteTimelinePoint {
  time: string;
  status: 'online' | 'warning' | 'offline';
  length: number;
}

export interface Site {
  id: string;
  name: string;
  status: 'up-to-date' | 'warning' | 'offline' | 'invited';
  timeline: SiteTimelinePoint[];
  devices: Device[];
  location: string;
  timeZone: string;
  invited?: boolean;
  isp?: string;
  selectedGlow?: boolean;
  modelType?: string;
  deviceCountBadge?: string;
  mergeLink?: boolean;
  spaceId?: string;
  structureNodeId?: string | null;
  blueprint?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  /** 注册 Aqara Builder 账号时选择的国家/地区，属于账号基本信息（与 Studio Cloud 运维节点无关） */
  homeRegionId: string;
}

export interface Organization {
  id: string;
  name: string;
  type?: 'personal' | 'enterprise';
  ownerUserId?: string;
  createdAt?: string;
  description?: string;
}

/** 组织内成员角色：拥有者 / 管理员 / 普通成员 / 外部成员 */
export type OrgRole = 'owner' | 'admin' | 'member' | 'external';

/** Studio Cloud 区域节点：不同国家/地区连接到不同的 Studio 云 */
export type RegionCloudGroup = 'global' | 'cn' | 'ru';

export interface Region {
  id: string;
  name: string;
  flag: string;
  cloudEndpoint: string;
  latency?: string;
  /** 云组：global = US/EU/SG/KR 账号互通；cn / ru 为主权隔离区，账号不可跨组 */
  cloudGroup?: RegionCloudGroup;
  /** 主权隔离区标记（cn、ru） */
  isSovereign?: boolean;
}

export type AccountType = 'personal' | 'org_member';
export type MemberTag = 'internal' | 'external';
export type SpaceType = 'personal_space' | 'org_space';
export type SpaceRole = 'Owner' | 'Admin' | 'Operator';
export type ShareType = 'personal_space' | 'org_space';

/** Account 主表：个人原生账号 user_id；组织复合账号 user_id_org_id */
export interface Account {
  accountId: string;
  userId: string;
  orgId: string | null;
  accountType: AccountType;
  memberTag: MemberTag | null;
}

export interface Space {
  id: string;
  name: string;
  ownerAccountId: string;
  storageOrgId: string | null;
  spaceType: SpaceType;
  description?: string;
  createdAt: string;
  /** 项目资源配额（GB），个人默认 5，组织默认 50 */
  storageQuotaGb?: number;
  /** 该项目/Studio 所连接的 Studio Cloud 运维区域（REGIONS 的 id）；留空则回退到 owner 的 homeRegionId */
  regionId?: string;
}

/** 项目资源库中的条目 */
export type ProjectAssetKind = 'design' | 'data-backup' | 'ui-config';

export interface ProjectAsset {
  id: string;
  spaceId: string;
  name: string;
  kind: ProjectAssetKind;
  sizeMb: number;
  source: 'builder' | 'studio-cloud' | 'system';
  /** 若为设计文件，关联到项目方案 id */
  projectPlanId?: string;
  /** 若为界面配置(ui-config)，分配给的项目成员 accountId 列表 */
  assignedMemberAccountIds?: string[];
  /** 若为数据备份(data-backup)，标记为自动计划备份或手动触发备份 */
  backupType?: 'auto' | 'manual';
  /** 若为数据备份(data-backup)，来源 Studio(站点) id；每台 Studio 对应一份独立备份文件 */
  studioId?: string;
  createdAt: string;
}

/** Space 共享权限关联表 */
export interface SpaceShare {
  id: string;
  spaceId: string;
  targetAccountId: string;
  role: SpaceRole;
  /** 展示用角色名（如「爸爸」「妈妈」）；权限仍由 role(Admin/Operator) 决定 */
  roleLabel?: string;
  shareType: ShareType;
  status: 'Active' | 'Pending';
  invitedAt: string;
}

/** 项目自定义角色：仅映射到 Admin / Operator 权限，不单独配置细粒度权限 */
export interface SpaceCustomRole {
  id: string;
  spaceId: string;
  name: string;
  mapsTo: 'Admin' | 'Operator';
}

/** 设计平台方案关联到项目后形成的「项目方案」，可分发绑定到项目下不同 Studio */
export interface ProjectPlan {
  id: string;
  spaceId: string;
  planId: string;
  title: string;
  kind: 'plan' | 'plugin';
  devices: number;
  sizeMb: number;
  /** 已应用该方案的 Studio(站点) id 列表 */
  appliedSiteIds: string[];
  associatedAt: string;
  /** 来自插件市场（经 Lab AI 购买后应用到项目） */
  fromMarketplace?: boolean;
  marketplacePublisher?: string;
}

/** 估算方案设计文件占用（MB） */
export const estimateDesignSizeMb = (devices: number) =>
  Math.max(0.5, Math.round(devices * 0.18 * 10) / 10);

export interface OrgDepartment {
  id: string;
  orgId: string;
  name: string;
  parentId?: string | null;
}

/** 组织成员（internal 手动录入 / external 接受 org_space 邀请自动入组） */
export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  accountId: string;
  name: string;
  email: string;
  memberTag: MemberTag;
  departmentId?: string | null;
  isOrgAdmin: boolean;
  orgRole?: OrgRole;
  status: 'Active' | 'Pending';
  lastActiveAt?: string;
  dateAdded: string;
}

export interface SpaceStructureNode {
  id: string;
  name: string;
  spaceId: string;
  parentId?: string | null;
}

export interface PresetFloorPlan {
  id: string;
  name: string;
  dimensions: string;
  rooms: string[];
}

export const PERSONAL_ORG_ID = 'personal';
export const isEnterpriseOrg = (orgId: string) => orgId.startsWith('enterprise-');
export const isPersonalOrg = (orgId: string) => orgId === PERSONAL_ORG_ID;

export function personalAccountId(userId: string): string {
  return userId;
}

export function orgAccountId(userId: string, orgId: string): string {
  return `${userId}_${orgId}`;
}

export function resolveAccountId(userId: string, accountOrgId: string): string {
  return isPersonalOrg(accountOrgId) ? personalAccountId(userId) : orgAccountId(userId, accountOrgId);
}
