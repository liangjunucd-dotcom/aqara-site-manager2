import React, { useState } from 'react';
import { Site, Device } from '../types';
import { 
  Search, Grid, List, SlidersHorizontal, Cpu, 
  Video, Lock, Smartphone, Lightbulb, HelpCircle, 
  Compass, Plus, Clock, ShieldCheck, ChevronDown
} from 'lucide-react';

interface SiteGridProps {
  sites: Site[];
  onSelectSite: (siteId: string) => void;
  onAddSite: (site: Omit<Site, 'id' | 'devices' | 'timeline'>) => void;
  onQuickSimulate: (siteId: string, status: 'up-to-date' | 'warning' | 'offline') => void;
}

export default function SiteGrid({ sites, onSelectSite, onAddSite, onQuickSimulate }: SiteGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'devices' | 'status'>('name');
  
  // Modals / Creating Site state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newSiteTZ, setNewSiteTZ] = useState('PST (UTC-8)');

  // Filter Logic: Search + Device Category Subfiltering
  const filteredSites = sites
    .filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (site.modelType && site.modelType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (site.isp && site.isp.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (deviceFilter === 'all') return matchesSearch;
      
      // Filter by presence of specific hardware types
      const matchesDevice = site.devices.some(d => d.type === deviceFilter);
      return matchesSearch && matchesDevice;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'devices') return b.devices.length - a.devices.length;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const getDeviceIcon = (type: Device['type'], size = 13) => {
    switch (type) {
      case 'hub': return <Cpu size={size} className="text-slate-500" />;
      case 'camera': return <Video size={size} className="text-slate-500" />;
      case 'lock': return <Lock size={size} className="text-slate-500" />;
      case 'sensor': return <Compass size={size} className="text-slate-500" />;
      case 'switch': return <Smartphone size={size} className="text-slate-500" />;
      case 'light': return <Lightbulb size={size} className="text-slate-500" />;
      default: return <HelpCircle size={size} className="text-slate-500" />;
    }
  };

  const countDeviceType = (devices: Device[], type: Device['type']) => {
    return devices.filter(d => d.type === type).length;
  };

  const renderISPLogo = (isp?: string) => {
    if (!isp) return (
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 font-sans">Unknown ISP</span>
      </div>
    );

    if (isp.includes('AT&T')) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-4.5 h-4.5 rounded-full bg-[#00a8df] flex items-center justify-center text-white font-black text-[7px] select-none relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            <span className="z-10 text-[7px]">AT&T</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-sans">{isp}</span>
        </div>
      );
    }
    if (isp.includes('Comcast')) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-4.5 h-4.5 rounded-full bg-[#101820] flex items-center justify-center text-white font-bold text-[7px] select-none border border-slate-200">
            CB
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-sans">{isp}</span>
        </div>
      );
    }
    if (isp.includes('Vodafone')) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-4.5 h-4.5 rounded-full bg-[#e60000] flex items-center justify-center text-white font-bold text-[8px] select-none">
            ”
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-sans">{isp}</span>
        </div>
      );
    }
    if (isp.includes('Verizon')) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-4.5 h-4.5 rounded bg-black flex items-center justify-center text-[#ff0000] font-black text-[8px] select-none">
            ✓
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-sans">{isp}</span>
        </div>
      );
    }
    if (isp.includes('TET')) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-4.5 h-4.5 rounded bg-cyan-700 flex items-center justify-center text-white font-black text-[6px] select-none">
            TET
          </div>
          <span className="text-[11px] font-semibold text-slate-600 font-sans">{isp}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-4.5 h-4.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 font-sans">{isp}</span>
      </div>
    );
  };

  const renderWifiSignal = () => (
    <svg className="w-3.5 h-3.5 text-sky-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.7 16.3C5.4 14 5.4 10 7.7 7.7M10.6 13.4C9.4 12.2 9.4 10.3 10.6 9.1M12 12h.01" />
    </svg>
  );

  const handleSubmitSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteLocation.trim()) return;
    onAddSite({
      name: newSiteName,
      location: newSiteLocation,
      timeZone: newSiteTZ,
      status: 'up-to-date',
      modelType: 'Aqara Hub M3',
      isp: 'AT&T Business'
    });
    setNewSiteName('');
    setNewSiteLocation('');
    setIsAddOpen(false);
  };

  // Static/Dynamic hardware filtering indicators from screenshot
  const filterCounts = {
    all: 19,
    hub: 17,
    camera: 14,
    lock: 11,
    sensor: 11,
    switch: 11
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Unifi-identical Filters & Search Toolbar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-3 bg-white px-4 py-2 rounded-[6px] border border-[#e4e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none">
        
        {/* Left Side: Search Bar and Site Group Selector */}
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              id="site-search"
              placeholder="Search sites"
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-[4px] bg-[#fcfcfc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded-[4px] bg-[#fcfcfc] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap">
            <span>Site Group</span>
            <ChevronDown size={12} className="text-slate-400" />
          </div>
        </div>

        {/* Right Side: Category selectors, Plus, Grid/List view */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
          
          {/* Main category horizontal tag filter list */}
          <div className="flex items-center overflow-x-auto scrollbar-none gap-1 bg-slate-50 p-0.5 rounded-[6px] border border-slate-100">
            {/* All Tag */}
            <button
              onClick={() => setDeviceFilter('all')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] font-bold ${deviceFilter === 'all' ? 'text-slate-700' : 'text-slate-400'}`}>
                ({filterCounts.all})
              </span>
            </button>

            {/* Hub Category Tag */}
            <button
              onClick={() => setDeviceFilter('hub')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceFilter === 'hub'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu size={12} />
              <span className={`text-[10px] font-bold ${deviceFilter === 'hub' ? 'text-slate-700' : 'text-slate-400'}`}>
                ({filterCounts.hub})
              </span>
            </button>

            {/* Camera Category Tag */}
            <button
              onClick={() => setDeviceFilter('camera')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceFilter === 'camera'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Video size={12} />
              <span className={`text-[10px] font-bold ${deviceFilter === 'camera' ? 'text-slate-700' : 'text-slate-400'}`}>
                ({filterCounts.camera})
              </span>
            </button>

            {/* Lock Category Tag */}
            <button
              onClick={() => setDeviceFilter('lock')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceFilter === 'lock'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock size={12} />
              <span className={`text-[10px] font-bold ${deviceFilter === 'lock' ? 'text-slate-700' : 'text-slate-400'}`}>
                ({filterCounts.lock})
              </span>
            </button>

            {/* Sensor Category Tag */}
            <button
              onClick={() => setDeviceFilter('sensor')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceFilter === 'sensor'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass size={12} />
              <span className={`text-[10px] font-bold ${deviceFilter === 'sensor' ? 'text-slate-700' : 'text-slate-400'}`}>
                ({filterCounts.sensor})
              </span>
            </button>

            {/* Switch Category Tag */}
            <button
              onClick={() => setDeviceFilter('switch')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceFilter === 'switch'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone size={12} />
              <span className={`text-[10px] font-bold ${deviceFilter === 'switch' ? 'text-slate-700' : 'text-slate-400'}`}>
                ({filterCounts.switch})
              </span>
            </button>
          </div>

          {/* Separator line */}
          <div className="h-4 w-[1px] bg-[#e4e7eb] mx-1" />

          {/* Plus Add button (circular icon) */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            title="Create a New Site"
          >
            <Plus size={14} />
          </button>

          {/* Grid/List layout selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-[4px] border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-[3px] transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-[3px] transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={13} />
            </button>
          </div>

          {/* Extra Sort controller sliders trigger */}
          <button
            onClick={() => {
              const modes: ('name' | 'devices' | 'status')[] = ['name', 'devices', 'status'];
              const nextIndex = (modes.indexOf(sortBy) + 1) % modes.length;
              setSortBy(modes[nextIndex]);
            }}
            className="p-1.5 border border-slate-200 rounded-[4px] bg-[#fcfcfc] text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
            title={`Sorting by: ${sortBy}`}
          >
            <SlidersHorizontal size={13} />
          </button>

        </div>
      </div>

      {/* Sorting Control Info Bar */}
      <div className="flex justify-between items-center px-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
        <div>
          Showing {filteredSites.length} of {sites.length} Active Cloud Sites
        </div>
        <div>
          Sorted by: <span className="text-slate-600 font-bold underline capitalize">{sortBy}</span>
        </div>
      </div>

      {/* Main Sites Layout */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSites.map((site) => {
            return (
              <div
                key={site.id}
                id={`site-card-${site.id}`}
                className={`group relative bg-white border border-[#e4e7eb] rounded-[6px] p-4.5 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer select-none ${
                  site.selectedGlow 
                    ? 'ring-1.5 ring-sky-500/80 shadow-[0_2px_8px_rgba(14,165,233,0.15)] bg-sky-50/5 border-sky-200' 
                    : ''
                }`}
                onClick={() => onSelectSite(site.id)}
              >
                {/* 1. Quick simulation hover panel */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white p-1 rounded-md flex gap-1 z-20 shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onQuickSimulate(site.id, 'up-to-date')}
                    className="px-1.5 py-0.5 text-[9px] bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold"
                    title="Safe"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => onQuickSimulate(site.id, 'warning')}
                    className="px-1.5 py-0.5 text-[9px] bg-amber-500 hover:bg-amber-400 rounded text-black font-bold"
                    title="Warning"
                  >
                    Warn
                  </button>
                  <button
                    onClick={() => onQuickSimulate(site.id, 'offline')}
                    className="px-1.5 py-0.5 text-[9px] bg-rose-600 hover:bg-rose-500 rounded text-white font-bold"
                    title="Incident"
                  >
                    Crash
                  </button>
                </div>

                <div>
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-[#2e3742] text-[13.5px] tracking-tight group-hover:text-slate-900 truncate max-w-[130px] md:max-w-[150px]">
                        {site.name}
                      </h3>
                      {site.deviceCountBadge && (
                        <span className="px-1 py-0.1 bg-slate-100 border border-slate-200 text-[#5f6c7d] text-[9px] font-extrabold rounded-sm">
                          {site.deviceCountBadge}
                        </span>
                      )}
                    </div>
                    
                    {/* Invited state or Merge link */}
                    {site.invited ? (
                      <span className="text-sky-600 text-[10.5px] font-semibold">
                        Invited
                      </span>
                    ) : site.mergeLink ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Initiating automated merge cluster for ${site.name}. All Matter bindings will synchronize.`);
                        }}
                        className="text-sky-600 hover:underline text-[10.5px] font-semibold cursor-pointer"
                      >
                        Merge
                      </button>
                    ) : null}
                  </div>

                  {/* Status Indicator Row (bright green dot and modelType) */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className={`w-2 h-2 rounded-full ${
                      site.status === 'offline' ? 'bg-rose-500 animate-pulse' :
                      site.status === 'warning' ? 'bg-amber-400' : 'bg-[#05d5a1]'
                    }`} />
                    <span className="text-[10.5px] font-bold text-slate-400 tracking-wide font-sans uppercase">
                      {site.modelType || 'Aqara Studio Controller'}
                    </span>
                  </div>

                  {/* High Fidelity Segmented Timeline */}
                  <div className="my-3 space-y-1">
                    <div className="flex h-[5px] w-full rounded-full overflow-hidden bg-slate-100 gap-[2px]">
                      {site.timeline.map((segment, index) => {
                        let colorClass = 'bg-[#05d5a1]'; // bright cyan/green
                        if (site.status === 'offline') {
                          colorClass = 'bg-rose-500';
                        } else if (segment.status === 'warning') {
                          // Blue block on International HQ & LA to match screenshot precisely
                          colorClass = (site.id === 'international-hq' || site.id === 'los-angeles' || site.id === 'corporate-hq') ? 'bg-sky-500' : 'bg-amber-400';
                        } else if (segment.status === 'offline') {
                          colorClass = 'bg-rose-500';
                        }
                        
                        return (
                          <div 
                            key={index}
                            className={`h-full ${colorClass}`}
                            style={{ width: `${segment.length}%` }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Monospace timeline markings */}
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono tracking-wider">
                      <span>05:00</span>
                      <span>11:00</span>
                      <span>NOW</span>
                    </div>
                  </div>

                  {/* ISP Line */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-2 select-none">
                    {renderISPLogo(site.isp)}
                    
                    {/* Small padlock/shield outline */}
                    <div className="text-slate-300">
                      <ShieldCheck size={13} className="text-slate-300 hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>

                </div>

                {/* Device Deployments Tray at very bottom of card */}
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#f4f6f8]">
                  {['hub', 'camera', 'lock', 'sensor', 'switch'].map((type) => {
                    const count = countDeviceType(site.devices, type as Device['type']);
                    if (count === 0) return null;
                    return (
                      <div 
                        key={type} 
                        className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs"
                        title={`${count} ${type}(s) deployed`}
                      >
                        {getDeviceIcon(type as Device['type'], 12)}
                      </div>
                    );
                  })}
                  
                  {/* Wifi signal on far right */}
                  {renderWifiSignal()}
                </div>

              </div>
            );
          })}

          {/* Dotted border card for creating a new site */}
          <div 
            onClick={() => setIsAddOpen(true)}
            className="border-1.5 border-dashed border-slate-300 hover:border-slate-400 rounded-[6px] p-4 flex flex-col items-center justify-center min-h-[150px] text-slate-400 hover:text-slate-600 transition-all cursor-pointer bg-slate-50/10 hover:bg-slate-50/40 select-none"
          >
            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center mb-1.5">
              <Plus size={14} className="text-slate-400" />
            </div>
            <span className="text-xs font-bold tracking-tight">Create a New Site</span>
            <span className="text-[10px] text-slate-400 mt-0.5">SaaS Commissioning Node</span>
          </div>

        </div>
      ) : (
        /* List View Mode for industrial monitoring */
        <div className="bg-white border border-[#e4e7eb] rounded-[6px] overflow-hidden shadow-2xs select-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="p-3 pl-5">Site Details</th>
                <th className="p-3">SaaS Controller</th>
                <th className="p-3">Provider Gateway</th>
                <th className="p-3">State</th>
                <th className="p-3">Devices Connected</th>
                <th className="p-3 text-right pr-5">Quick Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredSites.map((site) => (
                <tr 
                  key={site.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => onSelectSite(site.id)}
                >
                  <td className="p-3 pl-5">
                    <div className="font-bold text-slate-800">{site.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{site.location}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-600 font-mono">
                      {site.modelType || 'Aqara Hub M3'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-600">
                      {site.isp || 'AT&T Business'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        site.status === 'offline' ? 'bg-rose-500' :
                        site.status === 'warning' ? 'bg-amber-400' : 'bg-[#05d5a1]'
                      }`} />
                      <span className="font-semibold text-slate-700 capitalize">
                        {site.status === 'offline' ? 'Incident Alert' : 'Safe Sync'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-slate-600">
                        {site.devices.length} Total
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onQuickSimulate(site.id, 'up-to-date')}
                        className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-bold border border-emerald-200 cursor-pointer"
                      >
                        Safe
                      </button>
                      <button
                        onClick={() => onQuickSimulate(site.id, 'offline')}
                        className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-bold border border-rose-200 cursor-pointer"
                      >
                        Crash
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Site Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#2b3542] p-4 text-white flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-sm tracking-tight">Provision SaaS Tenant Site</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">Centralized cloud binding & registration</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmitSite} className="p-4 space-y-3.5">
              <div>
                <label htmlFor="site-name-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Site Name / Tenant City
                </label>
                <input
                  type="text"
                  id="site-name-input"
                  required
                  placeholder="e.g. Hong Kong Lab, Tokyo Showroom"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="site-location-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Physical Controller Location
                </label>
                <input
                  type="text"
                  id="site-location-input"
                  required
                  placeholder="e.g. Aqara Studio Cloud Hub A"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                  value={newSiteLocation}
                  onChange={(e) => setNewSiteLocation(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="site-timezone-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Operating Time Zone
                </label>
                <select
                  id="site-timezone-input"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  value={newSiteTZ}
                  onChange={(e) => setNewSiteTZ(e.target.value)}
                >
                  <option value="PST (UTC-8)">PST (UTC-8) - Pacific Standard Time</option>
                  <option value="EST (UTC-5)">EST (UTC-5) - Eastern Standard Time</option>
                  <option value="GMT (UTC+0)">GMT (UTC+0) - Greenwich Mean Time</option>
                  <option value="CET (UTC+1)">CET (UTC+1) - Central European Time</option>
                  <option value="SGT (UTC+8)">SGT (UTC+8) - Singapore Standard Time</option>
                  <option value="JST (UTC+9)">JST (UTC+9) - Japan Standard Time</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="close-add-modal"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-add-site"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Provision Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
