import { Site, Device } from './types';

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
  { id: 'personal', name: '个人工作区 (Personal Workspace)' },
  { id: 'enterprise-a', name: '企业A (星悦集团)' },
  { id: 'enterprise-b', name: '企业B (民生控股)' }
];

// Initial space seed representing homes, hotel projects, office towers, etc.
export const INITIAL_SPACES = [
  { id: 'my-home', name: '我的家 (My Home)', orgId: 'personal', description: '智能家居主控制区，包含一楼客厅和二楼卧室设备', createdAt: '2026-01-10' },
  { id: 'bachelor-pad', name: '单身公寓 (Bachelor Pad)', orgId: 'personal', description: '高品质独立套房，全屋智控调光与影音娱乐系统', createdAt: '2026-03-15' },
  
  { id: 'xingyue-hotel', name: '星悦酒店项目 (Xingyue Hotel Project)', orgId: 'enterprise-a', description: '高奢酒店前台大堂、全客房物联控制及核心后勤网络机房运维', createdAt: '2026-02-01' },
  { id: 'tech-park', name: '科创研发大楼 (Tech Park R&D Building)', orgId: 'enterprise-a', description: '科创大楼办公设备联动，包含空气质量传感器和多级联动开关', createdAt: '2025-11-20' },
  
  { id: 'minsheng-hq', name: '民生总部大楼 (Minsheng HQ Building)', orgId: 'enterprise-b', description: '民生总部核心大楼全方位监控，集成NOC监控中心及高安全级物理锁控', createdAt: '2025-05-12' },
  { id: 'retail-stores', name: '联营智慧门店 (Co-managed Smart Stores)', orgId: 'enterprise-b', description: '全国主力联营零售店，包括上海、北京、广州门店客流统计与大屏状态展示', createdAt: '2026-04-18' }
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
