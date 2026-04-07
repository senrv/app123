import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Shield, 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  Send, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CreateReport() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    victim_name: '',
    incident_date: new Date().toISOString().split('T')[0],
    location: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: profile.id,
          victim_name: formData.victim_name,
          incident_date: formData.incident_date,
          location: formData.location,
          description: formData.description,
          status: 'diproses'
        });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => navigate('/app/history'), 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-slate-900">Laporan Terkirim!</h2>
        <p className="text-slate-500 max-w-md">
          Terima kasih telah berani melapor. Laporan Anda sedang diproses oleh pihak sekolah. Anda akan dialihkan ke riwayat laporan...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Buat Laporan Baru</h1>
        <p className="text-slate-500 font-medium">Isi formulir di bawah ini dengan informasi yang sejujur-jujurnya.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Victim Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-red" /> Nama Korban
            </label>
            <input
              type="text"
              required
              value={formData.victim_name}
              onChange={(e) => setFormData({ ...formData, victim_name: e.target.value })}
              placeholder="Siapa yang menjadi korban?"
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all shadow-sm"
            />
          </div>

          {/* Incident Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-red" /> Tanggal Kejadian
            </label>
            <input
              type="date"
              required
              value={formData.incident_date}
              onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all shadow-sm"
            />
          </div>

          {/* Location */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" /> Lokasi Kejadian
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Misal: Kantin, Lapangan Basket, Kelas X RPL 1"
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all shadow-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-red" /> Kronologi Kejadian
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ceritakan apa yang terjadi secara detail..."
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all shadow-sm min-h-[200px] leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-red text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-800 transition-all shadow-lg shadow-red-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Kirim Laporan <Send className="w-5 h-5" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
        </div>

        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
          <Shield className="w-6 h-6 text-brand-gold-dark flex-shrink-0" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-bold">Penting:</span> Laporan palsu dapat dikenakan sanksi tata tertib sekolah. Pastikan Anda memberikan informasi yang akurat untuk membantu proses penanganan.
          </p>
        </div>
      </form>
    </div>
  );
}
