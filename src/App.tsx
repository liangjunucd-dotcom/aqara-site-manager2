import React, { useState } from 'react';
import {
  INITIAL_SITES, INITIAL_ORGANIZATIONS, INITIAL_SPACES, INITIAL_SPACE_STRUCTURE_NODES,
  INITIAL_ORG_DEPARTMENTS, INITIAL_ORG_MEMBERS, DEMO_USERS, INITIAL_ACCOUNTS, INITIAL_SPACE_SHARES,
  REGIONS, DESIGN_PLATFORM_PLANS, INITIAL_PROJECT_PLANS, INITIAL_PROJECT_ASSETS,
} from './mockData';
import {
  Site, Device, Space, SpaceStructureNode, OrgDepartment, OrgMember, Organization, OrgRole,
  Account, SpaceShare, User, SpaceCustomRole, ProjectPlan, ProjectAsset, estimateDesignSizeMb,
  isEnterpriseOrg, isPersonalOrg, resolveAccountId, PERSONAL_ORG_ID,
} from './types';
import {
  getAccessibleOrgs, getVisibleSpaces, getSpacePermissions, isExternalMember,
} from './utils/accountContext';
import {
  inviteOrgSpaceExternal, invitePersonalSpace, removeOrgMember, removeSpaceShare, addInternalOrgMember,
} from './utils/spaceActions';
import SpaceHubView from './components/SpaceHubView';
import SiteDetails from './components/SiteDetails';
import BuilderLab from './components/BuilderLab';
import AnalyticsView from './components/AnalyticsView';
import SpaceSettingsView from './components/SpaceSettingsView';
import OrgAdminView from './components/OrgAdminView';
import PersonalProjectIndex from './components/PersonalProjectIndex';
import OrgProjectIndex from './components/OrgProjectIndex';
import SharedSpaceBanner from './components/SharedSpaceBanner';
import AccountSwitcher from './components/AccountSwitcher';
import RegionSwitcher from './components/RegionSwitcher';
import PersonalSettingsView from './components/PersonalSettingsView';
import DesignPlatformView, { DesignPlan } from './components/DesignPlatformView';
import EnterOrgModal from './components/EnterOrgModal';
import ProjectStoragePanel from './components/ProjectStoragePanel';
import { 
  Building2, Layers, LineChart, Settings, Sliders, Bell, 
  Search, ShieldCheck, Cpu, Database, Compass, Smartphone, 
  Video, HelpCircle, CheckCircle2, AlertTriangle, ExternalLink,
  ArrowRight, Folder, LayoutGrid, Home, Plus, ChevronDown, Check, FolderPlus, ArrowLeft,
  UserCircle, LogOut, ChevronRight, Send, Puzzle, Cloud
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sites' | 'storage' | 'builder' | 'analytics' | 'space-settings'>('sites');
  
  // Organization, Space, and Subdivision Node states
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [structureNodes, setStructureNodes] = useState<SpaceStructureNode[]>(INITIAL_SPACE_STRUCTURE_NODES);

  const [activeOrgId, setActiveOrgId] = useState<string>('personal');
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [appView, setAppView] = useState<'projects' | 'org-admin' | 'personal-settings'>('projects');
  const [currentUserId, setCurrentUserId] = useState('user-jun');

  // Which platform is currently active: Site Manager (运维) vs 设计平台 (Aqara Builder)
  const [activePlatform, setActivePlatform] = useState<'site-manager' | 'design'>('site-manager');
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  // Studio Cloud 全球区域
  const [activeRegionId, setActiveRegionId] = useState<string>('cn');

  // 设计平台方案应用到 Site Manager Space 的流程
  const [applyPlan, setApplyPlan] = useState<DesignPlan | null>(null);
  const [applyTargetOrgId, setApplyTargetOrgId] = useState<string>('personal');
  const [applyTargetSpaceId, setApplyTargetSpaceId] = useState<string>('__new__');

  // 项目自定义角色 & 项目关联的设计方案（方案库）
  const [spaceCustomRoles, setSpaceCustomRoles] = useState<SpaceCustomRole[]>([]);
  const [projectPlans, setProjectPlans] = useState<ProjectPlan[]>(INITIAL_PROJECT_PLANS);
  const [projectAssets, setProjectAssets] = useState<ProjectAsset[]>(INITIAL_PROJECT_ASSETS);

  // Header and Sidebar Dropdowns
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const [isEnterOrgModalOpen, setIsEnterOrgModalOpen] = useState(false);
  const [isSidebarSpaceDropdownOpen, setIsSidebarSpaceDropdownOpen] = useState(false);

  // New Space creation state inside Spaces Index Page
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');

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

  // Switch Organization
  const handleOrgChange = (orgId: string) => {
    setActiveOrgId(orgId);
    setActiveSpaceId(null);
    setAppView('projects');
    setActivePlatform('site-manager');
    setIsProfileDropdownOpen(false);
    setIsEnterOrgModalOpen(false);
    setIsWorkspaceSwitcherOpen(false);
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

  // 从设计平台请求应用方案到 Site Manager
  const openApplyPlan = (plan: DesignPlan) => {
    setApplyPlan(plan);
    setApplyTargetOrgId(isPersonalOrg(activeOrgId) ? 'personal' : activeOrgId);
    setApplyTargetSpaceId('__new__');
  };

  const confirmApplyPlan = () => {
    if (!applyPlan) return;
    const isPersonal = isPersonalOrg(applyTargetOrgId);
    let targetSpaceId = applyTargetSpaceId;
    if (applyTargetSpaceId === '__new__') {
      const newId = `space-${Date.now()}`;
      const newSpaceObj: Space = {
        id: newId,
        name: applyPlan.title,
        ownerAccountId: resolveAccountId(currentUserId, applyTargetOrgId),
        storageOrgId: isPersonal ? null : applyTargetOrgId,
        spaceType: isPersonal ? 'personal_space' : 'org_space',
        description: `由设计平台方案「${applyPlan.title}」创建`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSpaces(prev => [...prev, newSpaceObj]);
      targetSpaceId = newId;
    }
    // 将方案关联到目标项目的云存储（若尚未关联）
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
    // 切回 Site Manager 并进入目标项目
    setApplyPlan(null);
    setActivePlatform('site-manager');
    setActiveOrgId(applyTargetOrgId);
    setActiveSpaceId(targetSpaceId);
    setAppView('projects');
    setActiveTab('sites');
    setActiveSiteId(null);
  };

  // Switch Space
  const handleSpaceChange = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setActiveTab('sites');
    setActiveSiteId(null);
    setIsSidebarSpaceDropdownOpen(false);
  };

  // Create a New Space
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
  const spacePermissions = activeSpaceId
    ? getSpacePermissions(currentUserId, activeOrgId, activeSpaceId, spaces, spaceShares)
    : null;

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

  const activeProductLabel = activePlatform === 'site-manager' ? 'Site Manager' : 'Space Plan';
  const currentWorkspaceName = isPersonalOrg(activeOrgId)
    ? 'Personal Workspace'
    : (currentOrg?.name ?? '工作区');
  const workspaceOptions = accessibleOrgs;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-800 antialiased selection:bg-slate-900 selection:text-white font-sans">
      
      {/* ==================== 1. TOP NAVBAR (WITH ORG dropdown in profile avatar) ==================== */}
      <header className="h-[48px] bg-white border-b border-slate-100 px-5 flex items-center justify-between z-40 flex-shrink-0 select-none">
        <div className="flex items-center gap-0 min-w-0">
          {/* 品牌区：固定展示 Aqara Builder（参考云效顶栏） */}
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              A
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              <span className="text-[15px] font-black text-slate-900 tracking-tight">Aqara</span>
              <span className="text-[15px] font-semibold text-slate-600 tracking-tight">Builder</span>
            </div>
          </div>

          {/* 产品切换器：仅当前产品名 + ▼，无独立 Logo */}
          <div className="relative pl-4">
            <button
              onClick={() => setIsAppSwitcherOpen(!isAppSwitcherOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
              title="切换产品"
            >
              <LayoutGrid size={14} className="text-slate-500 shrink-0" />
              <span className="text-[13px] font-semibold text-slate-800">{activeProductLabel}</span>
              <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isAppSwitcherOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAppSwitcherOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAppSwitcherOpen(false)} />
                <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => { setActivePlatform('site-manager'); setActiveSpaceId(null); setAppView('projects'); setIsAppSwitcherOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between cursor-pointer ${activePlatform === 'site-manager' ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span>Site Manager</span>
                    {activePlatform === 'site-manager' && <Check size={14} className="text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => { setActivePlatform('design'); setIsAppSwitcherOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between cursor-pointer ${activePlatform === 'design' ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span>Space Plan</span>
                    {activePlatform === 'design' && <Check size={14} className="text-emerald-500" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {activePlatform === 'site-manager' && currentSpace && (
            <span className="hidden md:flex items-center gap-1.5 ml-3 text-[12px] text-slate-400 min-w-0">
              <span className="text-slate-300">/</span>
              <span className="truncate max-w-[180px] font-medium">{currentSpace.name}</span>
            </span>
          )}
        </div>

        {/* Right Nav Options & Organization Selector Avatar */}
        <div className="flex items-center gap-4">
          
          {/* Studio Cloud 区域切换器 — 仅站点/Studio 运维场景 */}
          {showRegionSwitcher && (
            <RegionSwitcher
              regions={REGIONS}
              activeRegionId={activeRegionId}
              onSwitch={setActiveRegionId}
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
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-6 h-6 rounded-full bg-slate-900 border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer shadow-xs hover:ring-2 hover:ring-slate-200 transition-all"
            >
              <span className="text-[9px] font-black text-white uppercase">A</span>
            </button>

            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setIsProfileDropdownOpen(false); setIsWorkspaceSwitcherOpen(false); }} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* 用户信息头部 */}
                  <div className="px-4 pt-2 pb-3 flex flex-col items-center border-b border-slate-50">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-black mb-2">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-full">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-full">{currentUser.email}</p>
                  </div>

                  {/* 个人设置 / 退出登录 */}
                  <div className="px-2 py-2 border-b border-slate-50">
                    <button
                      onClick={openPersonalSettings}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <UserCircle size={15} className="text-slate-400" /> 个人设置
                    </button>
                    <button
                      onClick={() => { alert("Logging out of Site Manager SaaS..."); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut size={15} className="text-slate-400" /> 退出登录
                    </button>
                  </div>

                  {/* 工作区：仅展示当前工作区，点击切换展开列表 */}
                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-[10px] font-bold text-slate-400">工作区</p>
                    <div className="px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-black shrink-0 ${
                        isPersonalOrg(activeOrgId)
                          ? 'bg-gradient-to-br from-slate-500 to-slate-700'
                          : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                      }`}>
                        {isPersonalOrg(activeOrgId) ? currentUser.displayName.charAt(0).toUpperCase() : currentWorkspaceName.charAt(0)}
                      </div>
                      <span className="flex-1 text-xs font-bold text-slate-800 truncate">{currentWorkspaceName}</span>
                      <button
                        onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-0.5 cursor-pointer shrink-0"
                      >
                        切换 <ChevronRight size={12} className={`transition-transform ${isWorkspaceSwitcherOpen ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {isWorkspaceSwitcherOpen && (
                      <div className="mt-1 mx-0.5 border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm">
                        {workspaceOptions.map(org => (
                          <button
                            key={org.id}
                            onClick={() => handleOrgChange(org.id)}
                            className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between cursor-pointer border-b border-slate-50 last:border-0 ${
                              activeOrgId === org.id ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate">
                              {isPersonalOrg(org.id) ? 'Personal Workspace' : org.name}
                            </span>
                            {activeOrgId === org.id && <Check size={12} className="text-emerald-500 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {adminOrgs.length > 0 && (
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); openEnterOrgModal(); }}
                        className="mt-1.5 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Building2 size={14} className="text-slate-400" /> 组织管理后台
                        <ChevronRight size={12} className="ml-auto" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ==================== 2. PLATFORM / VIEW ROUTER ==================== */}
      {activePlatform === 'design' ? (
        <DesignPlatformView plans={DESIGN_PLATFORM_PLANS} onApply={openApplyPlan} />
      ) : appView === 'personal-settings' ? (
        <PersonalSettingsView
          user={currentUser}
          joinedOrgs={joinedOrgs}
          activeOrgId={activeOrgId}
          onBack={() => { setAppView('projects'); setActiveOrgId('personal'); }}
          onExitOrg={handleExitOrg}
          onEnterAdmin={(orgId) => openOrgAdmin(orgId)}
        />
      ) : activeSpaceId === null && appView === 'org-admin' && isEnterpriseOrg(activeOrgId) && !isExternal && currentOrg ? (
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
      ) : activeSpaceId === null && isPersonalOrg(activeOrgId) ? (
        <PersonalProjectIndex
          visibleSpaces={visibleSpaces}
          searchQuery={searchSpaceQuery}
          onSearchChange={setSearchSpaceQuery}
          onSelectSpace={handleSpaceChange}
          onCreateProject={() => setIsNewSpaceModalOpen(true)}
          getStudioCount={getStudioCount}
          getOwnerLabel={getOwnerLabel}
          userDisplayName={currentUser.displayName}
        />
      ) : activeSpaceId === null && currentOrg ? (
        <OrgProjectIndex
          organization={currentOrg}
          visibleSpaces={visibleSpaces}
          isExternal={isExternal}
          searchQuery={searchSpaceQuery}
          onSearchChange={setSearchSpaceQuery}
          onSelectSpace={handleSpaceChange}
          onCreateProject={() => setIsNewSpaceModalOpen(true)}
          getStudioCount={getStudioCount}
          userDisplayName={currentUser.displayName}
        />
      ) : (
        
        /* ==================== 3. VIEW INSIDE THE ENTERED ACTIVE SPACE ==================== */
        <div className="flex-1 flex min-h-0 animate-in fade-in duration-200">
          
          {/* Left Sidebar navigation panel with Space Selector on Top */}
          <aside className="w-[48px] bg-white border-r border-slate-100 flex flex-col items-center py-3 justify-between flex-shrink-0 z-30 select-none">
            
            <div className="flex flex-col items-center gap-2.5 w-full">
              
              {/* Space project switcher at the very top of Sidebar */}
              <div className="relative mb-4 pb-3 border-b border-slate-100 flex flex-col items-center">
                <button
                  id="sidebar-space-switcher-btn"
                  onClick={() => setIsSidebarSpaceDropdownOpen(!isSidebarSpaceDropdownOpen)}
                  className="w-9 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95"
                  title={`Active Project: ${currentSpace?.name || 'Switch Project'}`}
                >
                  {currentSpace?.name ? currentSpace.name.charAt(0).toUpperCase() : 'S'}
                </button>

                {isSidebarSpaceDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSidebarSpaceDropdownOpen(false)} />
                    <div className="absolute left-12 top-0 mt-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-left-1 duration-150">
                      <div className="px-3.5 py-1.5 border-b border-slate-100 mb-2 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                          Switch Project
                        </span>
                        {!isExternal && (
                        <button
                          onClick={() => {
                            setIsNewSpaceModalOpen(true);
                            setIsSidebarSpaceDropdownOpen(false);
                          }}
                          className="text-[#10b981] text-[9.5px] font-bold hover:underline"
                        >
                          + New Project
                        </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto px-1 space-y-0.5">
                        {visibleSpaces.map(item => (
                          <button
                            key={item.space.id}
                            onClick={() => handleSpaceChange(item.space.id)}
                            className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold flex flex-col gap-0.5 transition-colors cursor-pointer ${
                              activeSpaceId === item.space.id
                                ? 'bg-slate-50 text-slate-900 border border-slate-200/50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{item.space.name}</span>
                              {activeSpaceId === item.space.id && <Check size={11} className="text-[#10b981]" />}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="h-[1px] bg-slate-100 my-2" />
                      <div className="px-1.5">
                        <button
                          onClick={() => {
                            setActiveSpaceId(null);
                            setAppView('projects');
                            setIsSidebarSpaceDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Home size={12} className="text-slate-400" />
                          <span>返回项目大厅 (Back to Index)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sites / Studios Hub tab */}
              <button
                id="tab-sites"
                onClick={() => {
                  setActiveTab('sites');
                  setActiveSiteId(null);
                }}
                className={`p-2 rounded-lg transition-all flex items-center justify-center relative group cursor-pointer ${
                  activeTab === 'sites' && !activeSiteId
                    ? 'bg-slate-100 text-slate-950' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Studios Hub"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Studios Hub
                </span>
              </button>

              {/* Project Cloud Storage */}
              <button
                id="tab-storage"
                onClick={() => {
                  setActiveTab('storage');
                  setActiveSiteId(null);
                }}
                className={`p-2 rounded-lg transition-all flex items-center justify-center relative group cursor-pointer ${
                  activeTab === 'storage'
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Project Cloud Storage"
              >
                <Cloud size={20} />
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  云存储
                </span>
              </button>

              {/* Topology / Builder Lab — hidden for external */}
              {!isExternal && (
              <button
                id="tab-builder"
                onClick={() => {
                  setActiveTab('builder');
                  setActiveSiteId(null);
                }}
                className={`p-2 rounded-lg transition-all flex items-center justify-center relative group cursor-pointer ${
                  activeTab === 'builder'
                    ? 'bg-slate-100 text-slate-950' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Topology design"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Topology Design
                </span>
              </button>
              )}

              {!isExternal && (
              <button
                id="tab-analytics"
                onClick={() => {
                  setActiveTab('analytics');
                  setActiveSiteId(null);
                }}
                className={`p-2 rounded-lg transition-all flex items-center justify-center relative group cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-slate-100 text-slate-950' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Cloud Console Monitoring"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Studio Cloud Logs
                </span>
              </button>
              )}

              {!isExternal && (
              <button
                onClick={() => { setActiveSpaceId(null); setAppView('projects'); }}
                className="p-2 rounded-lg text-slate-400 hover:text-[#10b981] hover:bg-emerald-50 transition-all flex items-center justify-center relative group cursor-pointer"
                title="Back to All Projects"
              >
                <LayoutGrid size={20} />
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  All Projects
                </span>
              </button>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              {!isExternal && (
              <button
                id="tab-space-settings"
                onClick={() => {
                  setActiveTab('space-settings');
                  setActiveSiteId(null);
                }}
                className={`p-2 rounded-lg transition-all flex items-center justify-center relative group cursor-pointer ${
                  activeTab === 'space-settings'
                    ? 'bg-slate-100 text-slate-950' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Project Admin Config"
              >
                <Settings size={20} />
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Project Settings
                </span>
              </button>
              )}
            </div>
          </aside>

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
                      onApplyToSite={handleApplyPlanToSite}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#1e293b] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">新建项目</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {isPersonalOrg(activeOrgId) ? '创建在个人工作区' : `创建在 ${currentOrg?.name ?? '组织'}`}
                </p>
              </div>
              <button onClick={() => setIsNewSpaceModalOpen(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">关闭</button>
            </div>
            <form onSubmit={handleCreateSpace} className="p-5 space-y-4 text-xs">
              <input required placeholder="项目名称" className="w-full px-3 py-2 border rounded-lg" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} />
              <textarea rows={3} placeholder="项目描述" className="w-full px-3 py-2 border rounded-lg" value={newSpaceDesc} onChange={e => setNewSpaceDesc(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewSpaceModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 bg-[#10b981] text-white rounded-lg font-bold">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 设计平台方案 → Site Manager 应用弹窗 ==================== */}
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
                <p className="text-[11px] text-blue-100 mt-0.5">{applyPlan.devices} 设备 · 来自 Aqara Builder 设计平台</p>
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
                    方案将写入该工作区的存储配额（{targetIsPersonal ? '个人配额' : '组织配额'}）。
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

      {/* ==================== 进入组织管理后台（云效式选择页） ==================== */}
      {isEnterOrgModalOpen && (
        <EnterOrgModal
          adminOrgs={adminOrgs}
          onSelect={handleEnterOrgAdmin}
          onCreateOrg={() => alert('创建组织流程（演示）')}
          onClose={() => setIsEnterOrgModalOpen(false)}
        />
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
