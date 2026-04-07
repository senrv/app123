import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { Report, FollowUp, ReportStatus } from '../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Reports() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    fetchReports();
  }, [profile]);

  async function fetchReports() {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select('*, profiles(full_name, role, nis, kelas)')
        .order('created_at', { ascending: false });

      if (profile.role === 'siswa') {
        query = query.eq('reporter_id', profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFollowUps(reportId: string) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*, profiles(full_name, role)')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFollowUps(data || []);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  }

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    fetchFollowUps(report.id);
  };

  const handleUpdateStatus = async (status: ReportStatus) => {
    if (!selectedReport || !profile) return;
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', selectedReport.id);

      if (error) throw error;
      
      setSelectedReport({ ...selectedReport, status });
      setReports(reports.map(r => r.id === selectedReport.id ? { ...r, status } : r));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !profile || !newResponse.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          report_id: selectedReport.id,
          handler_id: profile.id,
          response: newResponse.trim()
        })
        .select('*, profiles(full_name, role)')
        .single();

      if (error) throw error;
      
      setFollowUps([...followUps, data]);
      setNewResponse('');
    } catch (error) {
      console.error('Error adding follow-up:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.victim_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'selesai': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'ditolak': return <XCircle className="w-4 h-4 text-rose-600" />;
      default: return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'selesai': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ditolak': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari laporan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
          {(['all', 'diproses', 'selesai', 'ditolak'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border",
                statusFilter === status 
                  ? "bg-brand-red text-white border-brand-red shadow-md shadow-red-100" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Reports List */}
        <div className={cn(
          "xl:col-span-5 space-y-4 overflow-y-auto pr-2 custom-scrollbar",
          selectedReport ? "hidden xl:block" : "block"
        )}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium">Memuat data laporan...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Tidak ada laporan ditemukan.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <motion.div
                key={report.id}
                layoutId={report.id}
                onClick={() => handleSelectReport(report)}
                className={cn(
                  "p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                  selectedReport?.id === report.id 
                    ? "bg-white border-brand-red shadow-lg shadow-red-100/50 ring-1 ring-brand-red" 
                    : "bg-white border-slate-200 hover:border-brand-red/50 hover:shadow-md"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5",
                    getStatusBadge(report.status)
                  )}>
                    {getStatusIcon(report.status)}
                    {report.status.toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-400">{formatDate(report.created_at)}</span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-brand-red transition-colors">
                  Korban: {report.victim_name}
                </h4>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                  {report.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {report.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {report.incident_date}
                  </div>
                </div>
                <ChevronRight className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-hover:text-brand-red transition-all",
                  selectedReport?.id === report.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                )} />
              </motion.div>
            ))
          )}
        </div>

        {/* Report Detail */}
        <div className={cn(
          "xl:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden",
          !selectedReport ? "hidden xl:flex items-center justify-center text-slate-400 p-10" : "flex"
        )}>
          <AnimatePresence mode="wait">
            {!selectedReport ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-slate-200" />
                </div>
                <p className="font-bold text-lg">Pilih laporan untuk melihat detail</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedReport.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                {/* Detail Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                  <div>
                    <button 
                      onClick={() => setSelectedReport(null)}
                      className="xl:hidden text-sm font-bold text-brand-red mb-4 flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Kembali
                    </button>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Detail Laporan</h3>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        Pelapor: {selectedReport.profiles?.full_name} ({selectedReport.profiles?.role})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedReport.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {(profile?.role === 'admin' || profile?.role === 'guru') && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus('selesai')}
                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
                        title="Tandai Selesai"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus('ditolak')}
                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all shadow-sm border border-rose-100"
                        title="Tolak Laporan"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Korban</p>
                      <p className="text-lg font-extrabold text-slate-900">{selectedReport.victim_name}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi Kejadian</p>
                      <p className="text-lg font-extrabold text-slate-900">{selectedReport.location}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal Kejadian</p>
                      <p className="text-lg font-extrabold text-slate-900">{selectedReport.incident_date}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status Saat Ini</p>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                        getStatusBadge(selectedReport.status)
                      )}>
                        {getStatusIcon(selectedReport.status)}
                        {selectedReport.status.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kronologi Kejadian</p>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {selectedReport.description}
                    </div>
                  </div>

                  {/* Follow-ups Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-brand-red" />
                      <h4 className="font-bold text-slate-900">Tindak Lanjut & Respon</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {followUps.length === 0 ? (
                        <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                          Belum ada tindak lanjut untuk laporan ini.
                        </p>
                      ) : (
                        followUps.map((fu) => (
                          <div key={fu.id} className={cn(
                            "p-5 rounded-2xl border",
                            fu.profiles?.role === 'siswa' ? "bg-slate-50 border-slate-100" : "bg-red-50/30 border-red-100"
                          )}>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-slate-100">
                                  {fu.profiles?.full_name.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-slate-900">{fu.profiles?.full_name}</span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white rounded-full border border-slate-100 text-slate-400">
                                  {fu.profiles?.role}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">{formatDate(fu.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{fu.response}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Follow-up Form (Guru/Admin/Siswa can respond) */}
                    <form onSubmit={handleAddFollowUp} className="mt-6">
                      <div className="relative">
                        <textarea
                          placeholder="Tulis respon atau tindak lanjut..."
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all min-h-[120px] text-sm"
                        />
                        <button
                          type="submit"
                          disabled={submitting || !newResponse.trim()}
                          className="absolute bottom-4 right-4 bg-brand-red text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-800 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Respon'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
