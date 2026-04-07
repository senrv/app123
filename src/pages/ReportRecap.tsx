import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Report } from '../types';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter, 
  Loader2,
  PieChart as PieChartIcon,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export default function ReportRecap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*, profiles(full_name, role, nis, kelas)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const reportDate = new Date(report.created_at);
    const matchesStart = !dateRange.start || reportDate >= new Date(dateRange.start);
    const matchesEnd = !dateRange.end || reportDate <= new Date(dateRange.end);
    return matchesStatus && matchesStart && matchesEnd;
  });

  const stats = {
    total: filteredReports.length,
    diproses: filteredReports.filter(r => r.status === 'diproses').length,
    selesai: filteredReports.filter(r => r.status === 'selesai').length,
    ditolak: filteredReports.filter(r => r.status === 'ditolak').length,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Rekap Laporan</h1>
          <p className="text-slate-500 font-medium">Analisis dan ringkasan data laporan bullying.</p>
        </div>
        <button className="bg-brand-red text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-800 transition-all shadow-lg shadow-red-200">
          <Download className="w-5 h-5" /> Unduh Laporan (PDF)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-red" /> Tanggal Mulai
          </label>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-red" /> Tanggal Selesai
          </label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-red" /> Status
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all font-bold text-slate-600"
          >
            <option value="all">Semua Status</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Laporan</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{stats.total}</h3>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Diproses</p>
          <h3 className="text-3xl font-extrabold text-amber-900">{stats.diproses}</h3>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Selesai</p>
          <h3 className="text-3xl font-extrabold text-emerald-900">{stats.selesai}</h3>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
          <p className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">Ditolak</p>
          <h3 className="text-3xl font-extrabold text-rose-900">{stats.ditolak}</h3>
        </div>
      </div>

      {/* Table Recap */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Daftar Laporan Terfilter</h3>
          <BarChart3 className="w-6 h-6 text-slate-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pelapor</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Korban</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-300" />
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                    Tidak ada data untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{formatDate(report.created_at)}</td>
                    <td className="px-8 py-5">
                      <div className="text-sm">
                        <p className="font-bold text-slate-900">{report.profiles?.full_name}</p>
                        <p className="text-slate-400 text-xs uppercase font-bold">{report.profiles?.role}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-900">{report.victim_name}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                        report.status === 'selesai' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        report.status === 'ditolak' ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
