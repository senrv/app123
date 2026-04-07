import React, { useEffect, useState } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  X,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'siswa' as UserRole,
    nis: '',
    kelas: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (user: Profile | null = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        email: '', // Email cannot be fetched easily without admin auth
        password: '',
        full_name: user.full_name,
        role: user.role,
        nis: user.nis || '',
        kelas: user.kelas || ''
      });
    } else {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'siswa',
        nis: '',
        kelas: ''
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingUser) {
        // Update profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
            nis: formData.role === 'siswa' ? formData.nis : null,
            kelas: formData.role === 'siswa' ? formData.kelas : null
          })
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Create new user (Requires supabaseAdmin / Service Role Key)
        if (!supabaseAdmin) {
          throw new Error('Service Role Key is required to create new users directly. Please add it to .env');
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: { full_name: formData.full_name }
        });

        if (authError) throw authError;

        // Profile is usually created via trigger in Supabase, but we can do it manually if no trigger
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.full_name,
            role: formData.role,
            nis: formData.role === 'siswa' ? formData.nis : null,
            kelas: formData.role === 'siswa' ? formData.kelas : null
          });

        if (profileError) throw profileError;
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini? Ini akan menghapus data secara permanen.')) return;

    try {
      if (!supabaseAdmin) {
        throw new Error('Service Role Key is required to delete users. Please add it to .env');
      }

      // Delete from Auth (Hard delete)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // Profile will be deleted automatically if cascade is set, but let's be sure
      await supabase.from('profiles').delete().eq('id', id);

      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Manajemen User</h1>
          <p className="text-slate-500 font-medium">Kelola akses admin, guru, dan siswa SMK Prima Unggul.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-red text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-800 transition-all shadow-lg shadow-red-200"
        >
          <UserPlus className="w-5 h-5" /> Tambah User
        </button>
      </div>

      {!supabaseAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4 items-start">
          <ShieldAlert className="w-6 h-6 text-brand-gold-dark flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Peringatan Konfigurasi</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              VITE_SUPABASE_SERVICE_ROLE_KEY tidak ditemukan. Anda hanya dapat melihat data. Fitur tambah dan hapus user memerlukan Service Role Key untuk sinkronisasi dengan Supabase Authentication.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">NIS / Kelas</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Dibuat Pada</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-400 font-medium">Memuat data user...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-red-50 group-hover:text-brand-red transition-all">
                          {user.full_name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        user.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                        user.role === 'guru' ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {user.role === 'siswa' ? (
                        <div className="text-sm">
                          <p className="font-bold text-slate-900">{user.nis || '-'}</p>
                          <p className="text-slate-400">{user.kelas || '-'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal User Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!editingUser && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                        placeholder="email@sekolah.sch.id"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                    placeholder="Nama Lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {formData.role === 'siswa' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">NIS</label>
                      <input
                        type="text"
                        required
                        value={formData.nis}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                        placeholder="Nomor Induk Siswa"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Kelas</label>
                      <input
                        type="text"
                        required
                        value={formData.kelas}
                        onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                        placeholder="Misal: X RPL 1"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-red text-white py-4 rounded-2xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
