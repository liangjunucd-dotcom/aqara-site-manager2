import React, { useState, useEffect } from 'react';
import {
  INITIAL_SITES, INITIAL_ORGANIZATIONS, INITIAL_SPACES, INITIAL_SPACE_STRUCTURE_NODES,
  INITIAL_ORG_DEPARTMENTS, INITIAL_ORG_MEMBERS, DEMO_USERS, INITIAL_ACCOUNTS, INITIAL_SPACE_SHARES,
  REGIONS, DESIGN_PLATFORM_PLANS, INITIAL_PROJECT_PLANS, INITIAL_PROJECT_ASSETS,
  getEligibleProjectCountries, countryToRegionId,
} from './mockData';
import {
  Site, Device, Space, SpaceStructureNode, OrgDepartment, OrgMember, Organization, OrgRole,
  Account, SpaceShare, User, SpaceCustomRole, ProjectPlan, ProjectAsset, estimateDesignSizeMb,
  isEnterpriseOrg, isPersonalOrg, resolveAccountId, PERSONAL_ORG_ID,
} from './types';
import {
  getAccessibleOrgs, getVisibleSpaces, getSpacePermissions, isExternalMember, getSpaceCollaborators,
  getSpaceRegionId, getEligibleDataCenterRegionIds, getSwitchableOpsRegionIds,
} from './utils/accountContext';
import {
  buildSiteManagerUrl,
  persistActiveWorkspaceId,
  resolveInitialWorkspaceId,
} from './utils/workspaceContext';
import {
  inviteOrgSpaceExternal, invitePersonalSpace, removeOrgMember, removeSpaceShare, addInternalOrgMember,
  addOrgMembersToProject, ensurePersonalAccountForShare,
} from './utils/spaceActions';
import SpaceHubView from './components/SpaceHubView';
import SiteDetails from './components/SiteDetails';
import BuilderLab from './components/BuilderLab';
import AnalyticsView from './components/AnalyticsView';
import ProjectAnalyticsView from './components/ProjectAnalyticsView';
import ProjectAlertsView from './components/ProjectAlertsView';
import ProjectUpdatesView from './components/ProjectUpdatesView';
import SpaceSettingsView from './components/SpaceSettingsView';
import OrgAdminView from './components/OrgAdminView';
import PersonalProjectIndex from './components/PersonalProjectIndex';
import OrgProjectIndex from './components/OrgProjectIndex';
import SharedSpaceBanner from './components/SharedSpaceBanner';
import AccountSwitcher from './components/AccountSwitcher';
import RegionOpsControl from './components/RegionOpsControl';
import PersonalSettingsView from './components/PersonalSettingsView';
import DesignPlatformView, { DesignPlan, UiThemeAsset } from './components/DesignPlatformView';
import EnterOrgModal from './components/EnterOrgModal';
import WorkspacePickerModal from './components/WorkspacePickerModal';
import ProjectStoragePanel from './components/ProjectStoragePanel';
import SiteManagerSidebar from './components/SiteManagerSidebar';
import WorkspaceHomeView from './components/WorkspaceHomeView';
import {
  workspaceAvatarClass,
  workspaceInitial,
} from './components/WorkspaceSwitcher';
import { 
  LayoutGrid, UserCircle, LogOut, Send, Puzzle, ChevronRight, Building2,
} from 'lucide-react';

