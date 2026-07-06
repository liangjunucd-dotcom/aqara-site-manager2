import React, { useState } from 'react';
import { INITIAL_SITES, INITIAL_ORGANIZATIONS, INITIAL_SPACES, INITIAL_SPACE_STRUCTURE_NODES } from './mockData';
import { Site, Device, Space, SpaceStructureNode } from './types';
import SpaceHubView from './components/SpaceHubView';
import SiteDetails from './components/SiteDetails';
import BuilderLab from './components/BuilderLab';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import SpaceSettingsView from './components/SpaceSettingsView';
import { 
  Building2, Layers, LineChart, Settings, Sliders, Bell, 
  Search, ShieldCheck, Cpu, Database, Compass, Smartphone, 
  Video, HelpCircle, CheckCircle2, AlertTriangle, User, ExternalLink, Globe,
  ArrowRight, Folder, LayoutGrid, Home, Plus, ChevronDown, Check, FolderPlus, ArrowLeft
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sites' | 'builder' | 'analytics' | 'space-settings'>('sites');
  
  // Organization, Space, and Subdivision Node states
  const [organizations] = useState(INITIAL_ORGANIZATIONS);
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [structureNodes, setStructureNodes] = useState<SpaceStructureNode[]>(INITIAL_SPACE_STRUCTURE_NODES);

  const [activeOrgId, setActiveOrgId] = useState<string>('enterprise-a'); // Default to Enterprise A
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null); // Start at index selector!
  
  // Header and Sidebar Dropdowns
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarSpaceDropdownOpen, setIsSidebarSpaceDropdownOpen] = useState(false);

  // New Space creation state inside Spaces Index Page
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');

  // Search inside Spaces Index Page
  const [searchSpaceQuery, setSearchSpaceQuery] = useState('');

  // Persisted Space-level Admin States
  const [members, setMembers] = useState([
    { id: 'm1', name: 'Liangjun Ucd', email: 'liangjunucd@gmail.com', role: 'Super Admin', status: 'Active', dateAdded: '2026-01-15' },
    { id: 'm2', name: 'System Admin', email: 'system-admin@aqara.com', role: 'System Engineer', status: 'Active', dateAdded: '2026-01-20' },
    { id: 'm3', name: 'Hotel Staff A', email: 'staff.a@xingyuehotel.com', role: 'Operator', status: 'Active', dateAdded: '2026-02-10' },
    { id: 'm4', name: 'Remote Engineer', email: 'remote.eng@aqara.com', role: 'Viewer', status: 'Pending', dateAdded: '2026-07-01' }
  ]);

  const [roles, setRoles] = useState([
    { id: 'r1', name: 'Super Admin', desc: 'Full root access to all Studios, space configurations, and audit logs.', permissions: ['read', 'write', 'provision', 'admin'] },
    { id: 'r2', name: 'System Engineer', desc: 'Manage devices, update blueprints, and run diagnostics.', permissions: ['read', 'write', 'provision'] },
    { id: 'r3', name: 'Operator', desc: 'Trigger room automations and toggle active states.', permissions: ['read', 'write'] },
    { id: 'r4', name: 'Viewer', desc: 'Read-only telemetry and health overview.', permissions: ['read'] }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'log1', time: '2026-07-05 02:15:30', user: 'liangjunucd@gmail.com', action: 'Space Structure Modified', detail: 'Added division node "Executive Suite B"' },
    { id: 'log2', time: '2026-07-05 01:42:10', user: 'system-admin@aqara.com', action: 'Device Synchronized', detail: 'Linked Matter Hub Aqara M3' },
    { id: 'log3', time: '2026-07-04 18:20:00', user: 'liangjunucd@gmail.com', action: 'Blueprint Assigned', detail: 'Allocated blueprint v1.0 to Front Entrance' },
    { id: 'log4', time: '2026-07-04 11:35:15', user: 'staff.a@xingyuehotel.com', action: 'Space Switched', detail: 'Checked-in room controller status' },
    { id: 'log5', time: '2026-07-03 09:12:44', user: 'liangjunucd@gmail.com', action: 'Member Invited', detail: 'Invited remote.eng@aqara.com to space' }
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
    setActiveSpaceId(null); // Return to index page of spaces for this organization!
    setIsProfileDropdownOpen(false);
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
    const newId = newSpaceName.toLowerCase().replace(/\s+/g, '-');
    const newSpaceObj: Space = {
      id: newId,
      name: newSpaceName,
      orgId: activeOrgId,
      description: newSpaceDesc || 'Custom Business Space Node',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSpaces([...spaces, newSpaceObj]);
    setNewSpaceName('');
    setNewSpaceDesc('');
    setIsNewSpaceModalOpen(false);
    
    // Automatically enter the newly created Space
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

  const selectedSite = sites.find(s => s.id === activeSiteId);
  const currentOrg = organizations.find(o => o.id === activeOrgId);
  const currentSpace = spaces.find(s => s.id === activeSpaceId);

  // Filtered spaces for currently selected Organization
  const orgSpaces = spaces.filter(space => space.orgId === activeOrgId);
  const filteredSpaces = orgSpaces.filter(space => 
    space.name.toLowerCase().includes(searchSpaceQuery.toLowerCase()) ||
    (space.description && space.description.toLowerCase().includes(searchSpaceQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-800 antialiased selection:bg-slate-900 selection:text-white font-sans">
      
      {/* ==================== 1. TOP NAVBAR (WITH ORG dropdown in profile avatar) ==================== */}
      <header className="h-[48px] bg-white border-b border-slate-100 px-5 flex items-center justify-between z-40 flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* U Logo Badge */}
          <div className="w-6 h-6 rounded-md bg-[#2b3542] flex items-center justify-center text-white font-black text-[11px] tracking-tighter">
            U
          </div>
          <span 
            className="text-[13px] font-bold text-slate-600 tracking-tight cursor-pointer hover:text-slate-800 transition-colors flex items-center gap-1.5"
            onClick={() => setActiveSpaceId(null)}
          >
            <span>Site Manager</span>
            {currentSpace && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400 font-medium text-xs truncate max-w-[150px]">
                  {currentSpace.name}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Right Nav Options & Organization Selector Avatar */}
        <div className="flex items-center gap-4">
          
          {/* Active organization status indicator badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs">
            <Globe size={12} className="text-slate-400" />
            <span className="text-slate-400 font-medium">Org:</span>
            <span className="text-slate-700 font-extrabold">{currentOrg?.name}</span>
          </div>

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
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 py-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-1.5 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">liangjunucd@gmail.com</p>
                  </div>

                  <div className="px-4 py-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Switch Organization / 切换组织
                    </p>
                    <div className="space-y-1">
                      {organizations.map(org => (
                        <button
                          key={org.id}
                          onClick={() => handleOrgChange(org.id)}
                          className={`w-full px-3 py-2 rounded-lg text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            activeOrgId === org.id 
                              ? 'bg-slate-50 text-slate-900 border border-slate-200/60' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                          }`}
                        >
                          <span className="truncate">{org.name}</span>
                          {activeOrgId === org.id && <Check size={12} className="text-[#3b82f6] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-50 my-2" />
                  <div className="px-2">
                    <button 
                      onClick={() => { alert("Configuring User Account..."); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                    >
                      Account Settings
                    </button>
                    <button 
                      onClick={() => { alert("Logging out of Site Manager SaaS..."); setIsProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ==================== 2. SPACES INDEX SELECTOR PAGE (When activeSpaceId === null) ==================== */}
      {activeSpaceId === null ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-200 select-none">
          
          {/* Welcome and Header Title with organization scope */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-[#3b82f6]" />
                <span className="text-[10px] uppercase font-black tracking-wider text-[#3b82f6]">{currentOrg?.name}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1 font-sans">
                Aqara Studio SaaS Manager
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Welcome back, liangjunucd. Select a physical or logical business space context below to manage active Thread mesh clusters.
              </p>
            </div>

            <button
              onClick={() => setIsNewSpaceModalOpen(true)}
              className="px-5 py-2.5 bg-[#76ff5c] hover:bg-[#62f248] active:scale-98 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>New Space</span>
            </button>
          </div>

          {/* Search bar inside Space selection page */}
          <div className="max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search for space / workspace..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 text-slate-800 text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors shadow-2xs"
              value={searchSpaceQuery}
              onChange={(e) => setSearchSpaceQuery(e.target.value)}
            />
          </div>

          {/* Spaces Grid mapping */}
          {filteredSpaces.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[20px] p-12 text-center shadow-xs">
              <Folder size={32} className="text-slate-300 mx-auto mb-4" />
              <h3 className="font-extrabold text-slate-800 text-sm">No spaces found</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 mb-6">
                No active smart spaces matched your search filters in this organization. Create a new one to begin.
              </p>
              <button
                onClick={() => setIsNewSpaceModalOpen(true)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                + Create Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpaces.map(space => {
                const spaceSites = sites.filter(s => s.spaceId === space.id);
                
                return (
                  <div
                    key={space.id}
                    onClick={() => handleSpaceChange(space.id)}
                    className="group bg-white border border-slate-200 hover:border-slate-300 rounded-[20px] p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-slate-100 transition-colors">
                          <Folder size={18} className="text-[#10b981]" />
                        </div>
                        
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100/60 border border-slate-200/50 px-2 py-0.5 rounded-full">
                          {spaceSites.length} {spaceSites.length === 1 ? 'Studio' : 'Studios'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-slate-950 truncate transition-colors">
                          {space.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed line-clamp-2">
                          {space.description || 'Active smart business gateway container.'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Created: {space.createdAt || '2026-07-05'}
                      </span>
                      
                      {/* Grey square right arrow button from screenshot */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all text-slate-800 font-bold">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ==================== MODAL: PROVISION NEW SPACE ==================== */}
          {isNewSpaceModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="bg-[#1e293b] p-5 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm">新建业务空间 (Provision Space)</h3>
                    <p className="text-[10px] text-slate-300 mt-0.5">Create a physical or logical environment container</p>
                  </div>
                  <button
                    onClick={() => setIsNewSpaceModalOpen(false)}
                    className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleCreateSpace} className="p-5 space-y-4 text-xs text-slate-600">
                  <div>
                    <label htmlFor="modal-space-name" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Space Name * (e.g. 我的家, 星悦酒店项目, 民生总部大楼)
                    </label>
                    <input
                      type="text"
                      id="modal-space-name"
                      required
                      placeholder="Enter custom Space name..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold text-slate-800"
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-space-desc" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Space Description / Brief Context
                    </label>
                    <textarea
                      id="modal-space-desc"
                      rows={3}
                      placeholder="Describe what devices are housed or managed under this Space..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-medium text-slate-700"
                      value={newSpaceDesc}
                      onChange={(e) => setNewSpaceDesc(e.target.value)}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      id="cancel-space-create"
                      onClick={() => setIsNewSpaceModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="submit-space-create"
                      className="px-4.5 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-bold cursor-pointer transition-colors"
                    >
                      Provision Space
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
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
                  title={`Active Space: ${currentSpace?.name || 'Switch Space'}`}
                >
                  {currentSpace?.name ? currentSpace.name.charAt(0).toUpperCase() : 'S'}
                </button>

                {isSidebarSpaceDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSidebarSpaceDropdownOpen(false)} />
                    <div className="absolute left-12 top-0 mt-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-left-1 duration-150">
                      <div className="px-3.5 py-1.5 border-b border-slate-100 mb-2 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                          Switch Space项目
                        </span>
                        <button
                          onClick={() => {
                            setIsNewSpaceModalOpen(true);
                            setIsSidebarSpaceDropdownOpen(false);
                          }}
                          className="text-[#10b981] text-[9.5px] font-bold hover:underline"
                        >
                          + New
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto px-1 space-y-0.5">
                        {spaces
                          .filter(s => s.orgId === activeOrgId)
                          .map(space => (
                            <button
                              key={space.id}
                              onClick={() => handleSpaceChange(space.id)}
                              className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold flex flex-col gap-0.5 transition-colors cursor-pointer ${
                                activeSpaceId === space.id 
                                  ? 'bg-slate-50 text-slate-900 border border-slate-200/50' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{space.name}</span>
                                {activeSpaceId === space.id && <Check size={11} className="text-[#10b981]" />}
                              </div>
                            </button>
                          ))}
                      </div>

                      <div className="h-[1px] bg-slate-100 my-2" />
                      <div className="px-1.5">
                        <button
                          onClick={() => {
                            setActiveSpaceId(null);
                            setIsSidebarSpaceDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Home size={12} className="text-slate-400" />
                          <span>返回空间大厅 (Back to Index)</span>
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

              {/* Topology / Builder Lab Design Tab */}
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

              {/* Analytics / Cloud monitoring Tab */}
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

              {/* Return to Spaces overview map */}
              <button
                onClick={() => setActiveSpaceId(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-[#10b981] hover:bg-emerald-50 transition-all flex items-center justify-center relative group cursor-pointer"
                title="Back to All Spaces"
              >
                <LayoutGrid size={20} />
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  All Spaces 大厅
                </span>
              </button>
            </div>

            {/* Bottom Settings Gear represents Space settings inside Space context */}
            <div className="flex flex-col items-center gap-2 w-full">
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
                title="Space Admin Config"
              >
                <Settings size={20} />
                <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Space Settings
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content View Frame */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfb]">
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
              
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
                      onSelectSite={setActiveSiteId}
                      onUpdateSites={setSites}
                      onUpdateNodes={setStructureNodes}
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

                  {activeTab === 'space-settings' && (
                    <SpaceSettingsView
                      activeSpaceId={activeSpaceId}
                      spaces={spaces}
                      onUpdateSpaces={setSpaces}
                      structureNodes={structureNodes}
                      onUpdateNodes={setStructureNodes}
                      members={members}
                      onUpdateMembers={setMembers}
                      roles={roles}
                      onUpdateRoles={setRoles}
                      auditLogs={auditLogs}
                      onUpdateAuditLogs={setAuditLogs}
                      onDeleteSpace={(spaceId) => {
                        setSpaces(spaces.filter(s => s.id !== spaceId));
                        setActiveSpaceId(null);
                      }}
                    />
                  )}
                </>
              )}

            </main>
          </div>

          {/* ==================== SUB-MODAL: PROVISION NEW SPACE FOR QUICK TRIGGER ==================== */}
          {isNewSpaceModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="bg-[#1e293b] p-5 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm">新建业务空间 (Provision Space)</h3>
                    <p className="text-[10px] text-slate-300 mt-0.5">Create a physical or logical environment container</p>
                  </div>
                  <button
                    onClick={() => setIsNewSpaceModalOpen(false)}
                    className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleCreateSpace} className="p-5 space-y-4 text-xs text-slate-600">
                  <div>
                    <label htmlFor="modal-space-name-quick" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Space Name * (e.g. 我的家, 星悦酒店项目, 民生总部大楼)
                    </label>
                    <input
                      type="text"
                      id="modal-space-name-quick"
                      required
                      placeholder="Enter custom Space name..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold text-slate-800"
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-space-desc-quick" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Space Description / Brief Context
                    </label>
                    <textarea
                      id="modal-space-desc-quick"
                      rows={3}
                      placeholder="Describe what devices are housed or managed under this Space..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-medium text-slate-700"
                      value={newSpaceDesc}
                      onChange={(e) => setNewSpaceDesc(e.target.value)}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewSpaceModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4.5 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-bold cursor-pointer transition-colors"
                    >
                      Provision Space
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
