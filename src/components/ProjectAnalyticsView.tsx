import React, { useState } from 'react';
import { Site } from '../types';
import {
  Plus, PieChart, BarChart3, LayoutDashboard, Sparkles,
  Thermometer, Zap, Droplets, Wind, X, Check, Building2,
} from 'lucide-react';

interface ProjectAnalyticsViewProps {
  sites: Site[];
}

type AnalyticsTab = 'dashboards' | 'charts' | 'schematics' | 'value-history';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  studioIds: string[];
  createdAt: string;
}

const TEMPLATE_GALLERY = [
  { id: 'energy-overview', label: 'Energy Overview', icon: Zap, color: 'text-amber-500 bg-amber-50' },
  { id: 'energy-usage', label: 'Energy Usage', icon: BarChart3, color: 'text-emerald-500 bg-emerald-50' },
  { id: 'room-climate', label: 'Room Climate', icon: Thermometer, color: 'text-sky-500 bg-sky-50' },
  { id: 'humidity', label: 'Humidity', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
  { id: 'air-quality', label: 'Air Quality', icon: Wind, color: 'text-violet-500 bg-violet-50' },
];

const TABS: { id: AnalyticsTab; label: string }[] = [
  { id: 'dashboards', label: 'Dashboards' },
  { id: 'charts', label: 'Charts' },
  { id: 'schematics', label: 'Schematics' },
  { id: 'value-history', label: 'Value History' },
];

export default function ProjectAnalyticsView({ sites }: ProjectAnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('dashboards');
  const [selectedStudioIds, setSelectedStudioIds] = useState<Set<string>>(new Set());
  const [dashboards, setDashboards] = useState<DashboardCard[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiCreateOpen, setIsAiCreateOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');

  const toggleStudio = (id: string) => {
    setSelectedStudioIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    const studioIds = selectedStudioIds.size > 0
      ? Array.from(selectedStudioIds)
      : sites.slice(0, 1).map(s => s.id);

    setTimeout(() => {
      const title = aiPrompt.length > 40 ? `${aiPrompt.slice(0, 40)}…` : aiPrompt;
      setDashboards(prev => [
        {
          id: `dash-${Date.now()}`,
          title,
          description: `AI-generated dashboard linked to ${studioIds.length} Studio(s) telemetry`,
          studioIds,
          createdAt: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      setAiGenerating(false);
      setIsAiCreateOpen(false);
      setAiPrompt('');
    }, 1500);
  };

  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return;
    const studioIds = selectedStudioIds.size > 0
      ? Array.from(selectedStudioIds)
      : sites.map(s => s.id);
    setDashboards(prev => [
      {
        id: `dash-${Date.now()}`,
        title: newDashboardName.trim(),
        description: `Custom dashboard for ${studioIds.length} Studio(s)`,
        studioIds,
        createdAt: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);
    setNewDashboardName('');
    setIsCreateOpen(false);
  };

  const studioName = (id: string) => sites.find(s => s.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900">Analytics</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Sparkles size={14} className="text-violet-500" />
            AI Create
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer"
          >
            <Plus size={14} />
            Create
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#10b981] text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboards' && (
        <div className="flex gap-5">
          {/* Studio Structure sidebar */}
          <div className="w-52 shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Studio Structure
            </h4>
            <div className="space-y-1">
              {sites.length === 0 ? (
                <p className="text-[11px] text-slate-400">No Studios in this project</p>
              ) : (
                sites.map(site => (
                  <button
                    key={site.id}
                    onClick={() => toggleStudio(site.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      selectedStudioIds.has(site.id)
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 size={13} className="shrink-0" />
                    <span className="truncate">{site.name}</span>
                    {selectedStudioIds.has(site.id) && <Check size={12} className="ml-auto text-emerald-600" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Template gallery */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {TEMPLATE_GALLERY.map(tpl => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    className="shrink-0 w-36 bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${tpl.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 block">{tpl.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dashboards list or empty state */}
            {dashboards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboards.map(dash => (
                  <div
                    key={dash.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <LayoutDashboard size={16} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{dash.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{dash.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dash.studioIds.map(sid => (
                            <span key={sid} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {studioName(sid)}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-300 mt-2">{dash.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center shadow-xs">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <PieChart size={40} className="text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">No dashboards yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-5">
                  Keep all relevant KPIs, energy metrics, and room climate data in one place. Create a dashboard or let AI build one for you.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer"
                >
                  <Plus size={14} />
                  Create
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab !== 'dashboards' && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center shadow-xs">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <BarChart3 size={32} className="text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 mb-1">
            {TABS.find(t => t.id === activeTab)?.label} — Coming soon
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            This section will display {activeTab.replace('-', ' ')} for your project Studios.
          </p>
        </div>
      )}

      {/* Create Dashboard Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-800">Create Dashboard</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Dashboard name</label>
                <input
                  value={newDashboardName}
                  onChange={e => setNewDashboardName(e.target.value)}
                  placeholder="e.g. Energy Overview"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              {selectedStudioIds.size > 0 && (
                <p className="text-[11px] text-slate-400">
                  Linked to {selectedStudioIds.size} selected Studio(s)
                </p>
              )}
              <button
                onClick={handleCreateDashboard}
                disabled={!newDashboardName.trim()}
                className="w-full py-2 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Create Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Create Dashboard Modal */}
      {isAiCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                <h3 className="font-extrabold text-sm text-slate-800">AI Create Dashboard</h3>
              </div>
              <button onClick={() => setIsAiCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Describe what you want to monitor. AI will generate a dashboard card linked to your selected Studio(s) telemetry.
              </p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Show energy consumption per room with weekly trends and peak usage alerts"
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
              />
              {selectedStudioIds.size > 0 ? (
                <p className="text-[11px] text-emerald-600 font-medium">
                  Scope: {Array.from(selectedStudioIds).map(studioName).join(', ')}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  No Studios selected — will use all project Studios
                </p>
              )}
              <button
                onClick={handleAiGenerate}
                disabled={!aiPrompt.trim() || aiGenerating}
                className="w-full py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Dashboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
