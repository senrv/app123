import { Link } from 'react-router-dom';
import { Shield, Users, BookOpen, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-brand-red" />
            <span className="font-bold text-xl tracking-tight">SMK Prima Unggul</span>
          </div>
          <Link 
            to="/login" 
            className="bg-brand-red text-white px-6 py-2 rounded-full font-semibold hover:bg-red-800 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-brand-red uppercase bg-red-50 rounded-full">
              Anti-Bullying Campaign
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              Bersama Hentikan <br />
              <span className="text-brand-red">Tindakan Bullying</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              SMK Prima Unggul berkomitmen menciptakan lingkungan belajar yang aman, nyaman, dan bebas dari segala bentuk perundungan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-brand-red text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-800 transition-all shadow-lg shadow-red-200"
              >
                Laporkan Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#profil" 
                className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                Profil Sekolah
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-brand-red" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lingkungan Aman</h3>
            <p className="text-slate-600">Menciptakan ekosistem sekolah yang mendukung kesehatan mental dan fisik setiap siswa.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-brand-gold-dark" />
            </div>
            <h3 className="text-xl font-bold mb-3">Solidaritas Tinggi</h3>
            <p className="text-slate-600">Membangun rasa persaudaraan antar siswa dari berbagai jurusan dan latar belakang.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fokus Prestasi</h3>
            <p className="text-slate-600">Tanpa gangguan bullying, siswa dapat fokus mengembangkan potensi dan meraih prestasi terbaik.</p>
          </div>
        </div>
      </section>

      {/* School Profile */}
      <section id="profil" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Profil SMK Prima Unggul</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                SMK Prima Unggul adalah lembaga pendidikan kejuruan yang berfokus pada pengembangan teknologi dan kreativitas digital. Kami membekali siswa dengan keterampilan industri terkini untuk siap bersaing di era digital.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center font-bold text-brand-gold-dark">1</div>
                  <div>
                    <h4 className="font-bold text-lg">Teknik Komputer & Jaringan (TKJ)</h4>
                    <p className="text-slate-500">Mempelajari infrastruktur jaringan, server, dan keamanan siber.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center font-bold text-brand-gold-dark">2</div>
                  <div>
                    <h4 className="font-bold text-lg">Rekayasa Perangkat Lunak (RPL)</h4>
                    <p className="text-slate-500">Fokus pada pengembangan aplikasi web, mobile, dan sistem informasi.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center font-bold text-brand-gold-dark">3</div>
                  <div>
                    <h4 className="font-bold text-lg">Multimedia</h4>
                    <p className="text-slate-500">Mengembangkan bakat dalam desain grafis, animasi, dan produksi video.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523050853064-80357588702e?auto=format&fit=crop&q=80&w=1000" 
                  alt="School Building" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-brand-gold p-8 rounded-2xl text-white shadow-xl hidden md:block">
                <p className="text-4xl font-bold">100%</p>
                <p className="font-medium">Bebas Bullying</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-brand-gold" />
            <span className="font-bold text-xl">SMK Prima Unggul</span>
          </div>
          <p className="text-slate-400 mb-8">© 2026 SMK Prima Unggul. Semua Hak Dilindungi.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Website</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
