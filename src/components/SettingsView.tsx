import React, { useState } from 'react';
import { Shield, Cloud, Bell, RefreshCw, Key, Check, HelpCircle, HardDrive } from 'lucide-react';

export default function SettingsView() {
  const [otaStatus, setOtaStatus] = useState<'idle' | 'updating' | 'success'>('idle');
  const [otaProgress, setOtaProgress] = useState(0);

  const startOtaCycle = () => {
    setOtaStatus('updating');
    setOtaProgress(0);
    const interval = setInterval(() => {
      setOtaProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setOtaStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-6">
        
        {/* OTA Firmware Update Manager */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <RefreshCw size={16} className="text-slate-700 animate-spin-slow" />
              Central OTA Firmware Deployer
            </h3>
            <p className="text-xs text-slate-400">Deploy the latest local Thread cluster software updates across active gateways globally.</p>
          </div>

          <div>
            {otaStatus === 'idle' && (
              <button
                id="start-ota-btn"
                onClick={startOtaCycle}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Push Global OTA v4.5.2
              </button>
            )}

            {otaStatus === 'updating' && (
              <div className="flex items-center gap-3 w-44">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${otaProgress}%` }} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">{otaProgress}%</span>
              </div>
            )}

            {otaStatus === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg animate-in fade-in duration-200">
                <Check size={14} />
                <span>OTA Deployed Successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Security Triggers */}
        <div className="space-y-4 pb-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Shield size={16} className="text-slate-700" />
            Central Threat Safeguards
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Adaptive RF Guard</h4>
                <p className="text-[10px] text-slate-400 mt-1">Automatically switches Zigbee channels during external 2.4GHz interference events.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-9 h-5 bg-slate-200 rounded-full appearance-none checked:bg-slate-950 transition-colors relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform" />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Intelligent Door Lock-down</h4>
                <p className="text-[10px] text-slate-400 mt-1">Locks down all smart deadbolts instantly if any camera registers motion alarm at night.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-9 h-5 bg-slate-200 rounded-full appearance-none checked:bg-slate-950 transition-colors relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform" />
            </div>
          </div>
        </div>

        {/* SaaS Cloud Integrations */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Cloud size={16} className="text-slate-700" />
            Central SaaS Cloud Integrations
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Key size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Apple HomeKit & Matter Cloud Sync</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Permits direct Siri voice queries and Home App pairing across active sites.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                Active Matter Link
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Bell size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Slack / Discord Telemetry Notifications</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Post real-time hub logs directly to custom channels.</p>
                </div>
              </div>
              <button className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                Configure
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
