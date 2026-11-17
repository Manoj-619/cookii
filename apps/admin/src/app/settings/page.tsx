'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  MapPin,
  Percent,
  Sliders,
  BellRing,
  Key,
} from 'lucide-react';

export default function SettingsPage() {
  const [platformTakeRate, setPlatformTakeRate] = useState(15);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.2);
  const [autoReassignMinutes, setAutoReassignMinutes] = useState(10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const zones = [
    { name: 'Koramangala (Blocks 1-8)', status: 'Active', cooks: 14 },
    { name: 'Indiranagar & 100ft Rd', status: 'Active', cooks: 12 },
    { name: 'HSR Layout (Sectors 1-7)', status: 'Active', cooks: 15 },
    { name: 'Whitefield & ITPL', status: 'Active', cooks: 9 },
    { name: 'Bellandur & Green Glen', status: 'Active', cooks: 8 },
    { name: 'JP Nagar (Phases 1-7)', status: 'Active', cooks: 6 },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Operations & Platform Settings
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Configure pricing commission, automated cook dispatch timers, and Bengaluru active zones.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Platform Economics */}
        <div className="bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sliders className="w-5 h-5 text-[#059669]" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Platform Economics & Dispatch</h3>
              <p className="text-xs text-gray-500">Commission rates and matching algorithm parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Platform Take Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={platformTakeRate}
                  onChange={(e) => setPlatformTakeRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  %
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Cook receives 85% payout</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Weekend Peak Surge Multiplier
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.5"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
              <p className="text-[11px] text-gray-400 mt-1">Applied Saturday & Sunday peak meal hours</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Auto-Reassign Cook Timeout (mins)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={autoReassignMinutes}
                onChange={(e) => setAutoReassignMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
              <p className="text-[11px] text-gray-400 mt-1">If cook doesn't accept job within timer</p>
            </div>
          </div>
        </div>

        {/* Bengaluru Active Coverage Zones */}
        <div className="bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MapPin className="w-5 h-5 text-[#059669]" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Active Bengaluru Metro Zones</h3>
              <p className="text-xs text-gray-500">Service areas enabled for home cook dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900">{zone.name}</p>
                  <p className="text-[11px] text-gray-500">{zone.cooks} cooks assigned</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
                  {zone.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white rounded-[22px] p-6 border border-emerald-900/5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Key className="w-5 h-5 text-[#059669]" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Admin Team Roles</h3>
              <p className="text-xs text-gray-500">Authorized operations leads for Bengaluru console</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold">
                  PS
                </div>
                <div>
                  <p className="font-bold text-gray-900">Priya Sharma</p>
                  <p className="text-gray-500">ops@cookii.in • Senior Operations Lead</p>
                </div>
              </div>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
