import React from 'react';
import {
  Users,
  ChefHat,
  CalendarCheck,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#EBE5DD] bg-[#FFFFFF] p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#E05315] flex items-center justify-center text-white font-bold text-xl shadow-md">
              🌿
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1E1B18] tracking-tight">Cookii Ops</h1>
              <p className="text-xs text-[#968E85]">Bengaluru Metro HQ</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FFF2EC] text-[#E05315] font-semibold text-sm"
            >
              <ChefHat className="w-4 h-4" />
              Cook Verification (2)
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#635D56] hover:bg-[#FAF7F2] font-medium text-sm transition"
            >
              <MapPin className="w-4 h-4" />
              Live Ops Map
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#635D56] hover:bg-[#FAF7F2] font-medium text-sm transition"
            >
              <CalendarCheck className="w-4 h-4" />
              Bookings & Dispatch
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#635D56] hover:bg-[#FAF7F2] font-medium text-sm transition"
            >
              <Users className="w-4 h-4" />
              Customer Support
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#635D56] hover:bg-[#FAF7F2] font-medium text-sm transition"
            >
              <ShieldAlert className="w-4 h-4" />
              SOS Safety Alerts
            </a>
          </nav>
        </div>

        <div className="border-t border-[#EBE5DD] pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-xs">
              OP
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1E1B18]">Ops Manager</p>
              <p className="text-[10px] text-[#15803D] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse"></span>
                System Healthy
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1E1B18] tracking-tight">Bengaluru Operations Dispatch</h2>
            <p className="text-sm text-[#635D56]">
              Real-time monitoring for Koramangala, Indiranagar, HSR Layout, Whitefield & Bellandur.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full border border-[#FED7C2] bg-[#FFF2EC] text-[#E05315] text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E05315] animate-ping"></span>
              Live Dispatch Active
            </div>
          </div>
        </header>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-[#EBE5DD] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#968E85] mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Active Cooks</span>
              <ChefHat className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-3xl font-bold text-[#1E1B18]">48</div>
            <p className="text-xs text-[#15803D] font-medium mt-1">36 available • 12 on active jobs</p>
          </div>

          <div className="bg-white border border-[#EBE5DD] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#968E85] mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Today Bookings</span>
              <CalendarCheck className="w-4 h-4 text-[#E05315]" />
            </div>
            <div className="text-3xl font-bold text-[#1E1B18]">142</div>
            <p className="text-xs text-[#635D56] font-medium mt-1">98% completed • 0 cancellations</p>
          </div>

          <div className="bg-white border border-[#EBE5DD] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#968E85] mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Verification Queue</span>
              <Clock className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-3xl font-bold text-[#1E1B18]">2</div>
            <p className="text-xs text-[#D97706] font-medium mt-1">Avg review time: 14 mins</p>
          </div>

          <div className="bg-white border border-[#EBE5DD] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#968E85] mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">SOS Distress</span>
              <ShieldAlert className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-3xl font-bold text-[#15803D]">0</div>
            <p className="text-xs text-[#15803D] font-medium mt-1">All active cook sessions safe</p>
          </div>
        </div>

        {/* Verification Queue Section */}
        <section className="bg-white border border-[#EBE5DD] rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#1E1B18]">Cook Verification Queue</h3>
              <p className="text-xs text-[#635D56]">Aadhaar and police verification certificates awaiting ops signoff.</p>
            </div>
            <span className="text-xs text-[#968E85]">Keyboard shortcuts: [A] Approve • [R] Reject</span>
          </div>

          <div className="divide-y divide-[#EBE5DD]">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F3EFEA] flex items-center justify-center font-bold text-base text-[#1E1B18]">
                  MG
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E1B18]">Manjula Gowda</h4>
                  <p className="text-xs text-[#635D56]">+91 98450 12345 • Speaks Kannada, Telugu</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF2EC] text-[#E05315]">
                      South Indian, Karnataka Special
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#15803D]">
                      Aadhaar Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-[#DDD5CA] rounded-xl text-xs font-medium hover:bg-[#FAF7F2] transition">
                  Inspect Documents
                </button>
                <button className="px-3 py-1.5 bg-[#15803D] text-white rounded-xl text-xs font-semibold hover:bg-[#166534] transition flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button className="px-3 py-1.5 bg-[#DC2626] text-white rounded-xl text-xs font-semibold hover:bg-[#B91C1C] transition flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F3EFEA] flex items-center justify-center font-bold text-base text-[#1E1B18]">
                  RS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E1B18]">Rajesh Sharma</h4>
                  <p className="text-xs text-[#635D56]">+91 99801 12233 • Speaks Hindi, English</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF2EC] text-[#E05315]">
                      North Indian, Continental
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706]">
                      Police Cert Pending
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-[#DDD5CA] rounded-xl text-xs font-medium hover:bg-[#FAF7F2] transition">
                  Inspect Documents
                </button>
                <button className="px-3 py-1.5 bg-[#15803D] text-white rounded-xl text-xs font-semibold hover:bg-[#166534] transition flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button className="px-3 py-1.5 bg-[#DC2626] text-white rounded-xl text-xs font-semibold hover:bg-[#B91C1C] transition flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bengaluru Live Map & Zone Heatmap View */}
        <section className="bg-white border border-[#EBE5DD] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#1E1B18]">Live Ops Radar (Bengaluru Metro)</h3>
              <p className="text-xs text-[#635D56]">MapLibre + OpenStreetMap live coordinates tracking.</p>
            </div>
            <div className="text-xs font-medium text-[#635D56] flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#15803D]"></span> Online</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E05315]"></span> Cooking</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span> En Route</span>
            </div>
          </div>

          <div className="h-72 rounded-xl bg-[#FAF7F2] border border-[#DDD5CA] flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-8 h-8 text-[#E05315] mb-2 animate-bounce" />
            <p className="font-bold text-sm text-[#1E1B18]">Active Geospatial Grid (12.9716° N, 77.5946° E)</p>
            <p className="text-xs text-[#635D56] max-w-md mt-1">
              48 verified cooks tracked via 2dsphere indexes across Koramangala, Indiranagar, HSR Layout, Whitefield, Bellandur and JP Nagar.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

