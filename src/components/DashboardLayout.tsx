import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Shield, 
  Menu, 
  X, 
  PlusCircle, 
  History,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = {
    admin: [
      { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/reports', icon: FileText, label: 'Laporan Bullying' },
      { to: '/app/recap', icon: BarChart3, label: 'Rekap Laporan' },
      { to: '/app/students', icon: GraduationCap, label: 'Data Siswa' },
      { to: '/app/users', icon: Users, label: 'User Management' },
    ],
    guru: [
      { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/reports', icon: FileText, label: 'Laporan Siswa' },
      { to: '/app/recap', icon: BarChart3, label: 'Rekap Laporan' },
    ],
    siswa: [
      { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/create-report', icon: PlusCircle, label: 'Buat Laporan' },
      { to: '/app/history', icon: History, label: 'Riwayat Laporan' },
    ],
  };

  const currentMenu = profile ? menuItems[profile.role] : [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-40">
        <div className="p-8 flex items-center gap-3 border-b border-slate-100">
          <Shield className="w-8 h-8 text-brand-primary" />
          <span className="font-bold text-xl tracking-tight text-slate-900">SMK Prima</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {currentMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all group",
                isActive 
                  ? "bg-sky-50 text-brand-primary shadow-sm shadow-sky-100/50" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center text-white font-bold">
              {profile?.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-primary" />
            <span className="font-bold text-xl tracking-tight text-slate-900">SMK Prima</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {currentMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all",
                isActive 
                  ? "bg-sky-50 text-brand-primary shadow-sm shadow-sky-100/50" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-slate-900">
              {currentMenu.find(item => window.location.pathname === item.to)?.label || 'Dashboard'}
            </h2>
          </div>

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-sky-50 hover:text-brand-primary transition-all border border-slate-200 hover:border-sky-100"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-10 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
