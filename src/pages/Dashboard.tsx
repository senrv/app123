import { useAuth } from '../AuthContext';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchStats();
  }, [profile]);

  async function fetchStats() {
    if (!profile) return;

    let query = supabase.from('reports').select('status', { count: 'exact' });

    if (profile.role === 'siswa') {
      query = query.eq('reporter_id', profile.id);
    }

    const { data, error } = await query;

    if (!error && data) {
      const total = data.length;
      const pending = data.filter(r => r.status === 'diproses').length;
      const completed = data.filter(r => r.status === 'selesai').length;
      const rejected = data.filter(r => r.status === 'ditolak').length;
      setStats({ total, pending, completed, rejected });
    }
  }

  const cards = [
    { label: 'Total Laporan', value: stats.total, icon: FileText, color: 'blue' },
    { label: 'Sedang Diproses', value: stats.pending, icon: Clock, color: 'amber' },
    { label: 'Selesai Ditangani', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
    { label: 'Laporan Ditolak', value: stats.rejected, icon: AlertCircle, color: 'rose' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Halo, {profile?.full_name}! 👋
        </h1>
        <p className="text-slate-500 font-medium">
          Selamat datang di panel kontrol {profile?.role}. Berikut adalah ringkasan aktivitas Anda.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                ${card.color === 'amber' ? 'bg-amber-50 text-amber-600' : ''}
                ${card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
                ${card.color === 'rose' ? 'bg-rose-50 text-rose-600' : ''}
              `}>
                <card.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{card.label}</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Informasi Penting</h3>
            <div className="space-y-6">
              <div className="flex gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Kerahasiaan Terjamin</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Setiap laporan yang masuk akan dijaga kerahasiaannya. Identitas pelapor hanya diketahui oleh pihak berwenang (Guru & Admin).
                  </p>
                </div>
              </div>
              <div className="flex gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-gold-dark" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Dukungan Konseling</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Pihak sekolah menyediakan layanan konseling bagi korban maupun saksi tindakan bullying untuk pemulihan psikologis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-red p-8 rounded-3xl text-white shadow-xl shadow-red-200/50 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Butuh Bantuan Segera?</h3>
              <p className="text-red-100 mb-6 font-medium">Jangan ragu untuk melaporkan tindakan yang merugikan diri sendiri maupun orang lain.</p>
              {profile?.role === 'siswa' ? (
                <Link 
                  to="/app/create-report" 
                  className="inline-flex items-center gap-2 bg-white text-brand-red px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-all"
                >
                  Buat Laporan <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  to="/app/reports" 
                  className="inline-flex items-center gap-2 bg-white text-brand-red px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-all"
                >
                  Lihat Laporan <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
            <Shield className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Kontak Darurat</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Ruang BK</span>
                <span className="font-bold text-slate-900">Ext. 102</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Keamanan</span>
                <span className="font-bold text-slate-900">Ext. 110</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Hotline 24/7</span>
                <span className="font-bold text-brand-red">0812-3456-7890</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