type AppView = 'workspace-home' | 'projects' | 'org-admin' | 'personal-settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'sites' | 'storage' | 'builder' | 'analytics' | 'space-settings'
    | 'analytics-dashboard' | 'alerts' | 'updates'
  >('sites');
  
  // Organization, Space, and Subdivision Node states
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [structureNodes, setStructureNodes] = useState<SpaceStructureNode[]>(INITIAL_SPACE_STRUCTURE_NODES);

  const [activeOrgId, setActiveOrgId] = useState<string>('personal');
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [appView, setAppView] = useState<AppView>('projects');
  const [currentUserId, setCurrentUserId] = useState('user-jun');

  // Which platform is currently active: Site Manager (运维) vs Lab AI (创作)
  const [activePlatform, setActivePlatform] = useState<'site-manager' | 'lab-ai'>('lab-ai');

  // 运维区域（当前 Studio Cloud 数据源节点）—— 区别于账号归属地 homeRegionId
  const [activeOpsRegionId, setActiveOpsRegionId] = useState<string>('us');
  const [opsRegionNote, setOpsRegionNote] = useState<string | null>(null);

  // Lab AI 创作物应用到 Site Manager Space 的流程
  const [applyPlan, setApplyPlan] = useState<DesignPlan | null>(null);
  const [applyUi, setApplyUi] = useState<UiThemeAsset | null>(null);
  const [applyTargetOrgId, setApplyTargetOrgId] = useState<string>('personal');
  const [applyTargetSpaceId, setApplyTargetSpaceId] = useState<string>('__new__');

  // 项目自定义角色 & 项目关联的设计方案（方案库）
  const [spaceCustomRoles, setSpaceCustomRoles] = useState<SpaceCustomRole[]>([]);
  const [projectPlans, setProjectPlans] = useState<ProjectPlan[]>(INITIAL_PROJECT_PLANS);
  const [projectAssets, setProjectAssets] = useState<ProjectAsset[]>(INITIAL_PROJECT_ASSETS);

  // Header and Sidebar Dropdowns
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isWorkspacePickerModalOpen, setIsWorkspacePickerModalOpen] = useState(false);
  const [isEnterOrgModalOpen, setIsEnterOrgModalOpen] = useState(false);

  // New Space creation state inside Spaces Index Page
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [newSpaceCountryId, setNewSpaceCountryId] = useState('cn');

  // Search inside Spaces Index Page
  const [searchSpaceQuery, setSearchSpaceQuery] = useState('');

  // Enterprise org structure & members (project access inherited from org)
  const [orgDepartments, setOrgDepartments] = useState<OrgDepartment[]>(INITIAL_ORG_DEPARTMENTS);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>(INITIAL_ORG_MEMBERS);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [spaceShares, setSpaceShares] = useState<SpaceShare[]>(INITIAL_SPACE_SHARES);

  const [roles, setRoles] = useState([
    { id: 'r1', name: 'Super Admin', desc: 'Full root access to all Studios, project configurations, and audit logs.', permissions: ['read', 'write', 'provision', 'admin'] },
    { id: 'r2', name: 'System Engineer', desc: 'Manage devices, update blueprints, and run diagnostics.', permissions: ['read', 'write', 'provision'] },
    { id: 'r3', name: 'Operator', desc: 'Trigger room automations and toggle active states.', permissions: ['read', 'write'] },
    { id: 'r4', name: 'Viewer', desc: 'Read-only telemetry and health overview.', permissions: ['read'] }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'log1', time: '2026-07-05 02:15:30', user: 'liangjunucd@gmail.com', action: 'Project Structure Modified', detail: 'Added division node "Executive Suite B"' },
    { id: 'log2', time: '2026-07-05 01:42:10', user: 'system-admin@aqara.com', action: 'Device Synchronized', detail: 'Linked Matter Hub Aqara M3' },
    { id: 'log3', time: '2026-07-04 18:20:00', user: 'liangjunucd@gmail.com', action: 'Blueprint Assigned', detail: 'Allocated blueprint v1.0 to Front Entrance' },
    { id: 'log4', time: '2026-07-04 11:35:15', user: 'staff.a@xingyuehotel.com', action: 'Project Switched', detail: 'Checked-in room controller status' },
    { id: 'log5', time: '2026-07-03 09:12:44', user: 'liangjunucd@gmail.com', action: 'Member Invited', detail: 'Invited remote.eng@aqara.com to project' }
  ]);

  const [sites, setSites] = useState<Site[]>(() => {
    // programmatically distribute the 19 initial physical controller nodes into their default spaces/subdivisions
    return INITIAL_SITES.map((site, index) => {
      let spaceId = 'my-home';
      let structureNodeId: string | null = null;
      let blueprint = 'blueprint v1.0';

      if (index === 0) {
        spaceId = 'my-home';
        structureNodeId = null;
        blueprint = 'blueprint v1.0';
      } else if (index === 1) {
        spaceId = 'bachelor-pad';
        structureNodeId = null;
        blueprint = 'blueprint v1.1';
      } else if (index >= 2 && index < 6) {
        spaceId = 'xingyue-hotel';
        if (index === 2) structureNodeId = 'hotel-lobby-front';
        else if (index === 3) structureNodeId = 'hotel-lobby-lounge';
        else if (index === 4) structureNodeId = 'hotel-guest-suite';
        else structureNodeId = 'hotel-back';
        blueprint = index === 5 ? 'blueprint v2.0' : 'blueprint v1.0';
      } else if (index >= 6 && index < 9) {
        spaceId = 'tech-park';
        if (index === 6) structureNodeId = 'park-floor8-front';
        else if (index === 7) structureNodeId = 'park-floor7-office';
        else structureNodeId = 'park-floor7-zonea';
        blueprint = 'blueprint v1.5';
      } else if (index >= 9 && index < 13) {
        spaceId = 'minsheng-hq';
        if (index === 9) structureNodeId = 'minsheng-noc';
        else if (index === 10) structureNodeId = 'minsheng-board';
        else if (index === 11) structureNodeId = 'minsheng-server';
        else structureNodeId = null;
        blueprint = index === 12 ? 'blueprint v3.0' : 'blueprint v1.0';
      } else {
        spaceId = 'retail-stores';
        if (index === 13) structureNodeId = 'store-sh';
        else if (index === 14) structureNodeId = 'store-bj';
        else if (index === 15) structureNodeId = 'store-gz';
        else structureNodeId = null;
        blueprint = 'blueprint v1.0';
      }

      return {
        ...site,
        spaceId,
        structureNodeId,
        blueprint
      };
    });
  });

  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);

  // Read ?platform= from URL on load; restore shared workspace context
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    const accessibleIds = getAccessibleOrgs(currentUserId, organizations, orgMembers).map(o => o.id);
    const workspaceId = resolveInitialWorkspaceId(accessibleIds);

    if (platform === 'site-manager') {
      setActivePlatform('site-manager');
      setActiveOrgId(workspaceId);
      setActiveSpaceId(null);
      setAppView('projects');
    } else if (platform === 'lab-ai') {
      setActivePlatform('lab-ai');
      setActiveOrgId(workspaceId);
    } else {
      setActivePlatform('lab-ai');
      setActiveOrgId(workspaceId);
    }
  }, []);

  // Switch Organization（不强制切平台，Lab 内切换工作区仍留在 Lab）
  const handleOrgChange = (orgId: string) => {
    setActiveOrgId(orgId);
    setActiveSpaceId(null);
    setAppView('projects');
    persistActiveWorkspaceId(orgId);
    setIsProfileDropdownOpen(false);
    setIsWorkspacePickerModalOpen(false);
    setIsEnterOrgModalOpen(false);
  };

  const handleSelectWorkspaceFromHome = (orgId: string) => {
    handleOrgChange(orgId);
  };

  const openWorkspacePickerModal = () => {
    setIsProfileDropdownOpen(false);
    setIsWorkspacePickerModalOpen(true);
  };

  const handleSelectWorkspaceFromModal = (orgId: string) => {
    handleOrgChange(orgId);
    setIsWorkspacePickerModalOpen(false);
  };

  const openSiteManagerInNewTab = () => {
    persistActiveWorkspaceId(activeOrgId);
    window.open(buildSiteManagerUrl(activeOrgId), '_blank');
    setIsProfileDropdownOpen(false);
  };

  const openOrgAdmin = (orgId?: string) => {
    if (orgId && orgId !== activeOrgId) setActiveOrgId(orgId);
    setActiveSpaceId(null);
    setAppView('org-admin');
    setActivePlatform('site-manager');
    setIsProfileDropdownOpen(false);
  };

  const openPersonalSettings = () => {
    setActiveSpaceId(null);
    setAppView('personal-settings');
    setActivePlatform('site-manager');
    setIsProfileDropdownOpen(false);
  };

  // 组织拥有者移交
  const handleTransferOwner = (newOwnerUserId: string) => {
    const oldOwnerId = organizations.find(o => o.id === activeOrgId)?.ownerUserId ?? currentUserId;
    setOrganizations(organizations.map(o => o.id === activeOrgId ? { ...o, ownerUserId: newOwnerUserId } : o));
    setOrgMembers(orgMembers.map(m => {
      if (m.orgId !== activeOrgId) return m;
      if (m.userId === newOwnerUserId) return { ...m, orgRole: 'owner' as OrgRole, isOrgAdmin: true };
      if (m.userId === oldOwnerId) return { ...m, orgRole: 'admin' as OrgRole, isOrgAdmin: true };
      return m;
    }));
  };

  // 删除组织：销毁 org_space、成员复合账号、部门等
  const handleDeleteOrg = () => {
    const orgId = activeOrgId;
    setSpaces(spaces.filter(s => s.storageOrgId !== orgId));
    setSpaceShares(spaceShares.filter(sh => {
      const sp = spaces.find(s => s.id === sh.spaceId);
      return sp?.storageOrgId !== orgId;
    }));
    setOrgMembers(orgMembers.filter(m => m.orgId !== orgId));
    setOrgDepartments(orgDepartments.filter(d => d.orgId !== orgId));
    setAccounts(accounts.filter(a => a.orgId !== orgId));
    setOrganizations(organizations.filter(o => o.id !== orgId));
    setActiveOrgId('personal');
    setActiveSpaceId(null);
    setAppView('projects');
  };

  const handleChangeMemberRole = (memberId: string, role: OrgRole) => {
    setOrgMembers(orgMembers.map(m => m.id === memberId ? { ...m, orgRole: role, isOrgAdmin: role === 'admin' || role === 'owner' } : m));
  };

  // 退出组织（拥有者需先移交，UI 层已拦截）
  const handleExitOrg = (orgId: string) => {
    const member = orgMembers.find(m => m.orgId === orgId && m.userId === currentUserId);
    if (!member) return;
    const result = removeOrgMember({ memberId: member.id, orgMembers, spaceShares, accounts });
    setOrgMembers(result.orgMembers);
    setSpaceShares(result.spaceShares);
    setAccounts(result.accounts);
    if (activeOrgId === orgId) {
      setActiveOrgId('personal');
      setActiveSpaceId(null);
      setAppView('projects');
    }
  };

  /** 更换账号所属区域（低频高风险操作）：更新 User.homeRegionId，派生区域随之更新 */
  const handleChangeRegion = (userId: string, regionId: string) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, homeRegionId: regionId } : u)));
  };

  // 从 Lab AI 请求应用方案到 Site Manager
  const openApplyPlan = (plan: DesignPlan) => {
    setApplyPlan(plan);
    setApplyUi(null);
    setApplyTargetOrgId(isPersonalOrg(activeOrgId) ? 'personal' : activeOrgId);
    setApplyTargetSpaceId('__new__');
  };

  const openApplyUi = (item: UiThemeAsset) => {
    setApplyUi(item);
    setApplyPlan(null);
    setApplyTargetOrgId(isPersonalOrg(activeOrgId) ? 'personal' : activeOrgId);
    setApplyTargetSpaceId('__new__');
  };

  const resolveApplyTargetSpaceId = (): string => {
    const item = applyPlan ?? applyUi;
    if (!item) return '';
    const isPersonal = isPersonalOrg(applyTargetOrgId);
    if (applyTargetSpaceId !== '__new__') return applyTargetSpaceId;
    const newId = `space-${Date.now()}`;
    const newSpaceObj: Space = {
      id: newId,
      name: item.title,
      ownerAccountId: resolveAccountId(currentUserId, applyTargetOrgId),
      storageOrgId: isPersonal ? null : applyTargetOrgId,
      spaceType: isPersonal ? 'personal_space' : 'org_space',
      description: applyPlan
        ? `由 Lab 方案「${applyPlan.title}」创建`
        : `由 Lab 界面配置「${applyUi!.title}」创建`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSpaces(prev => [...prev, newSpaceObj]);
    return newId;
  };

  const confirmApplyPlan = () => {
    if (!applyPlan) return;
    const targetSpaceId = resolveApplyTargetSpaceId();
    const planId = `pp-${Date.now()}`;
    const assetId = `asset-${Date.now()}`;
    setProjectPlans(prev => {
      const exists = prev.some(pp => pp.spaceId === targetSpaceId && pp.planId === applyPlan.id);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: planId,
          spaceId: targetSpaceId,
          planId: applyPlan.id,
          title: applyPlan.title,
          kind: applyPlan.kind,
          devices: applyPlan.devices,
          sizeMb: estimateDesignSizeMb(applyPlan.devices),
          appliedSiteIds: [],
          associatedAt: new Date().toISOString().split('T')[0],
          ...(applyPlan.fromMarketplace && {
            fromMarketplace: true,
            marketplacePublisher: applyPlan.marketplacePublisher,
          }),
        },
      ];
    });
    setProjectAssets(prev => {
      const exists = prev.some(a => a.spaceId === targetSpaceId && a.name === applyPlan.title && a.kind === 'design');
      if (exists) return prev;
      return [
        ...prev,
        {
          id: assetId,
          spaceId: targetSpaceId,
          name: applyPlan.title,
          kind: 'design',
          sizeMb: estimateDesignSizeMb(applyPlan.devices),
          source: 'builder',
          projectPlanId: planId,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ];
    });
    setApplyPlan(null);
    setActivePlatform('site-manager');
    setActiveOrgId(applyTargetOrgId);
    persistActiveWorkspaceId(applyTargetOrgId);
    setActiveSpaceId(targetSpaceId);
    setAppView('projects');
    setActiveTab('storage');
    setActiveSiteId(null);
  };

  const confirmApplyUi = () => {
    if (!applyUi) return;
    const targetSpaceId = resolveApplyTargetSpaceId();
    setProjectAssets(prev => {
      const exists = prev.some(a => a.spaceId === targetSpaceId && a.name === applyUi.title && a.kind === 'ui-config');
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `asset-ui-${Date.now()}`,
          spaceId: targetSpaceId,
          name: applyUi.title,
          kind: 'ui-config',
          sizeMb: 8,
          source: 'builder',
          createdAt: new Date().toISOString().split('T')[0],
        },
      ];
    });
    setApplyUi(null);
    setActivePlatform('site-manager');
    setActiveOrgId(applyTargetOrgId);
    persistActiveWorkspaceId(applyTargetOrgId);
    setActiveSpaceId(targetSpaceId);
    setAppView('projects');
    setActiveTab('storage');
    setActiveSiteId(null);
  };

  // Switch Space
  const handleSpaceChange = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setActiveTab('sites');
    setActiveSiteId(null);
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const newId = `space-${Date.now()}`;
    const isPersonal = isPersonalOrg(activeOrgId);
    const ownerAccountId = resolveAccountId(currentUserId, activeOrgId);
    const newSpaceObj: Space = {
      id: newId,
      name: newSpaceName,
      ownerAccountId,
      storageOrgId: isPersonal ? null : activeOrgId,
      spaceType: isPersonal ? 'personal_space' : 'org_space',
      description: newSpaceDesc || '',
      createdAt: new Date().toISOString().split('T')[0],
      regionId: countryToRegionId(newSpaceCountryId),
    };
    setSpaces([...spaces, newSpaceObj]);
    setNewSpaceName('');
    setNewSpaceDesc('');
    setIsNewSpaceModalOpen(false);
    setActiveSpaceId(newId);
    setActiveTab('sites');
    setActiveSiteId(null);
  };

  const handleUpdateDeviceStatus = (siteId: string, deviceId: string, updates: Partial<Device>) => {
    setSites(prevSites => prevSites.map(site => {
      if (site.id !== siteId) return site;
      
      const updatedDevices = site.devices.map(device => {
        if (device.id === deviceId) {
          return { ...device, ...updates };
        }
        return device;
      });

      // Recalculate site general status based on device states
      let nextSiteStatus: Site['status'] = 'up-to-date';
      const hasOffline = updatedDevices.some(d => d.status === 'offline');
      const hasWarning = updatedDevices.some(d => d.status === 'warning');
      
      if (hasOffline) {
        nextSiteStatus = 'offline';
      } else if (hasWarning) {
        nextSiteStatus = 'warning';
      } else if (site.invited) {
        nextSiteStatus = 'invited';
      }

      return {
        ...site,
        devices: updatedDevices,
        status: nextSiteStatus
      };
    }));
  };

  const handleAddDeviceToSite = (siteId: string, device: Device) => {
    setSites(prevSites => prevSites.map(site => {
      if (site.id !== siteId) return site;
      return {
        ...site,
        devices: [...site.devices, device]
      };
    }));
  };

  const handleRemoveDeviceFromSite = (siteId: string, deviceId: string) => {
    setSites(prevSites => prevSites.map(site => {
      if (site.id !== siteId) return site;
      return {
        ...site,
        devices: site.devices.filter(d => d.id !== deviceId)
      };
    }));
  };

  const handleUpdateSite = (siteId: string, updates: Partial<Site>) => {
    setSites(prevSites => prevSites.map(site => {
      if (site.id !== siteId) return site;
      return { ...site, ...updates };
    }));
  };

  const currentUser = users.find(u => u.id === currentUserId) ?? users[0];
  const accessibleOrgs = getAccessibleOrgs(currentUserId, organizations, orgMembers);
  const isExternal = isEnterpriseOrg(activeOrgId) && isExternalMember(currentUserId, activeOrgId, orgMembers);
  const visibleSpaces = getVisibleSpaces(currentUserId, activeOrgId, spaces, spaceShares);

  // 顶栏可切换的运维区域 = 云组允许的数据中心 ∪ 已有项目所在区域
  const switchableOpsRegionIds = getSwitchableOpsRegionIds(
    currentUser.homeRegionId,
    REGIONS,
    visibleSpaces,
    accounts,
    users,
  );
  // 归一化：确保当前运维区域始终落在可切换集合内；优先账号归属地，否则第一个可访问区域
  useEffect(() => {
    if (switchableOpsRegionIds.length === 0) return;
    if (!switchableOpsRegionIds.includes(activeOpsRegionId)) {
      setActiveOpsRegionId(
        switchableOpsRegionIds.includes(currentUser.homeRegionId)
          ? currentUser.homeRegionId
          : switchableOpsRegionIds[0],
      );
    }
  }, [switchableOpsRegionIds, activeOpsRegionId, currentUser.homeRegionId]);

  // Site Manager 项目浏览：按当前运维区域过滤可见项目/Studio
  const regionVisibleSpaces = visibleSpaces.filter(
    item => getSpaceRegionId(item.space, accounts, users) === activeOpsRegionId,
  );

  const handleSwitchOpsRegion = (regionId: string) => {
    if (regionId === activeOpsRegionId) return;
    const target = REGIONS.find(r => r.id === regionId);
    setActiveOpsRegionId(regionId);
    setActiveSpaceId(null);
    setOpsRegionNote(`正在切换到 ${target?.name ?? regionId} 的 Studio Cloud 节点…`);
    window.setTimeout(() => setOpsRegionNote(null), 2200);
  };

  // 当前账号可创建项目的数据中心（由注册国家/地区云组决定）
  const eligibleDcRegionIds = getEligibleDataCenterRegionIds(currentUser.homeRegionId, REGIONS);
  const eligibleProjectCountries = getEligibleProjectCountries(currentUser.homeRegionId, REGIONS);

  const resolveDefaultProjectCountryId = () => {
    const defaultRegionId = eligibleDcRegionIds.includes(activeOpsRegionId)
      ? activeOpsRegionId
      : eligibleDcRegionIds.includes(currentUser.homeRegionId)
        ? currentUser.homeRegionId
        : eligibleDcRegionIds[0] ?? 'cn';
    const defaultCountry =
      eligibleProjectCountries.find(c => c.regionId === defaultRegionId) ??
      eligibleProjectCountries[0];
    return defaultCountry?.id ?? 'cn';
  };

  const openNewSpaceModal = () => {
    setNewSpaceCountryId(resolveDefaultProjectCountryId());
    setIsNewSpaceModalOpen(true);
  };

  const selectedProjectCountryId = eligibleProjectCountries.some(c => c.id === newSpaceCountryId)
    ? newSpaceCountryId
    : resolveDefaultProjectCountryId();

  const selectedProjectCountry = eligibleProjectCountries.find(c => c.id === selectedProjectCountryId);
  const selectedProjectDc = selectedProjectCountry
    ? REGIONS.find(r => r.id === selectedProjectCountry.regionId)
    : undefined;

  const spacePermissions = activeSpaceId
    ? getSpacePermissions(currentUserId, activeOrgId, activeSpaceId, spaces, spaceShares)
    : null;

  // 当前项目成员（用于「界面配置」分配 / 头像栈）
  const projectMemberOptions = activeSpaceId
    ? getSpaceCollaborators(activeSpaceId, spaces, spaceShares, accounts, users, orgMembers).map(c => ({
        accountId: c.account.accountId,
        name: c.user.displayName,
        email: c.user.email,
      }))
    : [];

  const handleAssignAssetMembers = (assetId: string, accountIds: string[]) => {
    setProjectAssets(prev => prev.map(a => (a.id === assetId ? { ...a, assignedMemberAccountIds: accountIds } : a)));
  };

  // 立即备份：在 Studio Cloud 侧将 Studio 的本地配置与运行数据打包，写入项目云存储
  // studioId 为空 = 为项目下每台 Studio 各生成一份独立备份；指定则仅备份单台
  const handleCreateBackup = (spaceId: string, studioId?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const targets = studioId
      ? [studioId]
      : sites.filter(s => s.spaceId === spaceId).map(s => s.id);
    if (targets.length === 0) return;

    const newAssets: ProjectAsset[] = targets.map((sid, idx) => ({
      id: `asset-backup-${Date.now()}-${idx}`,
      spaceId,
      name: `Backup-${Math.random().toString(16).slice(2, 8)}.zip`,
      kind: 'data-backup',
      sizeMb: Math.max(18, 32 + Math.round(Math.random() * 24)),
      source: 'studio-cloud',
      backupType: 'manual',
      studioId: sid,
      createdAt: stamp,
    }));
    setProjectAssets(prev => [...prev, ...newAssets]);
  };

  const handleDeleteAsset = (assetId: string) => {
    setProjectAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const getStudioCount = (spaceId: string) => sites.filter(s => s.spaceId === spaceId).length;

  // 当前用户已加入的组织（用于个人设置）
  const joinedOrgs = organizations
    .filter(o => o.type === 'enterprise')
    .map(org => {
      const member = orgMembers.find(m => m.orgId === org.id && m.userId === currentUserId);
      return member ? { org, member, isOwner: org.ownerUserId === currentUserId || member.orgRole === 'owner' } : null;
    })
    .filter((x): x is { org: Organization; member: OrgMember; isOwner: boolean } => x !== null);

  // 用户可进入管理后台的组织（internal 成员）
  const adminOrgs = joinedOrgs
    .filter(jo => jo.member.memberTag === 'internal')
    .map(jo => jo.org);

  const openEnterOrgModal = () => {
    setIsProfileDropdownOpen(false);
    setIsEnterOrgModalOpen(true);
  };

  const handleEnterOrgAdmin = (orgId: string) => {
    setIsEnterOrgModalOpen(false);
    openOrgAdmin(orgId);
  };

  /** 区域切换仅与 Studio Cloud / 站点运维相关，创作设计、设置页等场景不需要 */
  const showRegionSwitcher =
    activePlatform === 'site-manager' &&
    appView === 'projects';

  const getOwnerLabel = (item: import('./utils/accountContext').VisibleSpaceItem) => {
    const ownerAcc = accounts.find(a => a.accountId === item.space.ownerAccountId);
    const owner = ownerAcc ? users.find(u => u.id === ownerAcc.userId) : undefined;
    return owner?.displayName;
  };

  const handleAddInternalMember = (email: string, name: string, departmentId?: string | null) => {
    const result = addInternalOrgMember({
      email, name, orgId: activeOrgId, departmentId, users, accounts, orgMembers, spaces, spaceShares,
    });
    setUsers(result.users);
    setAccounts(result.accounts);
    setOrgMembers(result.orgMembers);
    setSpaceShares(result.spaceShares);
  };

  const handleRemoveOrgMember = (memberId: string) => {
    const result = removeOrgMember({ memberId, orgMembers, spaceShares, accounts });
    setOrgMembers(result.orgMembers);
    setSpaceShares(result.spaceShares);
    setAccounts(result.accounts);
  };

  // 统一的项目成员邀请：org_space → 外部成员；personal_space → 个人协作
  const handleInviteMember = (email: string, name: string, role: 'Admin' | 'Operator', roleLabel?: string) => {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;
    if (space.spaceType === 'org_space' && space.storageOrgId) {
      const result = inviteOrgSpaceExternal({
        email, name, space, orgId: space.storageOrgId, users, accounts, orgMembers, spaceShares, role, roleLabel,
      });
      setUsers(result.users);
      setAccounts(result.accounts);
      setOrgMembers(result.orgMembers);
      setSpaceShares(result.spaceShares);
    } else {
      const result = invitePersonalSpace({ email, name, space, role, roleLabel, users, spaceShares });
      setUsers(result.users);
      setSpaceShares(result.spaceShares);
    }
  };

  const handleRemoveShare = (shareId: string) => {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;
    const result = removeSpaceShare({ shareId, spaceShares, orgMembers, accounts, space });
    setSpaceShares(result.spaceShares);
    setOrgMembers(result.orgMembers);
    setAccounts(result.accounts);
  };

  // org_space：从组织成员中直接选人加入项目
  const handleAddOrgMembersToProject = (accountIds: string[], role: 'Admin' | 'Operator', roleLabel?: string) => {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (!space) return;
    const result = addOrgMembersToProject({ space, accountIds, role, roleLabel, spaceShares });
    setSpaceShares(result.spaceShares);
  };

  // personal_space：模拟受邀人接受邀请（Pending → Active/已加入）
  const handleAcceptShare = (shareId: string) => {
    const share = spaceShares.find(sh => sh.id === shareId);
    if (!share || share.status !== 'Pending') return;
    setSpaceShares(prev =>
      prev.map(sh => (sh.id === shareId ? { ...sh, status: 'Active' as const } : sh)),
    );
    setAccounts(prev => ensurePersonalAccountForShare(share, users, prev));
  };

  // 项目自定义角色
  const handleAddCustomRole = (name: string, mapsTo: 'Admin' | 'Operator') => {
    if (!activeSpaceId) return;
    setSpaceCustomRoles([...spaceCustomRoles, { id: `role-${Date.now()}`, spaceId: activeSpaceId, name, mapsTo }]);
  };
  const handleRemoveCustomRole = (id: string) => {
    setSpaceCustomRoles(spaceCustomRoles.filter(r => r.id !== id));
  };

  // 将项目方案绑定到某台 Studio(站点)
  const handleApplyPlanToSite = (projectPlanId: string, siteId: string) => {
    setProjectPlans(projectPlans.map(pp =>
      pp.id === projectPlanId && !pp.appliedSiteIds.includes(siteId)
        ? { ...pp, appliedSiteIds: [...pp.appliedSiteIds, siteId] }
        : pp,
    ));
  };

  const selectedSite = sites.find(s => s.id === activeSiteId);
  const currentOrg = organizations.find(o => o.id === activeOrgId);
  const currentSpace = spaces.find(s => s.id === activeSpaceId);

  const currentWorkspaceName = isPersonalOrg(activeOrgId)
    ? 'Personal Workspace'
    : (currentOrg?.name ?? '工作区');
  const workspaceOptions = accessibleOrgs;

  const workspaceSwitcherProps = {
    activeOrgId,
    workspaceOptions,
    currentWorkspaceName,
    userDisplayName: currentUser.displayName,
    adminOrgs,
    onOrgChange: handleOrgChange,
    onEnterOrgModal: openEnterOrgModal,
    onCreateOrg: () => alert('创建工作区流程（演示）'),
  };

  const siteManagerSidebar = activeSpaceId ? (
    <SiteManagerSidebar
      mode="project"
      currentSpace={currentSpace}
      activeSpaceId={activeSpaceId}
      projectOptions={regionVisibleSpaces}
      activeTab={activeTab}
      isExternal={isExternal}
      onTabChange={setActiveTab}
      onClearActiveSite={() => setActiveSiteId(null)}
      onSpaceChange={handleSpaceChange}
      onCreateProject={isExternal ? undefined : openNewSpaceModal}
    />
  ) : null;

  const activeWorkspaceOrg = workspaceOptions.find(o => o.id === activeOrgId);
  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-800 antialiased selection:bg-slate-900 selection:text-white font-sans">
      
      {/* ==================== 1. TOP NAVBAR (WITH ORG dropdown in profile avatar) ==================== */}
      <header className="h-[48px] bg-white border-b border-slate-100 px-5 flex items-center justify-between z-40 flex-shrink-0 select-none">
        <div className="flex items-center gap-0 min-w-0">
          {/* 品牌区：Lab 显示 Aqara Builder，Site Manager 显示 Site Manager */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${
              activePlatform === 'site-manager'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
            }`}>
              {activePlatform === 'site-manager' ? 'S' : 'A'}
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              {activePlatform === 'site-manager' ? (
                <>
                  <span className="text-[15px] font-black text-slate-900 tracking-tight">Site</span>
                  <span className="text-[15px] font-semibold text-slate-600 tracking-tight">Manager</span>
                </>
              ) : (
                <>
                  <span className="text-[15px] font-black text-slate-900 tracking-tight">Aqara</span>
                  <span className="text-[15px] font-semibold text-slate-600 tracking-tight">Builder</span>
                </>
              )}
            </div>
          </div>

          {activePlatform === 'site-manager' && currentSpace && (
            <div className="ml-4 pl-4 border-l border-slate-200 hidden sm:flex items-center min-w-0 text-[12px]">
              <span className="truncate max-w-[220px] font-medium text-slate-500">
                / {currentSpace.name}
              </span>
            </div>
          )}

          {activePlatform === 'lab-ai' && (
            <div className="ml-4 pl-4 border-l border-slate-200 hidden sm:flex items-center text-[12px]">
              <span className="font-semibold text-slate-400">Lab</span>
            </div>
          )}
        </div>

        {/* Right Nav Options & Organization Selector Avatar */}
        <div className="flex items-center gap-4">
          
          {/* Studio Cloud 运维区域控件（自适应）— 单区域只读徽标 / 多区域切换器；仅站点运维场景 */}
          {showRegionSwitcher && (
            <RegionOpsControl
              regions={REGIONS}
              accessibleRegionIds={switchableOpsRegionIds}
              activeOpsRegionId={activeOpsRegionId}
              homeRegionId={currentUser.homeRegionId}
              onSwitch={handleSwitchOpsRegion}
            />
          )}

          <button 
            onClick={() => alert("Simulating theme toggle: System forced to Light Theme for precise visual alignment.")}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            <div className="w-4 h-4 rounded-full border border-slate-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 bottom-0 left-1/2 bg-slate-400" />
            </div>
          </button>

          {/* User profile avatar with dropdown organization selector */}
          <div className="relative">
            <button
              id="profile-dropdown-btn"
              onClick={() => {
                if (isProfileDropdownOpen) closeProfileDropdown();
                else setIsProfileDropdownOpen(true);
              }}
              className="w-6 h-6 rounded-full bg-slate-900 border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer shadow-xs hover:ring-2 hover:ring-slate-200 transition-all"
            >
              <span className="text-[9px] font-black text-white uppercase">A</span>
            </button>

            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeProfileDropdown} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* 浅蓝头部 + 头像 */}
                  <div className="px-4 pt-5 pb-4 flex flex-col items-center bg-gradient-to-b from-sky-50 to-blue-50/40">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-lg font-black mb-2 shadow-sm">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-full">{currentUser.displayName}</p>
                  </div>

                  {/* 个人设置 / 退出登录 */}
                  <div className="px-2 py-2">
                    <button
                      onClick={openPersonalSettings}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <UserCircle size={15} className="text-slate-400" /> 个人设置
                    </button>
                    <button
                      onClick={() => { alert("Logging out of Site Manager SaaS..."); closeProfileDropdown(); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut size={15} className="text-slate-400" /> 退出登录
                    </button>
                  </div>

                  {/* 从 Lab 打开 Site Manager（新标签页） */}
                  {activePlatform === 'lab-ai' && (
                    <>
                      <div className="h-px bg-slate-100 mx-3" />
                      <div className="px-2 py-2">
                        <button
                          onClick={openSiteManagerInNewTab}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <LayoutGrid size={15} className="text-slate-400" /> Site Manager
                        </button>
                      </div>
                    </>
                  )}

                  {/* Site Manager：组织区块 */}
                  {activePlatform === 'site-manager' && (
                    <>
                      <div className="h-px bg-slate-100 mx-3" />
                      <div className="px-3 py-2.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1 mb-2">组织</p>
                        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 ${workspaceAvatarClass(activeOrgId)}`}>
                            {activeWorkspaceOrg
                              ? workspaceInitial(activeWorkspaceOrg, currentUser.displayName, currentWorkspaceName)
                              : currentUser.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{currentWorkspaceName}</p>
                          </div>
                          <button
                            onClick={openWorkspacePickerModal}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer shrink-0"
                          >
                            切换
                            <ChevronRight size={12} />
                          </button>
                        </div>
                        {adminOrgs.length > 0 && (
                          <button
                            onClick={openEnterOrgModal}
                            className="w-full mt-2 px-2.5 py-2 rounded-lg text-left text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Building2 size={14} className="text-slate-400 shrink-0" />
                            <span>管理后台</span>
                            <ChevronRight size={12} className="ml-auto text-slate-300" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ==================== 2. PLATFORM / VIEW ROUTER ==================== */}
      {activePlatform === 'lab-ai' ? (
        <DesignPlatformView
          plans={DESIGN_PLATFORM_PLANS}
          onApply={openApplyPlan}
          onApplyUi={openApplyUi}
          workspace={workspaceSwitcherProps}
        />
      ) : appView === 'workspace-home' ? (
        <WorkspaceHomeView
          workspaceOptions={accessibleOrgs}
          userDisplayName={currentUser.displayName}
          onSelectWorkspace={handleSelectWorkspaceFromHome}
          onCreateWorkspace={() => alert('创建工作区流程（演示）')}
        />
      ) : appView === 'personal-settings' ? (
        <PersonalSettingsView
          user={currentUser}
          joinedOrgs={joinedOrgs}
          activeOrgId={activeOrgId}
          regions={REGIONS}
          onBack={() => { setAppView('projects'); setActiveSpaceId(null); }}
          onExitOrg={handleExitOrg}
          onEnterAdmin={(orgId) => openOrgAdmin(orgId)}
          onChangeRegion={handleChangeRegion}
        />
      ) : activeSpaceId === null && appView === 'org-admin' && isEnterpriseOrg(activeOrgId) && !isExternal && currentOrg ? (
        <div className="flex-1 flex flex-col min-h-0">
          <OrgAdminView
            organization={currentOrg}
            departments={orgDepartments}
            onUpdateDepartments={setOrgDepartments}
            orgMembers={orgMembers}
            users={users}
            onAddInternalMember={handleAddInternalMember}
            onRemoveOrgMember={handleRemoveOrgMember}
            onChangeMemberRole={handleChangeMemberRole}
            onTransferOwner={handleTransferOwner}
            onDeleteOrg={handleDeleteOrg}
            spaces={spaces}
            onBack={() => setAppView('projects')}
          />
        </div>
      ) : activeSpaceId === null && isPersonalOrg(activeOrgId) ? (
        <div className="flex-1 flex flex-col min-h-0">
          <PersonalProjectIndex
            visibleSpaces={regionVisibleSpaces}
            searchQuery={searchSpaceQuery}
            onSearchChange={setSearchSpaceQuery}
            onSelectSpace={handleSpaceChange}
            onCreateProject={openNewSpaceModal}
            getStudioCount={getStudioCount}
            getOwnerLabel={getOwnerLabel}
            userDisplayName={currentUser.displayName}
          />
        </div>
      ) : activeSpaceId === null && currentOrg ? (
        <div className="flex-1 flex flex-col min-h-0">
          <OrgProjectIndex
            organization={currentOrg}
            visibleSpaces={regionVisibleSpaces}
            isExternal={isExternal}
            searchQuery={searchSpaceQuery}
            onSearchChange={setSearchSpaceQuery}
            onSelectSpace={handleSpaceChange}
            onCreateProject={openNewSpaceModal}
            getStudioCount={getStudioCount}
            userDisplayName={currentUser.displayName}
          />
        </div>
      ) : (
        
        /* ==================== 3. VIEW INSIDE THE ENTERED ACTIVE SPACE ==================== */
        <div className="flex-1 flex min-h-0 animate-in fade-in duration-200">
          {siteManagerSidebar}

          <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfb]">
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
              {spacePermissions && currentSpace && (
                <SharedSpaceBanner
                  permissions={spacePermissions}
                  spaceType={currentSpace.spaceType}
                  orgName={currentOrg?.name}
                />
              )}
              
              {activeSiteId && selectedSite ? (
                <SiteDetails
                  site={selectedSite}
                  onBack={() => setActiveSiteId(null)}
                  onUpdateDeviceStatus={handleUpdateDeviceStatus}
                  onAddDeviceToSite={handleAddDeviceToSite}
                  onRemoveDeviceFromSite={handleRemoveDeviceFromSite}
                  onUpdateSite={handleUpdateSite}
                />
              ) : (
                <>
                  {activeTab === 'sites' && (
                    <SpaceHubView
                      sites={sites}
                      activeSpaceId={activeSpaceId}
                      spaces={spaces}
                      structureNodes={structureNodes}
                      projectPlans={projectPlans.filter(pp => pp.spaceId === activeSpaceId)}
                      onSelectSite={setActiveSiteId}
                      onUpdateSites={setSites}
                      onUpdateNodes={setStructureNodes}
                    />
                  )}

                  {activeTab === 'storage' && activeSpaceId && currentSpace && (
                    <ProjectStoragePanel
                      space={currentSpace}
                      assets={projectAssets.filter(a => a.spaceId === activeSpaceId)}
                      plans={projectPlans.filter(p => p.spaceId === activeSpaceId)}
                      sites={sites.filter(s => s.spaceId === activeSpaceId)}
                      structureNodes={structureNodes}
                      members={projectMemberOptions}
                      canManage={spacePermissions?.canManageCollaborators ?? false}
                      onApplyToSite={handleApplyPlanToSite}
                      onAssignMembers={handleAssignAssetMembers}
                      onCreateBackup={handleCreateBackup}
                      onDeleteAsset={handleDeleteAsset}
                    />
                  )}

                  {activeTab === 'builder' && (
                    <BuilderLab 
                      activeSiteName={sites.find(s => s.spaceId === activeSpaceId)?.name || 'Default Site'}
                    />
                  )}

                  {activeTab === 'analytics' && (
                    <AnalyticsView
                      sites={sites.filter(s => s.spaceId === activeSpaceId)}
                      onSelectSite={(id) => {
                        setActiveSiteId(id);
                        setActiveTab('sites');
                      }}
                    />
                  )}

                  {activeTab === 'analytics-dashboard' && (
                    <ProjectAnalyticsView
                      sites={sites.filter(s => s.spaceId === activeSpaceId)}
                    />
                  )}

                  {activeTab === 'alerts' && (
                    <ProjectAlertsView
                      sites={sites.filter(s => s.spaceId === activeSpaceId)}
                    />
                  )}

                  {activeTab === 'updates' && (
                    <ProjectUpdatesView
                      sites={sites.filter(s => s.spaceId === activeSpaceId)}
                    />
                  )}

                  {activeTab === 'space-settings' && activeSpaceId && (
                    <SpaceSettingsView
                      activeSpaceId={activeSpaceId}
                      spaces={spaces}
                      onUpdateSpaces={setSpaces}
                      accounts={accounts}
                      users={users}
                      orgMembers={orgMembers}
                      spaceShares={spaceShares}
                      permissions={spacePermissions}
                      customRoles={spaceCustomRoles}
                      onAddCustomRole={handleAddCustomRole}
                      onRemoveCustomRole={handleRemoveCustomRole}
                      onInviteMember={handleInviteMember}
                      onAddOrgMembersToProject={handleAddOrgMembersToProject}
                      onAcceptShare={handleAcceptShare}
                      onRemoveShare={handleRemoveShare}
                      onDeleteSpace={(spaceId) => {
                        setSpaces(spaces.filter(s => s.id !== spaceId));
                        setSpaceShares(spaceShares.filter(sh => sh.spaceId !== spaceId));
                        setProjectPlans(projectPlans.filter(pp => pp.spaceId !== spaceId));
                        setProjectAssets(projectAssets.filter(a => a.spaceId !== spaceId));
                        setActiveSpaceId(null);
                      }}
                    />
                  )}
                </>
              )}

            </main>
          </div>

        </div>
      )}

      {isNewSpaceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="bg-[#1e293b] p-5 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-sm">新建项目</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {isPersonalOrg(activeOrgId) ? '创建在个人工作区' : `创建在 ${currentOrg?.name ?? '工作区'}`}
                </p>
              </div>
              <button onClick={() => setIsNewSpaceModalOpen(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">关闭</button>
            </div>
            <form onSubmit={handleCreateSpace} className="p-5 space-y-4 text-xs">
              <input required placeholder="项目名称" className="w-full px-3 py-2 border rounded-lg" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} />
              <textarea rows={3} placeholder="项目描述" className="w-full px-3 py-2 border rounded-lg" value={newSpaceDesc} onChange={e => setNewSpaceDesc(e.target.value)} />
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">国家/地区</label>
                <select
                  value={selectedProjectCountryId}
                  onChange={e => setNewSpaceCountryId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {eligibleProjectCountries.map(c => {
                    const dc = REGIONS.find(r => r.id === c.regionId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}{dc ? ` · ${dc.name}` : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  项目将部署在所选国家/地区对应的数据中心
                  {selectedProjectDc && (
                    <span className="text-slate-500">
                      {' '}（{selectedProjectDc.flag} {selectedProjectDc.name} · {selectedProjectDc.cloudEndpoint}）
                    </span>
                  )}
                  ；创建后不可更改。
                  {eligibleProjectCountries.length <= 1 && ' 当前账号注册国家/地区仅可使用本地区云节点。'}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewSpaceModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 bg-[#10b981] text-white rounded-lg font-bold">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== Lab AI → Site Manager 应用弹窗 ==================== */}
      {applyPlan && (() => {
        const targetIsPersonal = isPersonalOrg(applyTargetOrgId);
        const targetOwnerAccountId = resolveAccountId(currentUserId, applyTargetOrgId);
        const targetSpaces = spaces.filter(s =>
          targetIsPersonal
            ? (s.spaceType === 'personal_space' && s.ownerAccountId === targetOwnerAccountId)
            : s.storageOrgId === applyTargetOrgId
        );
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-100">
                  {applyPlan.kind === 'plugin' ? <Puzzle size={12} /> : <Send size={12} />}
                  应用到 Site Manager
                </div>
                <h3 className="font-extrabold text-base mt-1">{applyPlan.title}</h3>
                <p className="text-[11px] text-blue-100 mt-0.5">{applyPlan.devices} 设备 · 来自 Lab</p>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">选择目标工作区</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700"
                    value={applyTargetOrgId}
                    onChange={e => { setApplyTargetOrgId(e.target.value); setApplyTargetSpaceId('__new__'); }}
                  >
                    <option value="personal">个人工作区</option>
                    {accessibleOrgs.filter(o => o.type === 'enterprise').map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    资源将写入该工作区的项目配额（{targetIsPersonal ? '个人配额' : '组织配额'}）。
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">应用到项目 (Space)</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700"
                    value={applyTargetSpaceId}
                    onChange={e => setApplyTargetSpaceId(e.target.value)}
                  >
                    <option value="__new__">＋ 新建项目「{applyPlan.title}」</option>
                    {targetSpaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setApplyPlan(null)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">取消</button>
                  <button onClick={confirmApplyPlan} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5">
                    <Send size={13} /> 确认应用
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {applyUi && (() => {
        const targetIsPersonal = isPersonalOrg(applyTargetOrgId);
        const targetOwnerAccountId = resolveAccountId(currentUserId, applyTargetOrgId);
        const targetSpaces = spaces.filter(s =>
          targetIsPersonal
            ? (s.spaceType === 'personal_space' && s.ownerAccountId === targetOwnerAccountId)
            : s.storageOrgId === applyTargetOrgId
        );
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                  <Send size={12} />
                  应用到 Site Manager
                </div>
                <h3 className="font-extrabold text-base mt-1">{applyUi.title}</h3>
                <p className="text-[11px] text-indigo-100 mt-0.5">
                  {applyUi.kind === 'theme' ? '主题配置' : 'App 界面'} · 来自 Lab
                </p>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">选择目标工作区</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700"
                    value={applyTargetOrgId}
                    onChange={e => { setApplyTargetOrgId(e.target.value); setApplyTargetSpaceId('__new__'); }}
                  >
                    <option value="personal">个人工作区</option>
                    {accessibleOrgs.filter(o => o.type === 'enterprise').map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">应用到项目 (Space)</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700"
                    value={applyTargetSpaceId}
                    onChange={e => setApplyTargetSpaceId(e.target.value)}
                  >
                    <option value="__new__">＋ 新建项目「{applyUi.title}」</option>
                    {targetSpaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">将写入项目资源库的「界面配置」分类。</p>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setApplyUi(null)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">取消</button>
                  <button onClick={confirmApplyUi} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5">
                    <Send size={13} /> 确认应用
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {isWorkspacePickerModalOpen && (
        <WorkspacePickerModal
          workspaceOptions={workspaceOptions}
          activeOrgId={activeOrgId}
          userDisplayName={currentUser.displayName}
          onSelect={handleSelectWorkspaceFromModal}
          onCreateOrg={() => {
            setIsWorkspacePickerModalOpen(false);
            alert('创建工作区流程（演示）');
          }}
          onClose={() => setIsWorkspacePickerModalOpen(false)}
        />
      )}

      {/* ==================== 进入组织管理后台（云效式选择页） ==================== */}
      {isEnterOrgModalOpen && (
        <EnterOrgModal
          adminOrgs={adminOrgs}
          onSelect={handleEnterOrgAdmin}
          onCreateOrg={() => alert('创建工作区流程（演示）')}
          onClose={() => setIsEnterOrgModalOpen(false)}
        />
      )}

      {/* 运维区域切换反馈提示 */}
      {opsRegionNote && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          {opsRegionNote}
        </div>
      )}

      {/* ==================== 右下角悬浮：演示身份切换 ==================== */}
      <AccountSwitcher
        users={users}
        currentUserId={currentUserId}
        onSwitch={(userId) => {
          setCurrentUserId(userId);
          setActiveOrgId('personal');
          setActiveSpaceId(null);
          setAppView('projects');
          setActivePlatform('site-manager');
        }}
      />

    </div>
  );
}
