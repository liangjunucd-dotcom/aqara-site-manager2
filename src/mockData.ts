import { Site, Device, orgAccountId, personalAccountId, ProjectPlan, ProjectAsset, estimateDesignSizeMb } from './types';

// Let's seed devices for all 19 sites so they match the category counts in the UI perfectly
// Category counts to target: Hubs (17), Cameras (14), Locks (11), Sensors (11), Switches (11)
export const INITIAL_SITES: Site[] = [
  {
    id: 'local-branch-office',
    name: '我的家主控制区 (Main Studio)',
    status: 'up-to-date',
    location: '客厅 (Living Room)',
    timeZone: 'PST (UTC-8)',
    selectedGlow: true,
    mergeLink: true,
    modelType: 'UCG Fiber',
    isp: 'AT&T Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'lbo-hub', name: '客厅 M3 网关', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: '客厅' },
      { id: 'lbo-cam', name: '玄关 E1 摄像机', type: 'camera', model: 'Smart Camera E1', status: 'online', room: '玄关' },
      { id: 'lbo-lock', name: '入户门 U200 门锁', type: 'lock', model: 'Smart Lock U200', status: 'online', room: '玄关' },
      { id: 'lbo-sensor', name: '客厅高精度传感器', type: 'sensor', model: 'Presence Sensor FP2', status: 'online', room: '客厅' },
      { id: 'lbo-switch', name: '客厅双路开关 H1', type: 'switch', model: 'Smart Wall Switch H1', status: 'online', room: '客厅' }
    ]
  },
  {
    id: 'corporate-hq',
    name: '单身公寓智控中心 (Central Studio)',
    status: 'up-to-date',
    location: '主居室 (Studio Room)',
    timeZone: 'PST (UTC-8)',
    mergeLink: true,
    modelType: 'UCG Ultra',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 80 },
      { time: '11:00', status: 'warning', length: 10 },
      { time: 'Now', status: 'online', length: 10 }
    ],
    devices: [
      { id: 'corp-hub', name: '公寓 M3 网关', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: '居室' },
      { id: 'corp-cam', name: '阳台摄像机 G3', type: 'camera', model: 'Camera Hub G3', status: 'online', room: '阳台' }
    ]
  },
  {
    id: 'strategic-hq',
    name: 'Strategic HQ',
    status: 'invited',
    invited: true,
    location: 'Official Hosting',
    timeZone: 'EST (UTC-5)',
    modelType: 'Official Hosting',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'strat-hub', name: 'Cloud gateway', type: 'hub', model: 'Aqara Hub E1', status: 'online', room: 'Cloud' }
    ]
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    status: 'up-to-date',
    location: 'UDW',
    timeZone: 'CST (UTC-6)',
    modelType: 'UDW',
    isp: 'Vodafone',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'wh-hub', name: 'Warehouse Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Dock A' },
      { id: 'wh-cam', name: 'Dock Camera', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Dock A' },
      { id: 'wh-lock', name: 'Gate Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Dock A' }
    ]
  },
  {
    id: 'global-hq',
    name: 'Global HQ',
    status: 'up-to-date',
    location: 'EFG',
    timeZone: 'EST (UTC-5)',
    selectedGlow: true,
    modelType: 'EFG',
    isp: 'Verizon Fios Business',
    deviceCountBadge: '2',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'ghq-hub', name: 'Primary Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Suite 500' },
      { id: 'ghq-cam', name: 'CEO Office Cam', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Suite 500' },
      { id: 'ghq-lock', name: 'Secured Safe Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Suite 500' }
    ]
  },
  {
    id: 'main-office',
    name: 'Main Office',
    status: 'invited',
    invited: true,
    location: 'UDM SE',
    timeZone: 'PST (UTC-8)',
    modelType: 'UDM SE',
    isp: 'Vodafone',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'mo-hub', name: 'Central Gateway', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Main Room' },
      { id: 'mo-cam', name: 'Lobby Cam', type: 'camera', model: 'Smart Camera E1', status: 'online', room: 'Lobby' },
      { id: 'mo-lock', name: 'Entrance Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Lobby' }
    ]
  },
  {
    id: 'operations-hub',
    name: 'Operations Hub',
    status: 'invited',
    invited: true,
    location: 'UNVR Pro',
    timeZone: 'EST (UTC-5)',
    modelType: 'UNVR Pro',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 60 },
      { time: '11:00', status: 'warning', length: 15 },
      { time: 'Now', status: 'online', length: 25 }
    ],
    devices: [
      { id: 'op-hub', name: 'Ops Hub M3', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Control Room' },
      { id: 'op-cam-1', name: 'Cam Area A', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Floor' },
      { id: 'op-cam-2', name: 'Cam Area B', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Floor' }
    ]
  },
  {
    id: 'administrative-center',
    name: 'Administrative Center',
    status: 'up-to-date',
    location: 'UDM Pro Max',
    timeZone: 'PST (UTC-8)',
    mergeLink: true,
    modelType: 'UDM Pro Max',
    isp: 'AT&T Business',
    deviceCountBadge: '2',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'admin-hub', name: 'Admin Central', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Records Room' },
      { id: 'admin-sensor', name: 'Filing Motion', type: 'sensor', model: 'Presence Sensor FP2', status: 'online', room: 'Records Room' },
      { id: 'admin-lock', name: 'Vault Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Records Room' }
    ]
  },
  {
    id: 'business-center',
    name: 'Business Center',
    status: 'up-to-date',
    location: 'UDM Pro',
    timeZone: 'EST (UTC-5)',
    mergeLink: true,
    modelType: 'UDM Pro',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'biz-hub', name: 'Biz Hub E1', type: 'hub', model: 'Aqara Hub E1', status: 'online', room: 'Cubicle Hall' },
      { id: 'biz-switch', name: 'Key Switch', type: 'switch', model: 'Smart Wall Switch H1', status: 'online', room: 'Cubicle Hall' }
    ]
  },
  {
    id: 'innovation-hub',
    name: 'Innovation Hub',
    status: 'up-to-date',
    location: 'UDR',
    timeZone: 'PST (UTC-8)',
    modelType: 'UDR',
    isp: 'AT&T',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'inn-hub', name: 'M3 Router', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Lab' },
      { id: 'inn-cam', name: 'Lab Overhead', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Lab' }
    ]
  },
  {
    id: 'service-center',
    name: 'Service Center',
    status: 'invited',
    invited: true,
    location: 'UDM Pro Max',
    timeZone: 'CST (UTC-6)',
    modelType: 'UDM Pro Max',
    isp: 'Verizon Fios Business',
    deviceCountBadge: '2',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'sc-hub', name: 'Service gateway', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Front Office' },
      { id: 'sc-cam', name: 'Entrance Monitor', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Entrance' },
      { id: 'sc-lock', name: 'Front Entrance Deadbolt', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Entrance' }
    ]
  },
  {
    id: 'technology-hub',
    name: 'Technology Hub',
    status: 'up-to-date',
    location: 'Network Server',
    timeZone: 'PST (UTC-8)',
    mergeLink: true,
    modelType: 'Network Server',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'tech-hub', name: 'Network Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Rack 1' },
      { id: 'tech-sensor', name: 'Rack Temp Sensor', type: 'sensor', model: 'Temperature Sensor T1', status: 'online', room: 'Rack 1' }
    ]
  },
  {
    id: 'regional-hq',
    name: 'Regional HQ',
    status: 'invited',
    invited: true,
    location: 'UDM Pro',
    timeZone: 'EST (UTC-5)',
    selectedGlow: true,
    modelType: 'UDM Pro',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'reg-hub', name: 'Regional Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'HQ Lobby' },
      { id: 'reg-cam', name: 'Lobby Monitor', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'HQ Lobby' },
      { id: 'reg-lock', name: 'Back Door Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'HQ Lobby' }
    ]
  },
  {
    id: 'executive-office',
    name: 'Executive Office',
    status: 'up-to-date',
    location: 'UNVR Pro',
    timeZone: 'EST (UTC-5)',
    modelType: 'UNVR Pro',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'exec-hub', name: 'Executive Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Executive Suite' },
      { id: 'exec-sensor', name: 'Suite Presence', type: 'sensor', model: 'Presence Sensor FP2', status: 'online', room: 'Executive Suite' }
    ]
  },
  {
    id: 'global-command-center',
    name: 'Global Command Center',
    status: 'up-to-date',
    location: 'Network Server',
    timeZone: 'EST (UTC-5)',
    modelType: 'Network Server',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'gcc-hub', name: 'Command Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'NOC Room' },
      { id: 'gcc-cam', name: 'NOC Cam', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'NOC Room' },
      { id: 'gcc-lock', name: 'NOC Main Door Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'NOC Room' }
    ]
  },
  {
    id: 'global-operations-center',
    name: 'Global Operations Center',
    status: 'invited',
    invited: true,
    location: 'UDM Pro Max',
    timeZone: 'EST (UTC-5)',
    modelType: 'UDM Pro Max',
    isp: 'Comcast Business',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'goc-hub', name: 'GOC Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Command Deck' },
      { id: 'goc-switch', name: 'Power Rail Switch', type: 'switch', model: 'Smart Wall Switch H1', status: 'online', room: 'Command Deck' }
    ]
  },
  {
    id: 'branch-hub',
    name: 'Branch Hub',
    status: 'up-to-date',
    location: 'Official Hosting',
    timeZone: 'PST (UTC-8)',
    modelType: 'Official Hosting',
    isp: 'Vodafone',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'bh-hub', name: 'Branch Hub E1', type: 'hub', model: 'Aqara Hub E1', status: 'online', room: 'Main Room' },
      { id: 'bh-sensor', name: 'Branch Temp Sensor', type: 'sensor', model: 'Temperature Sensor T1', status: 'online', room: 'Main Room' }
    ]
  },
  {
    id: 'international-hq',
    name: 'International HQ',
    status: 'invited',
    invited: true,
    location: 'UDM Pro Max',
    timeZone: 'GMT (UTC+0)',
    modelType: 'UDM Pro Max',
    isp: 'TET',
    timeline: [
      { time: '05:00', status: 'online', length: 70 },
      { time: '11:00', status: 'warning', length: 20 }, // Blue phase
      { time: 'Now', status: 'online', length: 10 }
    ],
    devices: [
      { id: 'int-hub', name: 'Intl Core Router', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Main Hub Room' },
      { id: 'int-sensor', name: 'Global Presence Detector', type: 'sensor', model: 'Presence Sensor FP2', status: 'online', room: 'Main Lobby' }
    ]
  },
  {
    id: 'customer-support-center',
    name: 'Customer Support Center',
    status: 'up-to-date',
    location: 'UDM Pro Max',
    timeZone: 'EST (UTC-5)',
    modelType: 'UDM Pro Max',
    isp: 'AT&T Business',
    deviceCountBadge: '2',
    timeline: [
      { time: '05:00', status: 'online', length: 100 }
    ],
    devices: [
      { id: 'csc-hub', name: 'Support Gateway', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Call Center' },
      { id: 'csc-cam', name: 'Call Floor Overhead', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Call Center' },
      { id: 'csc-lock', name: 'Call Center Back Office Lock', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Call Center' }
    ]
  }
];

// Initial organization seed
export const INITIAL_ORGANIZATIONS = [
  { id: 'personal', name: '个人工作区 (Personal Workspace)', type: 'personal' as const },
  { id: 'enterprise-a', name: '企业A (星悦集团)', type: 'enterprise' as const, ownerUserId: 'user-jun', createdAt: '2025-05-23 23:49:49', description: '星悦集团，智慧酒店与商用空间物联交付。' },
  { id: 'enterprise-b', name: '企业B (民生控股)', type: 'enterprise' as const, ownerUserId: 'user-jun', createdAt: '2024-11-08 10:12:30', description: '民生控股，总部办公与全国零售门店智能运维。' }
];

// Studio Cloud 全球区域节点 — 6 个数据中心
// cloudGroup: global = US/EU/SG/KR 账号互通；cn / ru 为主权隔离区，账号与项目数据不可跨组
export const REGIONS = [
  { id: 'cn', name: '中国大陆', flag: '🇨🇳', cloudEndpoint: 'cn-hangzhou.studio.aqara.com', latency: '32ms', cloudGroup: 'cn' as const, isSovereign: true },
  { id: 'us', name: '美国 (US West)', flag: '🇺🇸', cloudEndpoint: 'us-west.studio.aqara.com', latency: '186ms', cloudGroup: 'global' as const },
  { id: 'eu', name: '欧洲 (Frankfurt)', flag: '🇪🇺', cloudEndpoint: 'eu-central.studio.aqara.com', latency: '224ms', cloudGroup: 'global' as const },
  { id: 'ru', name: '俄罗斯', flag: '🇷🇺', cloudEndpoint: 'ru-central.studio.aqara.com', latency: '145ms', cloudGroup: 'ru' as const, isSovereign: true },
  { id: 'sg', name: '新加坡 (SEA)', flag: '🇸🇬', cloudEndpoint: 'ap-southeast.studio.aqara.com', latency: '78ms', cloudGroup: 'global' as const },
  { id: 'kr', name: '韩国 (Seoul)', flag: '🇰🇷', cloudEndpoint: 'kr.studio.aqara.com', latency: '61ms', cloudGroup: 'global' as const },
];

// 设计平台 (Aqara Builder) 中已完成的方案 / 已购买插件 — 可应用到 Site Manager Space
export const DESIGN_PLATFORM_PLANS = [
  { id: 'dp-1', title: '现代两居别墅方案', updatedAt: '2026-06-30 11:03:58', status: 'In Design', devices: 18, area: '145 m²', kind: 'plan' as const },
  { id: 'dp-2', title: '高层公寓全屋智控', updatedAt: '2026-06-28 09:41:12', status: 'Completed', devices: 32, area: '210 m²', kind: 'plan' as const },
  { id: 'dp-3', title: '星悦酒店标准客房模板', updatedAt: '2026-06-25 16:22:05', status: 'Completed', devices: 12, area: '38 m²', kind: 'plan' as const },
  { id: 'dp-4', title: '零售门店客流大屏插件', updatedAt: '2026-06-20 14:08:33', status: 'Plugin', devices: 6, area: '—', kind: 'plugin' as const },
  { id: 'dp-5', title: '智慧办公会议室方案', updatedAt: '2026-06-18 10:55:47', status: 'In Design', devices: 21, area: '96 m²', kind: 'plan' as const },
  { id: 'dp-6', title: '能耗监测分析插件', updatedAt: '2026-06-12 08:30:19', status: 'Plugin', devices: 4, area: '—', kind: 'plugin' as const },
  { id: 'dp-7', title: '多店客流热力图', updatedAt: '2026-06-10 11:22:00', status: 'Plugin', devices: 5, area: '—', kind: 'plugin' as const, fromMarketplace: true, marketplacePublisher: 'Retail Labs' },
];

export const INITIAL_ORG_DEPARTMENTS = [
  // Enterprise A — 星悦集团
  { id: 'ea-root', name: '星悦集团总部', orgId: 'enterprise-a', parentId: null },
  { id: 'ea-hotel', name: '酒店事业部', orgId: 'enterprise-a', parentId: 'ea-root' },
  { id: 'ea-hotel-front', name: '前台运营部', orgId: 'enterprise-a', parentId: 'ea-hotel' },
  { id: 'ea-hotel-guest', name: '客房服务部', orgId: 'enterprise-a', parentId: 'ea-hotel' },
  { id: 'ea-tech', name: '技术研发部', orgId: 'enterprise-a', parentId: 'ea-root' },
  // Enterprise B — 民生控股
  { id: 'eb-root', name: '民生控股集团', orgId: 'enterprise-b', parentId: null },
  { id: 'eb-hq', name: '总部管理中心', orgId: 'enterprise-b', parentId: 'eb-root' },
  { id: 'eb-retail', name: '零售事业部', orgId: 'enterprise-b', parentId: 'eb-root' },
  { id: 'eb-security', name: '信息安全部', orgId: 'enterprise-b', parentId: 'eb-root' },
];

export const DEMO_USERS = [
  { id: 'user-jun', email: 'liangjunucd@gmail.com', displayName: 'Jun (userA)', homeRegionId: 'cn' },
  { id: 'user-sysadmin', email: 'system-admin@aqara.com', displayName: 'System Admin (userB)', homeRegionId: 'us' },
  { id: 'user-installer', email: 'remote.eng@aqara.com', displayName: 'Installer (userC)', homeRegionId: 'sg' },
  { id: 'user-yanbin', email: 'yanbin@example.com', displayName: '焱彬', homeRegionId: 'cn' },
  { id: 'user-staff', email: 'staff.a@xingyuehotel.com', displayName: 'Hotel Staff (userD)', homeRegionId: 'eu' },
];

export const INITIAL_ACCOUNTS = [
  { accountId: personalAccountId('user-jun'), userId: 'user-jun', orgId: null, accountType: 'personal' as const, memberTag: null },
  { accountId: personalAccountId('user-installer'), userId: 'user-installer', orgId: null, accountType: 'personal' as const, memberTag: null },
  { accountId: personalAccountId('user-yanbin'), userId: 'user-yanbin', orgId: null, accountType: 'personal' as const, memberTag: null },
  { accountId: orgAccountId('user-jun', 'enterprise-a'), userId: 'user-jun', orgId: 'enterprise-a', accountType: 'org_member' as const, memberTag: 'internal' as const },
  { accountId: orgAccountId('user-jun', 'enterprise-b'), userId: 'user-jun', orgId: 'enterprise-b', accountType: 'org_member' as const, memberTag: 'internal' as const },
  { accountId: orgAccountId('user-sysadmin', 'enterprise-a'), userId: 'user-sysadmin', orgId: 'enterprise-a', accountType: 'org_member' as const, memberTag: 'internal' as const },
  { accountId: orgAccountId('user-staff', 'enterprise-a'), userId: 'user-staff', orgId: 'enterprise-a', accountType: 'org_member' as const, memberTag: 'internal' as const },
  { accountId: orgAccountId('user-installer', 'enterprise-a'), userId: 'user-installer', orgId: 'enterprise-a', accountType: 'org_member' as const, memberTag: 'external' as const },
];

export const INITIAL_ORG_MEMBERS = [
  { id: 'ea-m1', orgId: 'enterprise-a', userId: 'user-jun', accountId: orgAccountId('user-jun', 'enterprise-a'), name: 'Jun (userA)', email: 'liangjunucd@gmail.com', memberTag: 'internal' as const, departmentId: 'ea-tech', isOrgAdmin: true, orgRole: 'owner' as const, status: 'Active' as const, lastActiveAt: '今天 23:18', dateAdded: '2026-01-15' },
  { id: 'ea-m2', orgId: 'enterprise-a', userId: 'user-sysadmin', accountId: orgAccountId('user-sysadmin', 'enterprise-a'), name: 'System Admin (userB)', email: 'system-admin@aqara.com', memberTag: 'internal' as const, departmentId: 'ea-tech', isOrgAdmin: true, orgRole: 'admin' as const, status: 'Active' as const, lastActiveAt: '2026-06-22 13:08', dateAdded: '2026-01-20' },
  { id: 'ea-m3', orgId: 'enterprise-a', userId: 'user-staff', accountId: orgAccountId('user-staff', 'enterprise-a'), name: 'Hotel Staff (userD)', email: 'staff.a@xingyuehotel.com', memberTag: 'internal' as const, departmentId: 'ea-hotel-front', isOrgAdmin: false, orgRole: 'member' as const, status: 'Active' as const, lastActiveAt: '2026-06-08 00:19', dateAdded: '2026-02-10' },
  { id: 'ea-m4', orgId: 'enterprise-a', userId: 'user-installer', accountId: orgAccountId('user-installer', 'enterprise-a'), name: 'Installer (userC)', email: 'remote.eng@aqara.com', memberTag: 'external' as const, isOrgAdmin: false, orgRole: 'external' as const, status: 'Active' as const, lastActiveAt: '2026-06-15 09:42', dateAdded: '2026-06-15' },
  { id: 'eb-m1', orgId: 'enterprise-b', userId: 'user-jun', accountId: orgAccountId('user-jun', 'enterprise-b'), name: 'Jun (userA)', email: 'liangjunucd@gmail.com', memberTag: 'internal' as const, departmentId: 'eb-hq', isOrgAdmin: true, orgRole: 'owner' as const, status: 'Active' as const, lastActiveAt: '今天 21:05', dateAdded: '2026-01-15' },
];

// Initial space seed — PRD V1.3 personal_space / org_space
export const INITIAL_SPACES = [
  { id: 'my-home', name: 'Jun的家 (My Home)', ownerAccountId: personalAccountId('user-jun'), storageOrgId: null, spaceType: 'personal_space' as const, description: '个人私有空间，智能家居主控制区', createdAt: '2026-01-10', storageQuotaGb: 5 },
  { id: 'bachelor-pad', name: '单身公寓 (Bachelor Pad)', ownerAccountId: personalAccountId('user-jun'), storageOrgId: null, spaceType: 'personal_space' as const, description: '高品质独立套房全屋智控', createdAt: '2026-03-15', storageQuotaGb: 5 },
  { id: 'yanbin-home', name: '焱彬的家', ownerAccountId: personalAccountId('user-yanbin'), storageOrgId: null, spaceType: 'personal_space' as const, description: '焱彬的个人私有空间', createdAt: '2026-02-20', storageQuotaGb: 5 },
  { id: 'installer-home', name: 'Installer 的家', ownerAccountId: personalAccountId('user-installer'), storageOrgId: null, spaceType: 'personal_space' as const, description: 'Installer 个人私有空间', createdAt: '2026-01-05', storageQuotaGb: 5 },

  { id: 'tech-park', name: '崇文大楼 (Chongwen Building)', ownerAccountId: orgAccountId('user-jun', 'enterprise-a'), storageOrgId: 'enterprise-a', spaceType: 'org_space' as const, description: '企业A商用场地，科创研发大楼物联运维', createdAt: '2025-11-20', storageQuotaGb: 50, regionId: 'cn' },
  { id: 'xingyue-hotel', name: '星悦酒店项目 (Xingyue Hotel)', ownerAccountId: orgAccountId('user-jun', 'enterprise-a'), storageOrgId: 'enterprise-a', spaceType: 'org_space' as const, description: '高奢酒店全客房物联控制及核心机房运维（美西数据中心）', createdAt: '2026-02-01', storageQuotaGb: 50, regionId: 'us' },

  { id: 'minsheng-hq', name: '民生总部大楼 (Minsheng HQ)', ownerAccountId: orgAccountId('user-jun', 'enterprise-b'), storageOrgId: 'enterprise-b', spaceType: 'org_space' as const, description: '民生总部核心大楼全方位监控', createdAt: '2025-05-12', storageQuotaGb: 50, regionId: 'cn' },
  { id: 'retail-stores', name: '联营智慧门店 (Smart Stores)', ownerAccountId: orgAccountId('user-jun', 'enterprise-b'), storageOrgId: 'enterprise-b', spaceType: 'org_space' as const, description: '全国主力联营零售店客流统计与大屏展示（东南亚节点）', createdAt: '2026-04-18', storageQuotaGb: 50, regionId: 'sg' },
];

/** 项目方案库 — 设计平台导入后可分发到多台 Studio */
export const INITIAL_PROJECT_PLANS: ProjectPlan[] = [
  {
    id: 'pp-hotel-std',
    spaceId: 'xingyue-hotel',
    planId: 'dp-3',
    title: '星悦酒店标准客房模板',
    kind: 'plan',
    devices: 12,
    sizeMb: estimateDesignSizeMb(12),
    appliedSiteIds: ['warehouse', 'global-hq'],
    associatedAt: '2026-03-10',
  },
  {
    id: 'pp-hotel-suite',
    spaceId: 'xingyue-hotel',
    planId: 'dp-2',
    title: '行政套房全屋智控',
    kind: 'plan',
    devices: 32,
    sizeMb: estimateDesignSizeMb(32),
    appliedSiteIds: ['main-office'],
    associatedAt: '2026-03-18',
  },
  {
    id: 'pp-tech-office',
    spaceId: 'tech-park',
    planId: 'dp-5',
    title: '智慧办公会议室方案',
    kind: 'plan',
    devices: 21,
    sizeMb: estimateDesignSizeMb(21),
    appliedSiteIds: ['operations-hub'],
    associatedAt: '2026-04-02',
  },
  {
    id: 'pp-retail-traffic',
    spaceId: 'retail-stores',
    planId: 'dp-7',
    title: '多店客流热力图',
    kind: 'plugin',
    devices: 5,
    sizeMb: estimateDesignSizeMb(5),
    appliedSiteIds: [],
    associatedAt: '2026-06-11',
    fromMarketplace: true,
    marketplacePublisher: 'Retail Labs',
  },
];

/** 项目资源库资源（方案设计 + 数据备份 + 界面配置等） */
export const INITIAL_PROJECT_ASSETS: ProjectAsset[] = [
  { id: 'asset-hotel-std', spaceId: 'xingyue-hotel', name: '星悦酒店标准客房模板', kind: 'design', sizeMb: estimateDesignSizeMb(12), source: 'builder', projectPlanId: 'pp-hotel-std', createdAt: '2026-03-10' },
  { id: 'asset-hotel-suite', spaceId: 'xingyue-hotel', name: '行政套房全屋智控', kind: 'design', sizeMb: estimateDesignSizeMb(32), source: 'builder', projectPlanId: 'pp-hotel-suite', createdAt: '2026-03-18' },
  // 数据备份：Site Manager 在 Studio Cloud 侧对项目下多台 Studio(本地主机) 的数据进行云端备份
  { id: 'asset-hotel-data-1', spaceId: 'xingyue-hotel', name: 'Backup-8f3a2c.zip', kind: 'data-backup', sizeMb: 128, source: 'studio-cloud', backupType: 'auto', createdAt: '2026-07-01 00:00' },
  { id: 'asset-hotel-data-2', spaceId: 'xingyue-hotel', name: 'Backup-2b91e7.zip', kind: 'data-backup', sizeMb: 42, source: 'studio-cloud', backupType: 'manual', studioId: 'warehouse', createdAt: '2026-06-28 14:32' },
  { id: 'asset-hotel-data-3', spaceId: 'xingyue-hotel', name: 'Backup-5d0c14.zip', kind: 'data-backup', sizeMb: 38, source: 'studio-cloud', backupType: 'manual', studioId: 'global-hq', createdAt: '2026-06-27 09:20' },
  { id: 'asset-hotel-ui', spaceId: 'xingyue-hotel', name: '客房控制面板 · 深色主题', kind: 'ui-config', sizeMb: 8.5, source: 'builder', assignedMemberAccountIds: [orgAccountId('user-sysadmin', 'enterprise-a'), orgAccountId('user-staff', 'enterprise-a')], createdAt: '2026-05-20' },
  { id: 'asset-tech-design', spaceId: 'tech-park', name: '智慧办公会议室方案', kind: 'design', sizeMb: estimateDesignSizeMb(21), source: 'builder', projectPlanId: 'pp-tech-office', createdAt: '2026-04-02' },
  { id: 'asset-tech-data', spaceId: 'tech-park', name: 'Backup-a17f9b.zip', kind: 'data-backup', sizeMb: 96, source: 'studio-cloud', backupType: 'auto', createdAt: '2026-06-30 00:00' },
  { id: 'asset-tech-data-2', spaceId: 'tech-park', name: 'Backup-c3e820.zip', kind: 'data-backup', sizeMb: 34, source: 'studio-cloud', backupType: 'manual', studioId: 'operations-hub', createdAt: '2026-06-21 09:15' },
  { id: 'asset-tech-ui', spaceId: 'tech-park', name: '会议室场景 App 界面包', kind: 'ui-config', sizeMb: 12, source: 'builder', assignedMemberAccountIds: [], createdAt: '2026-06-10' },
  { id: 'asset-retail-plugin', spaceId: 'retail-stores', name: '多店客流热力图', kind: 'design', sizeMb: estimateDesignSizeMb(5), source: 'builder', projectPlanId: 'pp-retail-traffic', createdAt: '2026-06-11' },
];

export const INITIAL_SPACE_SHARES = [
  // personal_space 共享：焱彬的家 → Jun Admin（已接受 = Added）
  { id: 'ps-1', spaceId: 'yanbin-home', targetAccountId: personalAccountId('user-jun'), role: 'Admin' as const, shareType: 'personal_space' as const, status: 'Active' as const, invitedAt: '2026-03-01' },
  // personal_space 待接受邀请：Jun 邀请 焱彬 加入「Jun的家」，等待对方接受（Pending）
  { id: 'ps-pending-1', spaceId: 'my-home', targetAccountId: personalAccountId('user-yanbin'), role: 'Operator' as const, shareType: 'personal_space' as const, status: 'Pending' as const, invitedAt: '2026-07-05' },
  // org_space 内部共享
  { id: 'os-1', spaceId: 'tech-park', targetAccountId: orgAccountId('user-sysadmin', 'enterprise-a'), role: 'Admin' as const, shareType: 'org_space' as const, status: 'Active' as const, invitedAt: '2026-01-20' },
  { id: 'os-2', spaceId: 'xingyue-hotel', targetAccountId: orgAccountId('user-sysadmin', 'enterprise-a'), role: 'Admin' as const, shareType: 'org_space' as const, status: 'Active' as const, invitedAt: '2026-01-20' },
  { id: 'os-3', spaceId: 'tech-park', targetAccountId: orgAccountId('user-staff', 'enterprise-a'), role: 'Admin' as const, shareType: 'org_space' as const, status: 'Active' as const, invitedAt: '2026-02-10' },
  { id: 'os-4', spaceId: 'xingyue-hotel', targetAccountId: orgAccountId('user-staff', 'enterprise-a'), role: 'Admin' as const, shareType: 'org_space' as const, status: 'Active' as const, invitedAt: '2026-02-10' },
  // org_space 外部 Installer — 仅崇文大楼 Operator
  { id: 'os-5', spaceId: 'tech-park', targetAccountId: orgAccountId('user-installer', 'enterprise-a'), role: 'Operator' as const, shareType: 'org_space' as const, status: 'Active' as const, invitedAt: '2026-06-15' },
];

// Initial Space Structure nodes for folder tree customization
export const INITIAL_SPACE_STRUCTURE_NODES = [
  // Xingyue Hotel structure
  { id: 'hotel-lobby', name: 'Reception & Lobby 酒店大堂', spaceId: 'xingyue-hotel', parentId: null },
  { id: 'hotel-lobby-front', name: '接待前台 (Front Desk)', spaceId: 'xingyue-hotel', parentId: 'hotel-lobby' },
  { id: 'hotel-lobby-lounge', name: '大堂休息区 (Lobby Lounge)', spaceId: 'xingyue-hotel', parentId: 'hotel-lobby' },
  { id: 'hotel-guest', name: 'Guest Rooms Wing 客房区域', spaceId: 'xingyue-hotel', parentId: null },
  { id: 'hotel-guest-std', name: '标准客房 (Standard Rooms)', spaceId: 'xingyue-hotel', parentId: 'hotel-guest' },
  { id: 'hotel-guest-suite', name: '行政套房 (Executive Suites)', spaceId: 'xingyue-hotel', parentId: 'hotel-guest' },
  { id: 'hotel-back', name: 'Back Office & Server Room 后勤机房', spaceId: 'xingyue-hotel', parentId: null },
  
  // Tech Park structure (matching user screenshot)
  { id: 'park-bldg', name: '科创研发大楼', spaceId: 'tech-park', parentId: null },
  { id: 'park-floor8', name: '崇文-8楼', spaceId: 'tech-park', parentId: 'park-bldg' },
  { id: 'park-floor8-front', name: '崇文-8楼-前台', spaceId: 'tech-park', parentId: 'park-floor8' },
  { id: 'park-floor7', name: '崇文-7楼', spaceId: 'tech-park', parentId: 'park-bldg' },
  { id: 'park-floor7-office', name: '崇文-7楼-办公区', spaceId: 'tech-park', parentId: 'park-floor7' },
  { id: 'park-floor7-zonea', name: '办公区A区', spaceId: 'tech-park', parentId: 'park-floor7-office' },
  
  // Minsheng HQ structure
  { id: 'minsheng-noc', name: 'Security NOC Center 8F 监控中心', spaceId: 'minsheng-hq', parentId: null },
  { id: 'minsheng-board', name: 'Executive Boardroom 16F 董事会议厅', spaceId: 'minsheng-hq', parentId: null },
  { id: 'minsheng-server', name: 'Primary Server Room 2F 核心网络机房', spaceId: 'minsheng-hq', parentId: null },
  
  // Retail Stores structure
  { id: 'store-sh', name: 'Shanghai Flagship 上海旗舰店', spaceId: 'retail-stores', parentId: null },
  { id: 'store-bj', name: 'Beijing Sanlitun 北京三里屯店', spaceId: 'retail-stores', parentId: null },
  { id: 'store-gz', name: 'Guangzhou Taikoo Hui 广州太古汇店', spaceId: 'retail-stores', parentId: null }
];

export const AVAILABLE_DEVICES_FOR_DESIGN = [
  { type: 'hub', name: 'Aqara Hub M3', model: 'HM3-G01', desc: 'Central Matter Controller & Thread Border Router' },
  { type: 'camera', name: 'Camera Hub G3', model: 'CH-H03', desc: '2K Pan & Tilt camera with localized AI recognition' },
  { type: 'lock', name: 'Smart Lock U200', model: 'SL-U200', desc: 'Apple Home Key enabled retrofit smart deadbolt' },
  { type: 'sensor', name: 'Presence Sensor FP2', model: 'PS-FP2', desc: 'Millimeter-wave radar multi-person tracking' },
  { type: 'sensor', name: 'Door & Window Sensor T1', model: 'DW-T1', desc: 'Zigbee 3.0 contact trigger for automations' },
  { type: 'switch', name: 'Smart Wall Switch H1', model: 'WS-H1', desc: 'Triple key wired light switch with power telemetry' },
  { type: 'curtain', name: 'Curtain Driver E1', model: 'CD-E1', desc: 'Rechargeable rod/track motorized retrofitter' },
  { type: 'light', name: 'Ceiling Light T1', model: 'CL-T1', desc: 'Tunable white ceiling lamp with Zigbee mesh repeat' }
];

export const PRESET_FLOOR_PLANS = [
  {
    id: 'plan-1',
    name: 'Modern 2-Bedroom Villa',
    dimensions: '145 m² (12.5m x 11.6m)',
    rooms: ['Living Room', 'Master Bedroom', 'Guest Bedroom', 'Kitchen', 'Corridor', 'Patio']
  },
  {
    id: 'plan-2',
    name: 'High-tech Urban Loft',
    dimensions: '88 m² (8.0m x 11.0m)',
    rooms: ['Open Living Area', 'Kitchenette', 'Mezzanine Bed', 'Work Studio', 'Balcony']
  },
  {
    id: 'plan-3',
    name: 'Smart HQ Office Floor',
    dimensions: '320 m² (20.0m x 16.0m)',
    rooms: ['Reception', 'Main Office Area', 'Meeting Room A', 'Executive Suite', 'Pantry']
  }
];
