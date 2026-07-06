import React from 'react';
import { Site, Device } from '../types';
import { 
  BarChart3, Activity, AlertOctagon, Users, ShieldCheck, 
  ChevronRight, HelpCircle, ArrowUpRight, Cpu, HardDrive, WifiOff
} from 'lucide-react';

interface AnalyticsViewProps {
  sites: Site[];
  onSelectSite: (siteId: string) => void;
}

export default function AnalyticsView({ sites, onSelectSite }: AnalyticsViewProps) {
  // Compute global stats
  const totalSites = sites.length;
  const invitedSites = sites.filter(s => s.invited).length;
  const activeSites = totalSites - invitedSites;
  
  const totalDevices = sites.reduce((acc, s) => acc + s.devices.length, 0);
  const totalOfflineDevices = sites.reduce((acc, s) => {
    return acc + s.devices.filter(d => d.status === 'offline').length;
  }, 0);
  
  const overallHealth = totalDevices > 0 
    ? Math.round(((totalDevices - totalOfflineDevices) / totalDevices) * 100)
    : 100;

  // Compile active warnings list
  const activeAlarms: { siteId: string; siteName: string; deviceName: string; type: string; status: string }[] = [];
  sites.forEach(site => {
    site.devices.forEach(d => {
      if (d.status === 'offline') {
        activeAlarms.push({
          siteId: site.id,
          siteName: site.name,
          deviceName: d.name,
          type: d.type,
          status: 'Offline Incident'
        });
      } else if (d.status === 'warning') {
        activeAlarms.push({
          siteId: site.id,
          siteName: site.name,
          deviceName: d.name,
          type: d.type,
          status: 'Low Battery Warning'
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Hardware */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Global Hardware Nodes
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalDevices} Units
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-2 font-medium">
              <span className="font-bold">+{sites.length}</span> deployed this quarter
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800">
            <HardDrive size={22} />
          </div>
        </div>

        {/* Global Network Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Thread Mesh Reliability
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {overallHealth}%
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-2 font-medium">
              <ShieldCheck size={12} />
              <span>Optimal Mesh routing</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800">
            <Activity size={22} />
          </div>
        </div>

        {/* Active Alarms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              RF Interferences / Crashes
            </span>
            <span className={`text-2xl font-black mt-1 block ${totalOfflineDevices > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalOfflineDevices} Alarms
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-medium">
              <span>{activeAlarms.length} events logged recently</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${totalOfflineDevices > 0 ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
            <AlertOctagon size={22} />
          </div>
        </div>

        {/* Cloud Tenants Managed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              SaaS Central Tenants
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalSites} Sites
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-medium font-mono">
              <span className="bg-slate-100 px-1.5 py-0.2 rounded">{activeSites} Active</span>
              <span className="bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded">{invitedSites} Invited</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800">
            <Users size={22} />
          </div>
        </div>

      </div>

      {/* Main split display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Active alert alarms listing (2/3 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Centralized Site Incidents Monitor</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time alert synchronization across active Matter networks</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded">
              High Priority Priority
            </span>
          </div>

          {activeAlarms.length > 0 ? (
            <div className="space-y-3">
              {activeAlarms.map((alarm, index) => (
                <div 
                  key={index}
                  className="p-3.5 bg-rose-50/20 border border-rose-100/60 rounded-xl flex items-center justify-between hover:bg-rose-50/40 transition-colors cursor-pointer"
                  onClick={() => onSelectSite(alarm.siteId)}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                      <WifiOff size={15} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {alarm.siteName} — {alarm.deviceName}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">Category SKU: {alarm.type.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                      {alarm.status}
                    </span>
                    <ChevronRight size={14} className="text-rose-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-10 rounded-xl text-center text-slate-400 text-xs py-14 flex flex-col items-center justify-center space-y-2">
              <ShieldCheck size={36} className="text-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-600">Zero active alerts reported.</span>
              <p className="max-w-xs text-slate-400 mt-1">All global sites, gateways, and edge devices are operating normally under low RF interference thresholds.</p>
            </div>
          )}
        </div>

        {/* Right Section: RF Mesh Topology Metrics (1/3 cols) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Gateways Deployment Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Physical device composition breakdown</p>
          </div>

          {/* Elegant SVG-based metric layout representing relative hardware ratios */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  Central Hub M3 Router
                </span>
                <span className="font-bold font-mono">12 Deployed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-2/5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500" />
                  CCTV Camera G3 Streamer
                </span>
                <span className="font-bold font-mono">9 Deployed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-1/3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  Smart Biometric Deadbolt
                </span>
                <span className="font-bold font-mono">7 Deployed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-1/4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  Matter Endpoints (Sensors/Switches)
                </span>
                <span className="font-bold font-mono">34 Deployed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-4/5" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-[11px] text-slate-400 leading-relaxed font-mono">
            * Mesh metrics are computed hourly via polling central Matter controller logs dynamically.
          </div>
        </div>

      </div>
    </div>
  );
}
