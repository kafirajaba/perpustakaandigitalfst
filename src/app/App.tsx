"use client"
import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Search, Home, Clock, User, LogOut,
  BookMarked, Upload, Check, ChevronDown, Star,
  Bell, Eye, Calendar, X, CheckCheck, AlertTriangle,
  Info, BookCheck, LayoutDashboard, Users, BarChart2,
  Plus, Pencil, Trash2, FileText, ArrowLeft, Package,
  TrendingUp, BookCopy, BookmarkPlus
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ── Notification system ───────────────────────────────────────────────────────

type NotifType = "success" | "info" | "warning";

type Notif = {
  id: number;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

type NotifBarProps = {
  notifs: Notif[];
  onMarkRead: (id: number) => void;
  onMarkAll: () => void;
  onClear: (id: number) => void;
};

const INITIAL_NOTIFS: Notif[] = [
  {
    id: 1, type: "warning", read: false,
    title: "Jatuh Tempo Mendekat",
    message: "Buku \"Algoritma dan Pemrograman\" harus dikembalikan dalam 3 hari (20 Juli 2026).",
    time: "2 jam lalu",
  },
  {
    id: 2, type: "info", read: false,
    title: "Pengingat Peminjaman",
    message: "Buku \"Kalkulus Multivariabel\" jatuh tempo pada 24 Juli 2026.",
    time: "1 hari lalu",
  },
  {
    id: 3, type: "success", read: true,
    title: "Akun Berhasil Masuk",
    message: "Selamat datang kembali, Muhammad Kafi Rajaba.",
    time: "2 hari lalu",
  },
];

const INITIAL_ADMIN_NOTIFS: Notif[] = [
  {
    id: 101, type: "warning", read: false,
    title: "Pengajuan Menunggu Persetujuan",
    message: "Terdapat 4 pengajuan peminjaman baru yang belum ditindaklanjuti hari ini.",
    time: "10 menit lalu",
  },
  {
    id: 102, type: "info", read: false,
    title: "Peminjaman Baru — Ahmad Fauzi",
    message: "Ahmad Fauzi (2021001) mengajukan peminjaman \"Algoritma dan Pemrograman\".",
    time: "15 menit lalu",
  },
  {
    id: 103, type: "info", read: false,
    title: "Peminjaman Baru — Budi Santoso",
    message: "Budi Santoso (2022018) mengajukan peminjaman \"Machine Learning Dasar\".",
    time: "32 menit lalu",
  },
  {
    id: 104, type: "success", read: false,
    title: "Buku Dikembalikan",
    message: "Fitri Handayani (2022031) telah mengembalikan buku \"Jaringan Komputer\" tepat waktu.",
    time: "1 jam lalu",
  },
  {
    id: 105, type: "success", read: true,
    title: "Buku Dikembalikan",
    message: "Eko Prasetyo (2020099) telah mengembalikan buku \"Sistem Operasi Modern\".",
    time: "3 jam lalu",
  },
  {
    id: 106, type: "warning", read: true,
    title: "Stok Buku Menipis",
    message: "Buku \"Sistem Operasi Modern\" stok tersisa 2 eksemplar. Pertimbangkan penambahan koleksi.",
    time: "1 hari lalu",
  },
  {
    id: 107, type: "info", read: true,
    title: "Mahasiswa Baru Terdaftar",
    message: "Olivia Santoso (2023061) telah mendaftar sebagai anggota perpustakaan.",
    time: "2 hari lalu",
  },
  {
    id: 108, type: "success", read: true,
    title: "Laporan Bulanan Tersedia",
    message: "Laporan peminjaman bulan Juni 2026 telah siap diunduh di halaman Laporan.",
    time: "3 hari lalu",
  },
];

type ProcurementRequest = { 
  id: number; 
  dosenName: string; 
  type: "Buku" | "Jurnal"; 
  title: string; 
  author: string;
  publisher: string; // Tambahkan ini
  year: number;      // Tambahkan ini
  reason: string;    // Tambahkan ini
  status: "menunggu" | "disetujui" | "ditolak"; 
  requestDate: string; 
};



type Page = "landing" | "login" | "register" | "home" | "search" | "borrow" | "pengadaan" | "history" | "profile" | "edit-profile";
type AdminPage = "admin-home" | "admin-books" | "admin-loans" | "admin-students" | "admin-reports" | "admin-pengadaan";
type UserRole = "mahasiswa" | "admin" | "dosen";

type UserProfile = {
  nama: string;
  nim: string;
  email: string;
  prodi: string;
  telepon: string;
  photoUrl?: string;
};

const PRODI_LIST = [
  "Teknik Informatika",
  "Teknik Pertambangan",
  "Sistem Informasi",
  "Kimia",
  "Fisika",
  "Biologi",
  "Matematika",
  "Agribisnis",
];

const COVER_GRADIENTS = [
  "from-teal-500 to-cyan-700",
  "from-blue-500 to-indigo-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-700",
  "from-fuchsia-500 to-violet-700",
];

type Book = {
  id: number;
  title: string;
  author: string;
  year: number;
  category: string;
  status: "Tersedia" | "Dipinjam";
  cover: number;
  isbn: string;
  stok: number;
  sinopsis: string;
  coverUrl?: string;
};

const INITIAL_BOOKS: Book[] = [
  { id: 1, title: "Algoritma dan Pemrograman", author: "Dr. Rinaldi Munir", year: 2023, category: "Teknologi", status: "Tersedia", cover: 0, isbn: "978-602-1234-56-7", stok: 5, sinopsis: "Membahas algoritma dan struktur data secara mendalam mulai dari konsep dasar hingga implementasi dalam pemrograman modern." },
  { id: 2, title: "Kalkulus Multivariabel", author: "Prof. Purcell & Varberg", year: 2022, category: "Sains", status: "Tersedia", cover: 1, isbn: "978-602-9876-54-3", stok: 3, sinopsis: "Buku referensi kalkulus yang mencakup turunan, integral, dan aplikasinya dalam berbagai bidang ilmu." },
  { id: 3, title: "Sistem Operasi Modern", author: "Andrew S. Tanenbaum", year: 2024, category: "Teknologi", status: "Dipinjam", cover: 2, isbn: "978-602-2345-67-8", stok: 2, sinopsis: "Pengantar komprehensif tentang sistem operasi modern, termasuk proses, memori, dan keamanan sistem." },
  { id: 4, title: "Pengantar Basis Data", author: "Dr. Sri Kusumadewi", year: 2023, category: "Teknologi", status: "Tersedia", cover: 3, isbn: "978-602-3456-78-9", stok: 4, sinopsis: "Konsep dasar basis data relasional, SQL, normalisasi, dan desain sistem manajemen basis data." },
  { id: 5, title: "Fisika Dasar Jilid II", author: "Dr. Young & Freedman", year: 2022, category: "Sains", status: "Tersedia", cover: 4, isbn: "978-602-4567-89-0", stok: 6, sinopsis: "Membahas mekanika fluida, termodinamika, gelombang, dan optik untuk mahasiswa sains dan teknik." },
  { id: 6, title: "Sejarah Peradaban Islam", author: "Prof. Dr. Samsul Munir", year: 2021, category: "Sejarah", status: "Tersedia", cover: 5, isbn: "978-602-5678-90-1", stok: 3, sinopsis: "Perjalanan panjang peradaban Islam dari masa awal hingga era modern dengan analisis mendalam." },
  { id: 7, title: "Machine Learning Dasar", author: "Dr. Imam Muslem", year: 2024, category: "Teknologi", status: "Tersedia", cover: 6, isbn: "978-602-6789-01-2", stok: 4, sinopsis: "Pengantar machine learning meliputi supervised, unsupervised learning, dan deep learning." },
  { id: 8, title: "Jaringan Komputer", author: "Prof. Forouzan", year: 2023, category: "Teknologi", status: "Dipinjam", cover: 7, isbn: "978-602-7890-12-3", stok: 2, sinopsis: "Model OSI, TCP/IP, routing, dan keamanan jaringan komputer dari dasar hingga tingkat lanjut." },
  { id: 9, title: "Biologi Molekuler", author: "Dr. Lewin", year: 2022, category: "Biologi", status: "Tersedia", cover: 0, isbn: "978-602-8901-23-4", stok: 3, sinopsis: "Dasar-dasar biologi molekuler termasuk DNA, RNA, sintesis protein, dan rekayasa genetika." },
  { id: 10, title: "Kimia Organik", author: "Prof. Clayden", year: 2023, category: "Kimia", status: "Tersedia", cover: 1, isbn: "978-602-9012-34-5", stok: 4, sinopsis: "Kimia organik dari struktur molekul, reaksi, hingga sintesis senyawa kompleks." },
];

// Reference — replaced by App state; keep for type inference only
const BOOKS = INITIAL_BOOKS;

const NAV = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "search", label: "Cari Buku", icon: Search },
  { id: "borrow", label: "Pinjam Buku", icon: BookMarked },
  { id: "history", label: "Riwayat", icon: Clock },
  { id: "profile", label: "Profil", icon: User },
];

// ── DatePicker ────────────────────────────────────────────────────────────────

const ID_MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const ID_DAYS   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

function DatePicker({ value, onChange, min, max, placeholder = "Pilih tanggal" }: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  const today = new Date();
  const initYear  = value ? +value.slice(0, 4) : today.getFullYear();
  const initMonth = value ? +value.slice(5, 7) - 1 : today.getMonth();
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(initYear);
  const [vm, setVm] = useState(initMonth);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // sync view when value changes externally
  useEffect(() => {
    if (value) { setVy(+value.slice(0, 4)); setVm(+value.slice(5, 7) - 1); }
  }, [value]);

  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const firstDay    = new Date(vy, vm, 1).getDay();
  const minD = min ? new Date(min + "T00:00:00") : null;
  const maxD = max ? new Date(max + "T00:00:00") : null;

  const isDisabled = (d: number) => {
    const dt = new Date(vy, vm, d);
    if (minD && dt < minD) return true;
    if (maxD && dt > maxD) return true;
    return false;
  };
  const isSelected = (d: number) => {
    if (!value) return false;
    return +value.slice(0, 4) === vy && +value.slice(5, 7) - 1 === vm && +value.slice(8, 10) === d;
  };
  const isToday = (d: number) => today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === d;

  const select = (d: number) => {
    if (isDisabled(d)) return;
    onChange(`${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setOpen(false);
  };
  const prev = () => vm === 0 ? (setVm(11), setVy(y => y - 1)) : setVm(m => m - 1);
  const next = () => vm === 11 ? (setVm(0), setVy(y => y + 1)) : setVm(m => m + 1);

  const display = value
    ? new Date(value + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-white hover:border-[#1B5E8C] focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 transition-all"
      >
        <span className={display ? "text-slate-700 font-semibold" : "text-slate-400"}>{display || placeholder}</span>
        <Calendar size={15} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-slate-100 w-72 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0D2137]">
            <button type="button" onClick={prev} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors text-lg font-bold">‹</button>
            <span className="text-white text-sm font-bold">{ID_MONTHS[vm]} {vy}</span>
            <button type="button" onClick={next} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors text-lg font-bold">›</button>
          </div>
          {/* Day labels */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {ID_DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const dis = isDisabled(d);
              const sel = isSelected(d);
              const tod = isToday(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={dis}
                  onClick={() => select(d)}
                  className={`h-8 w-full rounded-lg text-xs font-medium transition-all
                    ${sel ? "bg-[#1B5E8C] text-white shadow-sm" : ""}
                    ${!sel && tod ? "bg-blue-50 text-[#1B5E8C] font-bold ring-1 ring-[#1B5E8C]/30" : ""}
                    ${!sel && !tod && !dis ? "text-slate-700 hover:bg-slate-100" : ""}
                    ${dis ? "text-slate-200 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Components ──────────────────────────────────────────────────────────

function BookCover({ gradient, size = "md" }: { gradient: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-14 h-20" : size === "lg" ? "w-full h-72" : "w-full h-48";
  return (
    <div className={`${dims} bg-gradient-to-br ${gradient} flex items-center justify-center rounded-lg`}>
      <BookOpen className="text-white/30" size={size === "lg" ? 56 : size === "sm" ? 20 : 32} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const ok = status === "Tersedia";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
      {status}
    </span>
  );
}

function BookCard({ book, onDetail }: { book: typeof BOOKS[0]; onDetail: (id: number) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group" onClick={() => onDetail(book.id)}>
      <div className={`bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} h-44 relative flex items-end p-3`}>
        <BookOpen size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {book.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#1B5E8C] transition-colors">{book.title}</h3>
        <p className="text-slate-500 text-xs mb-3 truncate">{book.author} · {book.year}</p>
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={book.status} />
        </div>
        <button className="w-full text-xs font-semibold py-2.5 rounded-xl bg-[#1B5E8C] text-white hover:bg-[#154d75] transition-colors">
          Lihat Detail
        </button>
      </div>
    </div>
  );
}

function downloadBookPDF(title: string, author: string, category: string, year: number) {
  const safe = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const stream = [
    "BT",
    "/F1 9 Tf",
    "50 800 Td",
    "(PERPUSTAKAAN DIGITAL FST UIN JAKARTA) Tj",
    "0 -14 Td",
    "(Fakultas Sains dan Teknologi) Tj",
    "0 -30 Td",
    "/F1 22 Tf",
    `(${safe(title)}) Tj`,
    "0 -28 Td",
    "/F1 13 Tf",
    `(Penulis : ${safe(author)}) Tj`,
    "0 -20 Td",
    `(Kategori: ${safe(category)}) Tj`,
    "0 -20 Td",
    `(Tahun   : ${year}) Tj`,
    "0 -50 Td",
    "/F1 11 Tf",
    "(Dokumen ini merupakan e-book digital milik Perpustakaan Digital FST UIN Jakarta.) Tj",
    "0 -18 Td",
    "(Hanya untuk keperluan akademis. Dilarang disebarluaskan tanpa izin.) Tj",
    "0 -40 Td",
    "/F1 10 Tf",
    "(Diunduh melalui sistem perpustakaan digital pada: " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) + ") Tj",
    "ET",
  ].join("\n");

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842]\n/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
  const obj4 = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  let pdf = "%PDF-1.4\n";
  const offs: number[] = [];
  offs.push(pdf.length); pdf += obj1 + "\n";
  offs.push(pdf.length); pdf += obj2 + "\n";
  offs.push(pdf.length); pdf += obj3 + "\n";
  offs.push(pdf.length); pdf += obj4 + "\n";
  offs.push(pdf.length); pdf += obj5 + "\n";

  const xref = pdf.length;
  pdf += "xref\n0 6\n";
  pdf += "0000000000 65535 f \n";
  offs.forEach(o => { pdf += `${String(o).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function BookDetailModal({ bookId, onClose, onBorrow }: {
  bookId: number;
  onClose: () => void;
  onBorrow: (book: typeof BOOKS[0]) => void;
}) {
  const book = BOOKS.find(b => b.id === bookId);
  const [downloading, setDownloading] = useState(false);

  if (!book) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      downloadBookPDF(book.title, book.author, book.category, book.year);
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header cover */}
        <div className={`bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} h-44 flex items-end p-5 relative`}>
          <BookOpen size={72} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/15" />
          <div className="flex items-end justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                {book.category}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                {book.year}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-extrabold text-slate-800 mb-1">{book.title}</h2>
          <p className="text-slate-500 text-sm mb-3">{book.author} · {book.year}</p>
          <StatusBadge status={book.status} />

          <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
            {[
              { label: "ISBN", value: book.isbn },
              { label: "Penulis", value: book.author },
              { label: "Tahun Terbit", value: String(book.year) },
              { label: "Kategori", value: book.category },
              { label: "Status", value: book.status },
              { label: "Bahasa", value: "Indonesia" },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-sm text-slate-700 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sinopsis</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Buku ini membahas {book.category.toLowerCase()} secara mendalam, mulai dari konsep dasar hingga implementasi yang komprehensif. Dilengkapi contoh dan latihan untuk memperdalam pemahaman mahasiswa.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onBorrow(book)}
              disabled={book.status !== "Tersedia"}
              className={`flex-1 font-bold py-3 rounded-xl transition-colors text-sm ${
                book.status === "Tersedia"
                  ? "bg-[#1B5E8C] text-white hover:bg-[#154d75] shadow-md shadow-blue-900/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {book.status === "Tersedia" ? "Pinjam Buku" : "Sedang Dipinjam"}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 border-2 border-[#1B5E8C] text-[#1B5E8C] font-bold py-3 rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1B5E8C] border-t-transparent rounded-full animate-spin" />
                  Mengunduh...
                </>
              ) : (
                <><Eye size={15} /> Baca Online (PDF)</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ 
  page, 
  setPage, 
  onLogout, 
  userRole,
  userName,
  userSub
}: { 
  page: Page; 
  setPage: (p: Page) => void; 
  onLogout: () => void; 
  userRole: UserRole | null;
  userName?: string;
  userSub?: string;
}) {

  // Menyusun menu dinamis agar "Pengadaan" masuk sebelum "Riwayat"
  const renderNav = () => {
    const menus = [];
    for (const item of NAV) {
      // Jika role dosen dan item saat ini adalah "history" (Riwayat),
      // kita sisipkan menu "Pengadaan" tepat sebelum "Riwayat"
      if (item.id === "history" && userRole === "dosen") {
        menus.push({ id: "pengadaan", label: "Pengadaan Literatur", icon: BookmarkPlus });
      }
      menus.push(item);
    }

    return menus.map(item => {
      const active = page === item.id;
      return (
        <button
          key={item.id}
          onClick={() => setPage(item.id as Page)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active
              ? "bg-[#1B5E8C] text-white shadow-md shadow-blue-900/30" // Warna biru untuk state aktif
              : "text-blue-200/70 hover:bg-white/8 hover:text-white"
          }`}
        >
          <item.icon size={16} />
          {item.label}
        </button>
      );
    });
  };

  return (
    <aside className="w-64 bg-[#0D2137] min-h-screen flex flex-col shrink-0 border-r border-white/5">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/Logo Uin Jakarta Png.jpg" alt="Logo UIN Jakarta" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Perpustakaan Digital</p>
            <p className="text-blue-400 text-xs">FST UIN Jakarta</p>
          </div>
        </div>
      </div>
      
      {/* Panggil fungsi renderNav untuk nampilin menu */}
      <nav className="flex-1 p-4 space-y-0.5">
        {renderNav()}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Kembalikan warna profile jadi biru biar seragam */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#1B5E8C]">
              <User size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{userName}</p>
              <p className="text-blue-400 text-[10px] truncate">{userSub}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all"
        >
          <LogOut size={15} />
          Keluar
        </button>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, notifs, onMarkRead, onMarkAll, onClear, userName, userSub, userGradient }: {
  title: string;
  subtitle?: string;
  notifs: Notif[];
  onMarkRead: (id: number) => void;
  onMarkAll: () => void;
  onClear: (id: number) => void;
  userName?: string;
  userSub?: string;
  userGradient?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const iconMap: Record<NotifType, React.ReactNode> = {
    success: <BookCheck size={14} className="text-emerald-600" />,
    info: <Info size={14} className="text-[#1B5E8C]" />,
    warning: <AlertTriangle size={14} className="text-amber-500" />,
  };
  const bgMap: Record<NotifType, string> = {
    success: "bg-emerald-50",
    info: "bg-blue-50",
    warning: "bg-amber-50",
  };

  return (
    <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle ?? "Perpustakaan Digital FST UIN Jakarta"}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Bell with dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors relative"
          >
            <Bell size={15} className="text-slate-500" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#E8871A] rounded-full flex items-center justify-center text-white text-[9px] font-bold px-1">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-30">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-slate-500" />
                  <span className="text-sm font-extrabold text-slate-800">Notifikasi</span>
                  {unread > 0 && (
                    <span className="bg-[#E8871A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unread} baru</span>
                  )}
                </div>
                <button
                  onClick={onMarkAll}
                  className="text-xs text-[#1B5E8C] font-semibold hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Tandai semua dibaca
                </button>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <Bell size={28} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-semibold">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={`flex gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group ${!n.read ? "bg-blue-50/40" : ""}`}
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${bgMap[n.type]}`}>
                        {iconMap[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold leading-tight ${n.read ? "text-slate-600" : "text-slate-800"}`}>{n.title}</p>
                          <button
                            onClick={e => { e.stopPropagation(); onClear(n.id); }}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition-all shrink-0 mt-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">{n.time}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-[#1B5E8C] rounded-full shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>

              {notifs.length > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                  <button
                    onClick={() => notifs.forEach(n => onClear(n.id))}
                    className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Hapus semua notifikasi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 bg-gradient-to-br ${userGradient ?? "from-[#1B5E8C] to-[#0D2137]"} rounded-full flex items-center justify-center`}>
            <User size={15} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{userName ?? "Muhammad Kafi"}</p>
            <p className="text-xs text-slate-400">{userSub ?? "Teknik Informatika"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Public Pages ──────────────────────────────────────────────────────────────

function LandingPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-[#F0F4F8] font-[\'Plus_Jakarta_Sans\',sans-serif]">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-12 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 flex items-center justify-center">
            <img src="/Logo Uin Jakarta Png.jpg" alt="Logo UIN Jakarta" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-[#0D2137] text-base leading-tight">Perpustakaan Digital</h1>
            <p className="text-slate-500 text-xs">Fakultas Sains dan Teknologi UIN Jakarta</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage("login")}
            className="px-5 py-2.5 text-sm font-semibold text-[#1B5E8C] border-2 border-[#1B5E8C] rounded-xl hover:bg-[#1B5E8C] hover:text-white transition-all"
          >
            Masuk
          </button>
          <button
            onClick={() => setPage("register")}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B5E8C] rounded-xl hover:bg-[#154d75] transition-all shadow-md shadow-blue-900/20"
          >
            Daftar
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#0D2137] via-[#163755] to-[#1B5E8C] text-white py-24 px-12 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <BookOpen size={400} className="absolute -right-16 -top-8 text-white" />
        </div>
        <div className="relative max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Star size={11} fill="currentColor" /> Perpustakaan Digital Terbaik FST
          </div>
          <h2 className="text-5xl font-extrabold leading-tight mb-4">
            Akses Ribuan Buku<br /><span className="text-[#E8871A]">Kapan Saja</span>
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Layanan perpustakaan digital terintegrasi untuk mahasiswa FST UIN Jakarta. Temukan, pinjam, dan baca buku dari mana saja.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setPage("login")}
              className="px-7 py-3.5 bg-[#E8871A] text-white font-bold rounded-xl hover:bg-[#d17516] transition-all shadow-xl shadow-orange-900/30 text-sm"
            >
              Pinjam Sekarang →
            </button>
            <button
              onClick={() => setPage("register")}
              className="px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-sm border border-white/20"
            >
              Daftar Gratis
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 px-12 border-b border-slate-100">
        <div className="flex justify-center gap-16">
          {[
            { value: "12.500+", label: "Judul Buku" },
            { value: "8.200+", label: "Mahasiswa Aktif" },
            { value: "3.400+", label: "Peminjaman/Bulan" },
            { value: "24/7", label: "Akses Online" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-[#0D2137]">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-12 bg-[#F0F4F8]">
        <h3 className="text-2xl font-extrabold text-[#0D2137] mb-2 text-center">Layanan Kami</h3>
        <p className="text-slate-500 text-sm text-center mb-10">Semua yang Anda butuhkan dalam satu platform</p>
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Search, title: "Pencarian Cerdas", desc: "Temukan buku berdasarkan judul, penulis, kategori, atau tahun terbit dengan cepat dan tepat.", color: "bg-blue-50 text-[#1B5E8C]" },
            { icon: BookMarked, title: "Peminjaman Online", desc: "Pinjam buku fisik maupun digital langsung dari aplikasi tanpa perlu datang ke perpustakaan.", color: "bg-emerald-50 text-emerald-600" },
            { icon: Clock, title: "Riwayat Lengkap", desc: "Pantau semua aktivitas peminjaman, tenggat waktu, dan perpanjang peminjaman secara online.", color: "bg-amber-50 text-amber-600" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon size={22} />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">{f.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1B5E8C] to-[#0D2137] py-14 px-12 text-center text-white">
        <h3 className="text-2xl font-extrabold mb-3">Mulai Gunakan Sekarang</h3>
        <p className="text-blue-200 text-sm mb-7">Daftar gratis dan nikmati akses ke ribuan buku digital FST UIN Jakarta</p>
        <button
          onClick={() => setPage("register")}
          className="px-8 py-3.5 bg-[#E8871A] text-white font-bold rounded-xl hover:bg-[#d17516] transition-all shadow-lg text-sm"
        >
          Daftar Sekarang — Gratis!
        </button>
      </section>
    </div>
  );
}

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2137] via-[#163755] to-[#1B5E8C] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#0D2137] to-[#1B5E8C] p-7 text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src="/Logo Uin Jakarta Png.jpg" alt="Logo UIN Jakarta" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h2 className="text-white text-xl font-extrabold">{title}</h2>
          <p className="text-blue-300 text-sm mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginPage({ setPage, onLogin }: { setPage: (p: Page) => void; onLogin: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>("mahasiswa");
  const [remember, setRemember] = useState(false);
  
  return (
    <AuthCard title="Selamat Datang" subtitle="Masuk ke akun Anda">
      {/* 3 Tab Login */}
      <div className="flex border-b border-slate-100">
        {(["mahasiswa", "dosen", "admin"] as const).map(r => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`flex-1 py-3.5 text-sm font-bold capitalize transition-colors ${
              role === r 
                ? "text-[#1B5E8C] border-b-2 border-[#1B5E8C] bg-blue-50/50" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <form className="p-7 space-y-4" onSubmit={e => { e.preventDefault(); onLogin(role); }}>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
          <input
            type="email"
            placeholder="Masukkan Email Anda"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] placeholder-slate-300 bg-slate-50 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] placeholder-slate-300 bg-slate-50 transition-all"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                remember ? "bg-[#1B5E8C] border-[#1B5E8C]" : "border-slate-300 hover:border-[#1B5E8C]"
              }`}
            >
              {remember && <Check size={11} className="text-white" strokeWidth={3} />}
            </button>
            <span className="text-sm text-slate-600">Ingat saya</span>
          </label>
          <button type="button" className="text-xs text-[#1B5E8C] font-semibold hover:underline">
            Lupa password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-[#1B5E8C] text-white font-bold py-3.5 rounded-xl hover:bg-[#154d75] active:scale-[0.98] transition-all text-sm shadow-lg shadow-blue-900/20 mt-1"
        >
          Masuk
        </button>
        <p className="text-center text-sm text-slate-500 pt-1">
          Belum punya akun?{" "}
          <button type="button" onClick={() => setPage("register")} className="text-[#1B5E8C] font-bold hover:underline">
            Daftar di sini
          </button>
        </p>
      </form>
    </AuthCard>
  );
}

function RegisterPage({ setPage, onRegister }: {
  setPage: (p: Page) => void;
  onRegister: (s: { name: string; nim: string; prodi: string; email: string }) => void;
}) {
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nim.trim() || !prodi || !email.trim()) return;
    onRegister({ name: name.trim(), nim: nim.trim(), prodi, email: email.trim() });
    setPage("login");
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] placeholder-slate-300 bg-slate-50 transition-all";

  return (
    <AuthCard title="Buat Akun Baru" subtitle="Daftarkan diri Anda">
      <form className="p-7 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
          <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Nama sesuai KTP" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">NIM</label>
          <input value={nim} onChange={e => setNim(e.target.value)} type="text" placeholder="Nomor Induk Mahasiswa" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Program Studi</label>
          <div className="relative">
            <select value={prodi} onChange={e => setProdi(e.target.value)} className={inputCls + " appearance-none pr-10 cursor-pointer"}>
              <option value="">— Pilih Program Studi —</option>
              {PRODI_LIST.map(p => <option key={p}>{p}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="nama@mhs.uinjkt.ac.id" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Min. 8 karakter" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Konfirmasi Password</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Ulangi password" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Kode OTP</label>
          <div className="flex gap-2">
            <input value={otp} onChange={e => setOtp(e.target.value)} type="text" placeholder="6 digit kode"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] placeholder-slate-300 bg-slate-50 transition-all" />
            <button type="button" className="shrink-0 bg-[#E8871A] text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-[#d17516] transition-colors shadow-md shadow-orange-900/20">
              Kirim
            </button>
          </div>
        </div>
        <button type="submit"
          className="w-full bg-[#1B5E8C] text-white font-bold py-3.5 rounded-xl hover:bg-[#154d75] active:scale-[0.98] transition-all text-sm shadow-lg shadow-blue-900/20 mt-1">
          Daftar Sekarang
        </button>
        <p className="text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <button type="button" onClick={() => setPage("login")} className="text-[#1B5E8C] font-bold hover:underline">
            Masuk di sini
          </button>
        </p>
      </form>
    </AuthCard>
  );
}

// ── Dashboard Pages ───────────────────────────────────────────────────────────

function HomePage({ 
  setPage, 
  nb, 
  onBorrowBook, 
  loans, 
  done, 
  books, 
  userRole, 
  userName 
}: {
  setPage: (p: Page) => void;
  nb: NotifBarProps;
  onBorrowBook: (book: Book) => void;
  loans: ActiveLoan[];
  done: DoneLoan[];
  books: Book[];
  userRole: UserRole;
  userName: string;
}) {
  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <TopBar title="Beranda" {...nb} userName={userName} />
      
      <div className="p-8">
        {/* --- SECTION WELCOME (Dinamis berdasarkan Role) --- */}
        <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] rounded-2xl p-7 mb-8 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <BookOpen size={160} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/8" />
          
          <div className="relative">
            <p className="text-blue-300 text-sm font-medium mb-1">Selamat datang kembali 👋</p>
            <h2 className="text-2xl font-extrabold mb-1">{userName}</h2>
            
            {userRole === "mahasiswa" ? (
              <p className="text-blue-100 text-sm mb-5">
                Anda memiliki <span className="font-bold text-white bg-white/15 px-2 py-0.5 rounded-md">{loans.length} buku</span> yang sedang dipinjam
              </p>
            ) : (
              <p className="text-blue-100 text-sm mb-5">
                Portal Dosen: Selamat Menikmati Layanan Perpustakaan Kami
              </p>
            )}

            <div className="flex gap-3">
              {userRole === "mahasiswa" ? (
                <>
                  <button onClick={() => setPage("borrow")}
                    className="bg-[#E8871A] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#d17516] transition-colors shadow-lg shadow-orange-900/30">
                    Pinjam Buku →
                  </button>
                  <button onClick={() => setPage("history")}
                    className="bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/15">
                    Riwayat Saya
                  </button>
                </>
              ) : (
                <button onClick={() => setPage("pengadaan")}
                  className="bg-[#E8871A] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#d17516] transition-colors shadow-lg shadow-orange-900/30 flex items-center gap-2">
                  <BookmarkPlus size={16} /> Ajukan Pengadaan Buku/Jurnal →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- STATISTIK --- */}
        {userRole === "mahasiswa" && (
            <div className="grid grid-cols-3 gap-4 mb-8">
            {(() => {
                const nearest = nearestDueDays(loans);
                const dueLine = nearest === null ? "–" : nearest <= 0 ? "Hari ini!" : `${nearest} hari`;
                const dueBg = nearest !== null && nearest <= 3 ? "bg-red-50" : "bg-amber-50";
                const dueColor = nearest !== null && nearest <= 3 ? "text-red-600" : "text-amber-600";
                return [
                { label: "Buku Dipinjam", value: String(loans.length), color: "text-[#1B5E8C]", bg: "bg-blue-50", icon: BookMarked },
                { label: "Jatuh Tempo Terdekat", value: dueLine, color: dueColor, bg: dueBg, icon: Calendar },
                { label: "Total Peminjaman", value: String(loans.length + done.length), color: "text-emerald-600", bg: "bg-emerald-50", icon: Clock },
                ];
            })().map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <s.icon size={20} className={s.color} />
                </div>
                <div>
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-slate-500 text-xs font-medium">{s.label}</p>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* --- BUKU POPULER --- */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-slate-800">Buku Populer</h3>
          <button onClick={() => setPage("search")} className="text-sm text-[#1B5E8C] font-semibold hover:underline flex items-center gap-1">
            Lihat Semua <span>→</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {books.slice(0, 8).map(book => (
            <BookCard key={book.id} book={book} onDetail={setDetailId} />
          ))}
        </div>
      </div>

      {detailId !== null && (
        <BookDetailModal
          bookId={detailId}
          onClose={() => setDetailId(null)}
          onBorrow={(book) => { setDetailId(null); onBorrowBook(book); }}
        />
      )}
    </div>
  );
}

function SearchPage({ setPage, nb, onBorrowBook, books }: { setPage: (p: Page) => void; nb: NotifBarProps; onBorrowBook: (book: Book) => void; books: Book[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [year, setYear] = useState("Semua");
  const [detailId, setDetailId] = useState<number | null>(null);

  const categories = ["Semua", "Fiksi", "Non-Fiksi", "Sains", "Teknologi", "Sejarah"];
  const years = ["Semua", "2026", "2025", "2024", "2023", "2022", "2021"];

  const filtered = books.filter(b => {
    const qMatch = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase());
    const cMatch = cat === "Semua" || b.category === cat;
    const yMatch = year === "Semua" || String(b.year) === year;
    return qMatch && cMatch && yMatch;
  });

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Cari Buku" {...nb} />
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="relative mb-5">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Cari judul, penulis, atau kata kunci..."
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-slate-50 transition-all placeholder-slate-400" />
          </div>
          <div className="flex gap-8 flex-wrap">
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-widest">Kategori</p>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      cat === c ? "bg-[#1B5E8C] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-widest">Tahun Terbit</p>
              <div className="flex gap-1.5 flex-wrap">
                {years.map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      year === y ? "bg-[#1B5E8C] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-500">
            <span className="text-slate-800">{filtered.length}</span> buku ditemukan
          </p>
        </div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-4 gap-5">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} onDetail={setDetailId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Buku tidak ditemukan</p>
            <p className="text-sm mt-1">Coba kata kunci atau filter yang berbeda</p>
          </div>
        )}
      </div>

      {detailId !== null && (
        <BookDetailModal
          bookId={detailId}
          onClose={() => setDetailId(null)}
          onBorrow={(book) => { setDetailId(null); onBorrowBook(book); }}
        />
      )}
    </div>
  );
}


function BorrowPage({ setPage, nb, addNotif, preset, onClearPreset, addLoanRequest, books, studentNim, studentName, studentProdi }: {
  setPage: (p: Page) => void;
  nb: NotifBarProps;
  addNotif: (n: Omit<Notif, "id" | "read">) => void;
  preset?: { category: string; title: string } | null;
  onClearPreset?: () => void;
  addLoanRequest: (req: LoanRequest) => void;
  books: Book[];
  studentNim: string;
  studentName: string;
  studentProdi: string;
}) {
  const [category, setCategory] = useState(preset?.category ?? "");
  const [bookTitle, setBookTitle] = useState(preset?.title ?? "");
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  useEffect(() => {
    if (preset) {
      setCategory(preset.category);
      setBookTitle(preset.title);
      onClearPreset?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBook = books.find(b => b.title === bookTitle);
  const availableBooks = books.filter(b => !category || b.category === category);

  const labelClass = "block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest";
  const selectClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-white appearance-none cursor-pointer pr-10 transition-all";

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Pinjam Buku" {...nb} />
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Form header */}
            <div className="bg-[#1B5E8C] px-7 py-4 flex items-center gap-3">
              <BookMarked size={18} className="text-white/80" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Halaman: Peminjaman Buku</h2>
            </div>

            <div className="p-7 space-y-6">

              {/* Step 1 — Kategori */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#1B5E8C] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <label className={labelClass + " mb-0"}>Pilih Kategori Buku</label>
                </div>
                <div className="relative">
                  <select value={category} onChange={e => { setCategory(e.target.value); setBookTitle(""); }}
                    className={selectClass}>
                    <option value="">Pilih Kategori</option>
                    {["Teknologi", "Sains", "Fiksi", "Non-Fiksi", "Sejarah"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 2 — Judul */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#1B5E8C] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <label className={labelClass + " mb-0"}>Pilih Judul Buku</label>
                </div>
                <div className="relative">
                  <select value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                    className={selectClass}>
                    <option value="">Pilih Judul</option>
                    {availableBooks.map(b => (
                      <option key={b.id} value={b.title} disabled={b.status === "Dipinjam"}>
                        {b.title}{b.status === "Dipinjam" ? " (Dipinjam)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 3 — Penulis */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#1B5E8C] text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <label className={labelClass + " mb-0"}>Penulis</label>
                </div>
                <div className={`w-full rounded-xl px-4 py-3 text-sm min-h-[46px] border transition-all ${
                  selectedBook
                    ? "bg-slate-50 border-slate-200 text-slate-700 font-semibold"
                    : "bg-slate-50 border-slate-100 text-slate-400 italic"
                }`}>
                  {selectedBook ? selectedBook.author : "(Pilih buku terlebih dahulu)"}
                </div>
              </div>

              {/* Book info card — only shown when book is selected */}
              {selectedBook && (
                <div className="rounded-xl border border-[#1B5E8C]/20 overflow-hidden">
                  <div className="bg-[#1B5E8C]/8 px-4 py-2.5 border-b border-[#1B5E8C]/15 flex items-center gap-2">
                    <BookOpen size={14} className="text-[#1B5E8C]" />
                    <span className="text-xs font-bold text-[#1B5E8C] uppercase tracking-widest">Informasi Buku yang Dipilih</span>
                  </div>
                  <div className="p-4 flex gap-5 bg-blue-50/30">
                    {/* Mini cover */}
                    <div className={`w-24 h-32 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[selectedBook.cover]} rounded-lg flex items-center justify-center shadow-md`}>
                      <BookOpen size={24} className="text-white/30" />
                    </div>
                    {/* Info rows */}
                    <div className="flex-1 space-y-2 py-1">
                      {[
                        { label: "Judul", value: selectedBook.title },
                        { label: "Penulis", value: selectedBook.author },
                        { label: "Kategori", value: selectedBook.category },
                        { label: "Stok Tersedia", value: selectedBook.status === "Tersedia" ? "3 buku" : "Tidak tersedia" },
                      ].map(row => (
                        <div key={row.label} className="flex items-start gap-2 text-sm">
                          <span className="text-slate-500 shrink-0 w-28">{row.label}:</span>
                          <span className={`font-semibold ${row.label === "Stok Tersedia" ? "text-emerald-700" : "text-slate-800"}`}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tanggal Peminjaman */}
              <div>
                <label className={labelClass}>Tanggal Peminjaman</label>
                <DatePicker
                  value={borrowDate}
                  onChange={v => { setBorrowDate(v); setReturnDate(""); }}
                  min={new Date().toISOString().split("T")[0]}
                  placeholder="Pilih tanggal peminjaman"
                />
              </div>

              {/* Tanggal Pengembalian */}
              <div>
                <label className={labelClass}>
                  Tanggal Pengembalian{" "}
                  <span className="normal-case font-normal text-slate-400 tracking-normal">(Max 14 hari)</span>
                </label>
                {(() => {
                  const minRet = borrowDate || new Date().toISOString().split("T")[0];
                  const maxRet = (() => { const d = new Date(minRet + "T00:00:00"); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; })();
                  return (
                    <div>
                      <DatePicker
                        value={returnDate}
                        onChange={setReturnDate}
                        min={minRet}
                        max={maxRet}
                        placeholder={borrowDate ? "Pilih tanggal pengembalian" : "Pilih tanggal pinjam dulu"}
                      />
                      {borrowDate && (
                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                          <Calendar size={11} /> Batas maksimal: {new Date(maxRet + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Catatan */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                <div className="bg-amber-100 px-4 py-2.5 border-b border-amber-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Catatan</span>
                </div>
                <ul className="px-4 py-3 space-y-1.5 text-sm text-amber-800">
                  <li>- Buku harus dikembalikan sesuai tanggal yang ditentukan</li>
                  <li>- Keterlambatan akan dikenakan denda</li>
                  <li>- Maksimal peminjaman 3 buku</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setPage("home")}
                  className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (!bookTitle || !selectedBook) return;
                    const todayISO = new Date().toISOString().split("T")[0];
                    const borrow = borrowDate || todayISO;
                    const dueISO = returnDate || (() => {
                      const d = new Date(borrow + "T00:00:00"); d.setDate(d.getDate() + 14);
                      return d.toISOString().split("T")[0];
                    })();
                    const dueStr = fmtDate(dueISO);
                    addLoanRequest({
                      id: Date.now(),
                      studentName,
                      nim: studentNim,
                      prodi: studentProdi,
                      bookId: selectedBook.id,
                      bookTitle: selectedBook.title,
                      bookAuthor: selectedBook.author,
                      bookCategory: selectedBook.category,
                      bookCover: selectedBook.cover,
                      requestDate: todayISO,
                      borrowDate: borrow,
                      dueDate: dueISO,
                      dueDateOriginal: dueISO,
                      status: "menunggu",
                    });
                    addNotif({
                      type: "info",
                      title: "Pengajuan Dikirim",
                      message: `Pengajuan peminjaman "${selectedBook.title}" sedang menunggu persetujuan admin.`,
                      time: "Baru saja",
                    });
                    setPage("history");
                  }}
                  disabled={!bookTitle}
                  className={`flex-1 font-bold py-3.5 rounded-xl transition-all text-sm ${
                    bookTitle
                      ? "bg-[#1B5E8C] text-white hover:bg-[#154d75] shadow-md shadow-blue-900/20 active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  }`}>
                  {bookTitle ? "Konfirmasi Peminjaman" : "Pilih Buku Dulu"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ActiveLoan = {
  id: number;
  bookId: number;
  borrowDate: string;   // display string, e.g. "6 Juni 2026"
  dueDate: string;      // display string, e.g. "20 Juli 2026"
  dueDateISO: string;   // YYYY-MM-DD for calculations
};

type DoneLoan = {
  id: number;
  bookId: number;
  borrowDate: string;
  returnedDate: string;
};

const INITIAL_LOANS: ActiveLoan[] = [
  { id: 1, bookId: 1, borrowDate: "6 Juni 2026",  dueDate: "20 Juli 2026",  dueDateISO: "2026-07-20" },
  { id: 2, bookId: 2, borrowDate: "10 Juni 2026", dueDate: "24 Juli 2026",  dueDateISO: "2026-07-24" },
];

const DONE_LOANS: DoneLoan[] = [
  { id: 3, bookId: 3, borrowDate: "1 Mei 2026",    returnedDate: "14 Mei 2026" },
  { id: 4, bookId: 4, borrowDate: "5 April 2026",  returnedDate: "18 April 2026" },
  { id: 5, bookId: 5, borrowDate: "10 Maret 2026", returnedDate: "23 Maret 2026" },
];

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86_400_000);
}

function nearestDueDays(loans: ActiveLoan[]): number | null {
  if (!loans.length) return null;
  return Math.min(...loans.map(l => daysUntil(l.dueDateISO)));
}

function ExtendModal({ loan, onClose, onConfirm, addNotif }: {
  loan: ActiveLoan;
  onClose: () => void;
  onConfirm: (loanId: number, newDate: string) => void;
  addNotif: (n: Omit<Notif, "id" | "read">) => void;
}) {
  const book = BOOKS.find(b => b.id === loan.bookId)!;
  const [newDate, setNewDate] = useState("");
  // min = 1 hari setelah jatuh tempo, max = jatuh tempo + 3 hari
  const minDate = (() => {
    const d = new Date(loan.dueDateISO + "T00:00:00");
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();
  const maxDate = (() => {
    const d = new Date(loan.dueDateISO + "T00:00:00");
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm">Perpanjang Peminjaman</h3>
              <p className="text-blue-300 text-xs">Pilih tanggal pengembalian baru</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-xs transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Book info */}
          <div className="flex gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className={`w-12 h-16 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} rounded-lg flex items-center justify-center`}>
              <BookOpen size={14} className="text-white/40" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{book.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{book.author}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Calendar size={11} className="text-slate-400" />
                <span className="text-xs text-slate-500">Jatuh tempo saat ini: <span className="font-semibold text-slate-700">{loan.dueDate}</span></span>
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">
              Perpanjang Sampai Tanggal
            </label>
            <DatePicker
              value={newDate}
              onChange={setNewDate}
              min={minDate}
              max={maxDate}
              placeholder="Pilih tanggal perpanjangan"
            />
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="text-amber-500">⚠</span> Maksimal perpanjangan 3 hari setelah jatuh tempo ({loan.dueDate})
            </p>
          </div>

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700 leading-relaxed">
            Perpanjangan hanya dapat dilakukan <strong>1 kali</strong> per peminjaman. Pastikan Anda yakin dengan tanggal yang dipilih.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Batal
            </button>
            <button
              disabled={!newDate}
              onClick={() => {
                if (!newDate) return;
                const book = BOOKS.find(b => b.id === loan.bookId)!;
                const formatted = new Date(newDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                addNotif({
                  type: "info",
                  title: "Peminjaman Diperpanjang",
                  message: `"${book.title}" berhasil diperpanjang. Jatuh tempo baru: ${formatted}.`,
                  time: "Baru saja",
                });
                onConfirm(loan.id, newDate);
              }}
              className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm ${
                newDate
                  ? "bg-[#1B5E8C] text-white hover:bg-[#154d75] shadow-md shadow-blue-900/20 active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}>
              Konfirmasi Perpanjangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReturnModal({ loan, onClose, onConfirm, addNotif }: {
  loan: ActiveLoan;
  onClose: () => void;
  onConfirm: (loanId: number) => void;
  addNotif: (n: Omit<Notif, "id" | "read">) => void;
}) {
  const book = BOOKS.find(b => b.id === loan.bookId)!;
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Success state */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
            <h3 className="text-white text-xl font-extrabold">Buku Berhasil Dikembalikan!</h3>
            <p className="text-emerald-100 text-sm mt-1">Terima kasih telah mengembalikan tepat waktu</p>
          </div>
          <div className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Informasi Pengembalian</h4>
            <div className="space-y-3">
              {[
                { label: "Judul Buku", value: book.title },
                { label: "Penulis", value: book.author },
                { label: "Tanggal Pinjam", value: loan.borrowDate },
                { label: "Jatuh Tempo", value: loan.dueDate },
                { label: "Tanggal Dikembalikan", value: today },
                { label: "Status Denda", value: "Tidak Ada Denda ✓" },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <span className="text-slate-500 text-sm shrink-0">{row.label}</span>
                  <span className={`text-sm font-semibold text-right ${
                    row.label === "Status Denda" ? "text-emerald-600" : "text-slate-800"
                  }`}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mt-2">
              <p className="text-xs text-emerald-700 text-center font-medium">
                Buku telah tercatat di riwayat selesai Anda
              </p>
            </div>
            <button onClick={() => { onConfirm(loan.id); onClose(); }}
              className="w-full bg-[#1B5E8C] text-white font-bold py-3 rounded-xl hover:bg-[#154d75] transition-colors text-sm shadow-md shadow-blue-900/20 mt-2">
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm">Konfirmasi Pengembalian</h3>
              <p className="text-blue-300 text-xs">Pastikan buku sudah di tangan Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-xs transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Book info */}
          <div className="flex gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className={`w-12 h-16 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} rounded-lg flex items-center justify-center`}>
              <BookOpen size={14} className="text-white/40" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 text-sm truncate">{book.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{book.author}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5">
                {[
                  { label: "Dipinjam", value: loan.borrowDate },
                  { label: "Jatuh Tempo", value: loan.dueDate },
                  { label: "Dikembalikan", value: today },
                  { label: "Denda", value: "Rp 0" },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-xs text-slate-400">{r.label}</p>
                    <p className="text-xs font-semibold text-slate-700">{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 leading-relaxed">
            <strong>Perhatian:</strong> Proses pengembalian tidak dapat dibatalkan. Pastikan buku dalam kondisi baik sebelum melanjutkan.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Batal
            </button>
            <button
              onClick={() => {
                addNotif({
                  type: "success",
                  title: "Buku Berhasil Dikembalikan",
                  message: `"${book.title}" telah dikembalikan pada ${today}. Tidak ada denda.`,
                  time: "Baru saja",
                });
                setConfirmed(true);
              }}
              className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-md shadow-emerald-900/20 active:scale-[0.98]">
              Ya, Kembalikan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PengadaanPage({ 
  setPage, 
  nb, 
  userName,
  procurements,
  setProcurements, 
  addNotif 
}: { 
  setPage: (p: Page) => void; 
  nb: NotifBarProps; 
  userName: string;
  procurements: ProcurementRequest[]; 
  setProcurements: React.Dispatch<React.SetStateAction<ProcurementRequest[]>>; 
  addNotif: (n: Omit<Notif, "id" | "read">) => void; 
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Buku" | "Jurnal">("Buku");
  const [author, setAuthor] = useState("");

  // Filter usulan khusus untuk dosen yang sedang login saja
  const myProcurements = procurements.filter(p => p.dosenName === userName);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: ProcurementRequest = {
      id: Date.now(),
      dosenName: userName,
      type,
      title,
      author,
      publisher: "-",
      year: new Date().getFullYear(),
      reason: "Usulan Dosen",
      status: "menunggu",
      requestDate: new Date().toISOString().split("T")[0]
    };
    
    // Tambahkan usulan baru ke paling atas list
    setProcurements([newRequest, ...procurements]);
    addNotif({ type: "success", title: "Berhasil", message: "Usulan berhasil dikirim ke Admin!", time: "Baru saja" });
    
    // Reset dan tutup form
    setIsFormOpen(false);
    setTitle(""); 
    setAuthor("");
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <TopBar 
        title="Pengadaan Literatur" 
        subtitle="Kelola usulan buku atau jurnal baru" 
        {...nb} 
        userName={userName} 
        userSub="Dosen FST UIN Jakarta" 
      />
      
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Riwayat Usulan Anda</h2>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-[#1B5E8C] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#154d75] transition-all shadow-md shadow-blue-900/20 flex items-center gap-2">
            <BookmarkPlus size={16} /> Buat Usulan Baru
          </button>
        </div>

        {/* Formulir Usulan */}
        {isFormOpen && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Formulir Usulan Baru</h4>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Jenis</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1B5E8C]/40 outline-none">
                  <option value="Buku">Buku</option>
                  <option value="Jurnal">Jurnal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Judul Literatur</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Masukkan judul..." className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1B5E8C]/40 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Penulis</label>
                <input required value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nama penulis" className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1B5E8C]/40 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 rounded-xl transition-all">Batal</button>
              <button type="submit" className="flex-1 bg-[#1B5E8C] hover:bg-[#154d75] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md">Kirim Usulan Sekarang</button>
            </div>
          </form>
        )}

        {/* Tabel Riwayat Usulan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Literatur</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Tanggal Pengajuan</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myProcurements.length > 0 ? (
                myProcurements.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{p.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold">{p.type}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.requestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                        p.status === 'disetujui' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'ditolak' ? 'bg-red-50 text-red-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <BookmarkPlus size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-600">Belum ada riwayat usulan</p>
                    <p className="text-sm text-slate-400 mt-1">Klik tombol "Buat Usulan Baru" untuk mengajukan literatur.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ nb, addNotif, addAdminNotif, loanRequests, setLoanRequests, studentNim, books }: {
  nb: NotifBarProps;
  addNotif: (n: Omit<Notif, "id" | "read">) => void;
  addAdminNotif: (n: Omit<Notif, "id" | "read">) => void;
  loanRequests: LoanRequest[];
  setLoanRequests: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
  studentNim: string;
  books: Book[];
}) {
  const [extendReq, setExtendReq] = useState<LoanRequest | null>(null);
  const [returnReq, setReturnReq] = useState<LoanRequest | null>(null);

  const myActive   = loanRequests.filter(r => r.nim === studentNim && r.status === "aktif");
  const myDone     = loanRequests.filter(r => r.nim === studentNim && r.status === "selesai");
  const myPending  = loanRequests.filter(r => r.nim === studentNim && r.status === "menunggu");
  const myRejected = loanRequests.filter(r => r.nim === studentNim && r.status === "ditolak");

  const handleExtendConfirm = (reqId: number, newDateISO: string) => {
    const req = loanRequests.find(r => r.id === reqId)!;
    const formatted = fmtDate(newDateISO);
    setLoanRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, dueDate: newDateISO, extended: true, extendedAt: new Date().toISOString().split("T")[0] } : r
    ));
    addAdminNotif({
      type: "info",
      title: "Perpanjangan Peminjaman",
      message: `${req.studentName} (${req.nim}) memperpanjang "${req.bookTitle}" hingga ${formatted}.`,
      time: "Baru saja",
    });
    setExtendReq(null);
  };

  const handleReturnConfirm = (reqId: number) => {
    const req = loanRequests.find(r => r.id === reqId)!;
    const todayISO = new Date().toISOString().split("T")[0];
    setLoanRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, status: "selesai", returnedDate: todayISO } : r
    ));
    addAdminNotif({
      type: "success",
      title: "Buku Dikembalikan",
      message: `${req.studentName} (${req.nim}) telah mengembalikan "${req.bookTitle}".`,
      time: "Baru saja",
    });
  };

  // Map LoanRequest → ActiveLoan for modals
  const toActiveLoan = (r: LoanRequest): ActiveLoan => ({
    id: r.id, bookId: r.bookId,
    borrowDate: fmtDate(r.borrowDate),
    dueDate: fmtDate(r.dueDate),
    dueDateISO: r.dueDate,
  });

  const bookFor = (bookId: number) => books.find(b => b.id === bookId) ?? INITIAL_BOOKS.find(b => b.id === bookId);

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Riwayat Peminjaman" {...nb} />
      <div className="p-8 space-y-8">

        {/* Pending */}
        {myPending.length > 0 && (
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" />
              Menunggu Persetujuan
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{myPending.length}</span>
            </h3>
            <div className="space-y-3">
              {myPending.map(req => {
                const book = bookFor(req.bookId);
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-5">
                    <div className={`w-14 h-20 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-xl flex items-center justify-center`}>
                      <BookOpen size={18} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5 truncate">{req.bookTitle}</h4>
                      <p className="text-slate-500 text-xs mb-2">{req.bookAuthor}</p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Menunggu Persetujuan</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} /> Diajukan: {fmtDate(req.requestDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active */}
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-[#1B5E8C] rounded-full inline-block" />
            Peminjaman Aktif
            <span className="bg-blue-100 text-[#1B5E8C] text-xs font-bold px-2 py-0.5 rounded-full">{myActive.length}</span>
          </h3>
          {myActive.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">Tidak ada peminjaman aktif</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myActive.map(req => {
                const book = bookFor(req.bookId);
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className={`w-14 h-20 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-xl flex items-center justify-center`}>
                      <BookOpen size={18} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5 truncate">{req.bookTitle}</h4>
                      <p className="text-slate-500 text-xs mb-2">{req.bookAuthor}</p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="bg-blue-50 text-[#1B5E8C] text-xs font-bold px-2.5 py-0.5 rounded-full">Aktif</span>
                        {req.extended && <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Diperpanjang</span>}
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} /> Dipinjam: {fmtDate(req.borrowDate)}</span>
                        <span className="text-xs text-amber-600 font-semibold flex items-center gap-1"><Calendar size={11} /> Jatuh tempo: {fmtDate(req.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!req.extended && (
                        <button onClick={() => setExtendReq(req)}
                          className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                          Perpanjang
                        </button>
                      )}
                      <button onClick={() => setReturnReq(req)}
                        className="px-4 py-2 text-xs font-bold bg-[#1B5E8C] text-white rounded-lg hover:bg-[#154d75] transition-colors shadow-sm">
                        Kembalikan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rejected */}
        {myRejected.length > 0 && (
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
              Ditolak
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{myRejected.length}</span>
            </h3>
            <div className="space-y-3">
              {myRejected.map(req => (
                <div key={req.id} className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-center gap-5 opacity-80">
                  <div className={`w-14 h-20 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-xl flex items-center justify-center grayscale opacity-60`}>
                    <BookOpen size={18} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-700 text-sm mb-0.5 truncate">{req.bookTitle}</h4>
                    <p className="text-slate-400 text-xs mb-2">{req.bookAuthor}</p>
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">Ditolak</span>
                    {req.rejectReason && <p className="text-xs text-red-500 mt-1.5 italic">"{req.rejectReason}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
            Riwayat Selesai
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{myDone.length}</span>
          </h3>
          {myDone.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm">Belum ada riwayat selesai.</div>
          ) : (
            <div className="space-y-3">
              {myDone.map(req => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-5 opacity-80">
                  <div className={`w-14 h-20 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-xl flex items-center justify-center grayscale opacity-70`}>
                    <BookOpen size={18} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-700 text-sm mb-0.5 truncate">{req.bookTitle}</h4>
                    <p className="text-slate-400 text-xs mb-2">{req.bookAuthor}</p>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Selesai</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} /> Dipinjam: {fmtDate(req.borrowDate)}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} /> Dikembalikan: {req.returnedDate ? fmtDate(req.returnedDate) : "-"}</span>
                    </div>
                  </div>
                  <Check size={18} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {extendReq && (
        <ExtendModal
          loan={toActiveLoan(extendReq)}
          onClose={() => setExtendReq(null)}
          onConfirm={(id, newDate) => handleExtendConfirm(id, newDate)}
          addNotif={addNotif}
        />
      )}
      {returnReq && (
        <ReturnModal
          loan={toActiveLoan(returnReq)}
          onClose={() => setReturnReq(null)}
          onConfirm={(id) => handleReturnConfirm(id)}
          addNotif={addNotif}
        />
      )}
    </div>
  );
}

function ProfilePage({ setPage, nb, profile, loans, done, onLogout }: {
  setPage: (p: Page) => void;
  nb: NotifBarProps;
  profile: UserProfile;
  loans: ActiveLoan[];
  done: DoneLoan[];
  onLogout: () => void;
}) {
  const rows = [
    { label: "Nama Lengkap", value: profile.nama },
    { label: "NIM", value: profile.nim },
    { label: "Email", value: profile.email },
    { label: "Program Studi", value: profile.prodi },
    { label: "Nomor Telepon", value: profile.telepon },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Profil Mahasiswa" {...nb} />
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Profile card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] p-7 flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl border-2 border-white/30 overflow-hidden shadow-lg">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Foto profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <User size={40} className="text-white/70" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-xl font-extrabold truncate">{profile.nama}</h2>
                <p className="text-blue-200 text-sm">NIM: {profile.nim}</p>
                <p className="text-blue-300 text-xs mt-0.5">{profile.prodi} · Fakultas Sains dan Teknologi UIN Jakarta</p>
                <div className="flex gap-2 mt-3">
                  {[
                    { icon: BookMarked, label: `${loans.length} sedang dipinjam` },
                    { icon: Clock,      label: `${loans.length + done.length} total dipinjam` },
                    { icon: Check,      label: `${done.length} selesai` },
                  ].map(s => (
                    <span key={s.label} className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <s.icon size={11} /> {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Info rows — read only */}
            <div className="divide-y divide-slate-50">
              {rows.map(r => (
                <div key={r.label} className="flex items-center justify-between px-7 py-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-36 shrink-0">{r.label}</span>
                  <span className="text-sm font-semibold text-slate-700 flex-1 text-right">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setPage("edit-profile")}
              className="flex-1 bg-[#1B5E8C] text-white font-bold py-3.5 rounded-xl hover:bg-[#154d75] transition-colors text-sm shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
            > Edit Profil<Upload size={15} /></button>
            <button
              onClick={onLogout}
              className="flex-1 border-2 border-red-100 text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-sm flex items-center justify-center gap-2"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function EditProfilePage({ setPage, nb, profile, onSave, addNotif }: {
  setPage: (p: Page) => void;
  nb: NotifBarProps;
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  addNotif: (n: Omit<Notif, "id" | "read">) => void;
}) {
  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [saved, setSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(profile.photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof UserProfile) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setForm(prev => ({ ...prev, photoUrl: url }));
  };

  const handleSave = () => {
    onSave(form);
    addNotif({
      type: "success",
      title: "Profil Berhasil Diperbarui",
      message: `Data profil ${form.nama} telah berhasil disimpan.`,
      time: "Baru saja",
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setPage("profile"); }, 1200);
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-white transition-all";

  return (
    <div className="flex-1 overflow-auto">
      <TopBar title="Edit Profil" subtitle="Perbarui informasi akun Anda" {...nb} />
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] px-7 py-5 flex items-center gap-4">
              <button
                onClick={() => setPage("profile")}
                className="w-8 h-8 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
              >
                <ChevronDown size={14} className="rotate-90" />
              </button>
              <div>
                <h2 className="text-white font-extrabold text-base">Edit Profil Mahasiswa</h2>
                <p className="text-blue-300 text-xs">Perubahan akan disimpan ke akun Anda</p>
              </div>
            </div>

            {/* Avatar section */}
            <div className="flex flex-col items-center py-7 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1B5E8C] to-[#0D2137] flex items-center justify-center">
                      <User size={42} className="text-white/60" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#E8871A] rounded-full flex items-center justify-center hover:bg-[#d17516] transition-colors shadow-md border-2 border-white"
                >
                  <Upload size={13} className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Klik foto untuk mengganti</p>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(undefined); setForm(prev => ({ ...prev, photoUrl: undefined })); }}
                  className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors font-medium"
                >
                  Hapus foto
                </button>
              )}
            </div>

            {/* Form fields */}
            <div className="p-7 space-y-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Pribadi</p>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => set("nama")(e.target.value)}
                  placeholder="Nama lengkap sesuai KTP"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">NIM</label>
                <input
                  type="text"
                  value={form.nim}
                  onChange={e => set("nim")(e.target.value)}
                  placeholder="Nomor Induk Mahasiswa"
                  className={inputClass + " bg-slate-50 text-slate-400 cursor-not-allowed"}
                  readOnly
                />
                <p className="text-xs text-slate-400 mt-1.5">NIM tidak dapat diubah</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email")(e.target.value)}
                  placeholder="email@mhs.uinjkt.ac.id"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Program Studi</label>
                <div className="relative">
                  <select
                    value={form.prodi}
                    onChange={e => set("prodi")(e.target.value)}
                    className={inputClass + " appearance-none pr-10 cursor-pointer"}
                  >
                    <option value="">— Pilih Program Studi —</option>
                    {PRODI_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Nomor Telepon</label>
                <input
                  type="tel"
                  value={form.telepon}
                  onChange={e => set("telepon")(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={inputClass}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setPage("profile")}
                  className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex-1 font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                    saved
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1B5E8C] text-white hover:bg-[#154d75] shadow-md shadow-blue-900/20 active:scale-[0.98]"
                  }`}
                >
                  {saved ? (
                    <><Check size={15} strokeWidth={3} /> Tersimpan!</>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Data ────────────────────────────────────────────────────────────────

const MONTHLY_LOANS = [
  { month: "Jan", count: 45 }, { month: "Feb", count: 62 },
  { month: "Mar", count: 78 }, { month: "Apr", count: 55 },
  { month: "Mei", count: 91 }, { month: "Jun", count: 84 },
  { month: "Jul", count: 73 }, { month: "Agu", count: 68 },
  { month: "Sep", count: 95 }, { month: "Okt", count: 88 },
  { month: "Nov", count: 76 }, { month: "Des", count: 102 },
];

const PIE_COLORS = ["#1B5E8C", "#E8871A", "#10b981", "#8b5cf6", "#f43f5e", "#06b6d4"];

type TodayActivity = {
  id: number;
  type: "borrow" | "return";
  student: string;
  nim: string;
  book: string;
  time: string;
};

const TODAY_ACTIVITIES: TodayActivity[] = [
  { id: 1, type: "borrow", student: "Ahmad Fauzi",     nim: "2021001", book: "Algoritma dan Pemrograman",  time: "08:15" },
  { id: 2, type: "return", student: "Siti Rahmah",     nim: "2020045", book: "Kalkulus Multivariabel",      time: "09:30" },
  { id: 3, type: "borrow", student: "Budi Santoso",    nim: "2022018", book: "Machine Learning Dasar",      time: "10:05" },
  { id: 4, type: "return", student: "Dewi Lestari",    nim: "2021033", book: "Fisika Dasar Jilid II",       time: "11:20" },
  { id: 5, type: "borrow", student: "Rizky Pratama",   nim: "2023007", book: "Pengantar Basis Data",        time: "13:45" },
  { id: 6, type: "borrow", student: "Nur Aisyah",      nim: "2022055", book: "Jaringan Komputer",           time: "14:10" },
  { id: 7, type: "return", student: "Eko Prasetyo",    nim: "2020099", book: "Sistem Operasi Modern",       time: "15:30" },
];

const ADMIN_NAV = [
  { id: "admin-home",      label: "Beranda",             icon: LayoutDashboard },
  { id: "admin-books",     label: "Kelola Buku",         icon: BookCopy },
  { id: "admin-loans",     label: "Kelola Peminjaman",   icon: BookMarked },
  { id: "admin-pengadaan", label: "Kelola Pengadaan",    icon: BookmarkPlus }, // Pindah ke sini
  { id: "admin-students",  label: "Data Mahasiswa",      icon: Users },
  { id: "admin-reports",   label: "Laporan",             icon: BarChart2 },
];

// ── Admin Layout ──────────────────────────────────────────────────────────────

function AdminSidebar({ page, setPage, onLogout }: {
  page: AdminPage;
  setPage: (p: AdminPage) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="w-64 bg-[#0D2137] min-h-screen flex flex-col shrink-0 border-r border-white/5">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 flex items-center justify-center">
            <img src="/Logo Uin Jakarta Png.jpg" alt="Logo UIN Jakarta" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
            <p className="text-orange-300 text-xs">FST UIN Jakarta</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-0.5">
        {ADMIN_NAV.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as AdminPage)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#E8871A] text-white shadow-md shadow-orange-900/30"
                  : "text-blue-200/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#E8871A] rounded-full flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Administrator</p>
              <p className="text-orange-300 text-xs">admin@fst.uinjkt.ac.id</p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all"
        >
          <LogOut size={15} /> Keluar
        </button>
      </div>
    </aside>
  );
}

function AdminTopBar({ title, subtitle, notifs, onMarkRead, onMarkAll, onClear }: {
  title: string; subtitle?: string;
} & NotifBarProps) {
  return (
    <TopBar
      title={title}
      subtitle={subtitle}
      notifs={notifs}
      onMarkRead={onMarkRead}
      onMarkAll={onMarkAll}
      onClear={onClear}
      userName="Administrator"
      userSub="Admin Perpustakaan"
      userGradient="from-[#E8871A] to-[#c97016]"
    />
  );
}

// ── Admin: Beranda ────────────────────────────────────────────────────────────

function AdminHomePage({ nb, books, loans, done, students, loanRequests }: {
  nb: NotifBarProps;
  books: Book[];
  loans: ActiveLoan[];
  done: DoneLoan[];
  students: Student[];
  loanRequests: LoanRequest[];
}) {
  const todayISO = new Date().toISOString().split("T")[0];
  const todayStr = new Date().toLocaleDateString("id-ID");
  const totalBorrowed = loans.length;
  const borrowedToday = loanRequests.filter(r => r.requestDate === todayISO && r.status !== "ditolak").length;

  const categoryCount: Record<string, number> = {};
  books.forEach(b => { categoryCount[b.category] = (categoryCount[b.category] || 0) + 1; });
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <AdminTopBar title="Beranda Admin" subtitle="Ringkasan sistem perpustakaan digital" {...nb} />
      <div className="p-8 space-y-7">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: "Total Buku",         value: books.length,    sub: `${books.filter(b => b.status === "Tersedia").length} tersedia`,  icon: BookCopy,   color: "text-[#1B5E8C]",  bg: "bg-blue-50"    },
            { label: "Total Mahasiswa",    value: students.length, sub: `${loanRequests.filter(r => r.status === "aktif").length} sedang meminjam`, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Buku Dipinjam",      value: totalBorrowed,   sub: `${done.length} sudah dikembalikan`,                                  icon: BookMarked, color: "text-[#E8871A]",  bg: "bg-orange-50"  },
            { label: "Peminjaman Hari Ini",value: borrowedToday,   sub: todayStr,                                                              icon: TrendingUp, color: "text-emerald-600",bg: "bg-emerald-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-5 gap-5">
          {/* Monthly bar chart */}
          <div className="col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Peminjaman per Bulan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tahun 2026</p>
              </div>
              <span className="bg-blue-50 text-[#1B5E8C] text-xs font-bold px-2.5 py-1 rounded-full">
                Total: {MONTHLY_LOANS.reduce((s, m) => s + m.count, 0)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_LOANS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  formatter={(v: number) => [`${v} peminjaman`, ""]}
                />
                <Bar dataKey="count" fill="#1B5E8C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie chart */}
          <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-slate-800">Kategori Buku</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribusi koleksi</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {categoryData.map((entry, i) => (
                    <Cell key={`home-cat-${i}-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-slate-600 font-medium">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-slate-500" />
              <h3 className="text-sm font-extrabold text-slate-800">Aktivitas Hari Ini</h3>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{TODAY_ACTIVITIES.length}</span>
            </div>
            <span className="text-xs text-slate-400">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {TODAY_ACTIVITIES.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.type === "borrow" ? "bg-blue-50" : "bg-emerald-50"}`}>
                  {a.type === "borrow"
                    ? <BookMarked size={14} className="text-[#1B5E8C]" />
                    : <Check size={14} className="text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-slate-500 font-normal">{a.type === "borrow" ? "Mahasiswa" : "Mahasiswa"}</span>{" "}
                    <span className="text-[#1B5E8C]">{a.student}</span>
                    {" "}{a.type === "borrow" ? "meminjam" : "mengembalikan"}{" "}
                    <span className="text-slate-700 font-semibold">"{a.book}"</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">NIM: {a.nim}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.type === "borrow" ? "bg-blue-50 text-[#1B5E8C]" : "bg-emerald-50 text-emerald-700"}`}>
                    {a.type === "borrow" ? "Dipinjam" : "Dikembalikan"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Admin: Kelola Buku ────────────────────────────────────────────────────────

type BookForm = Omit<Book, "id" | "cover"> & { coverFile?: File };
const EMPTY_FORM: BookForm = { title: "", author: "", year: new Date().getFullYear(), category: "", status: "Tersedia", isbn: "", stok: 1, sinopsis: "", coverUrl: undefined };

function BookFormModal({ initial, onClose, onSave, mode }: {
  initial?: Book;
  onClose: () => void;
  onSave: (data: BookForm) => void;
  mode: "add" | "edit";
}) {
  const [form, setForm] = useState<BookForm>(
    initial
      ? { title: initial.title, author: initial.author, year: initial.year, category: initial.category, status: initial.status, isbn: initial.isbn, stok: initial.stok, sinopsis: initial.sinopsis, coverUrl: initial.coverUrl }
      : { ...EMPTY_FORM }
  );
  const [coverPreview, setCoverPreview] = useState<string | undefined>(initial?.coverUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof BookForm>(k: K, v: BookForm[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCoverPreview(url);
    set("coverUrl", url);
    set("coverFile", f);
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-white transition-all";
  const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest";

  const valid = form.title.trim() && form.author.trim() && form.category && form.isbn.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] px-7 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              {mode === "add" ? <Plus size={16} className="text-white" /> : <Pencil size={16} className="text-white" />}
            </div>
            <div>
              <h2 className="text-white font-extrabold text-base">{mode === "add" ? "Tambah Buku" : "Edit Buku"}</h2>
              <p className="text-blue-300 text-xs">Isi semua informasi buku dengan lengkap</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-auto">
          {/* Left — cover */}
          <div className="w-64 shrink-0 border-r border-slate-100 p-6 flex flex-col items-center gap-4 bg-slate-50/50">
            <p className={labelCls + " self-start"}>Cover Buku</p>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#1B5E8C] hover:bg-blue-50/30 transition-all overflow-hidden group relative"
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)]} opacity-20 absolute inset-0`} />
                  <Upload size={28} className="text-slate-400 mb-2 relative z-10" />
                  <p className="text-xs text-slate-500 font-medium relative z-10">Klik untuk upload</p>
                  <p className="text-xs text-slate-400 mt-1 relative z-10">JPG, PNG, WEBP</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
            {coverPreview && (
              <button
                type="button"
                onClick={() => { setCoverPreview(undefined); set("coverUrl", undefined); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
              >
                Hapus cover
              </button>
            )}
          </div>

          {/* Right — form */}
          <div className="flex-1 p-6 overflow-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Informasi Buku</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Judul Buku</label>
                  <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Masukkan judul buku" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Penulis</label>
                  <input value={form.author} onChange={e => set("author", e.target.value)} placeholder="Nama penulis" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>ISBN</label>
                  <input value={form.isbn} onChange={e => set("isbn", e.target.value)} placeholder="978-xxx-xxx-xx-x" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tahun Terbit</label>
                  <input type="number" value={form.year} onChange={e => set("year", +e.target.value)} min={1900} max={2099} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stok</label>
                  <input type="number" value={form.stok} onChange={e => set("stok", Math.max(1, +e.target.value))} min={1} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Kategori</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                      <option value="">— Pilih Kategori —</option>
                      {["Teknologi", "Sains", "Fiksi", "Non-Fiksi", "Sejarah", "Biologi", "Kimia", "Fisika", "Matematika"].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <div className="relative">
                    <select value={form.status} onChange={e => set("status", e.target.value as Book["status"])} className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                      <option value="Tersedia">Tersedia</option>
                      <option value="Dipinjam">Dipinjam</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Sinopsis</label>
                  <textarea
                    value={form.sinopsis}
                    onChange={e => set("sinopsis", e.target.value)}
                    placeholder="Deskripsi singkat isi buku..."
                    rows={4}
                    className={inputCls + " resize-none"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-7 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm">
            <ArrowLeft size={15} /> Kembali
          </button>
          <button
            disabled={!valid}
            onClick={() => valid && onSave(form)}
            className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
              valid
                ? "bg-[#1B5E8C] text-white hover:bg-[#154d75] shadow-md shadow-blue-900/20 active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {mode === "add" ? <><Plus size={15} /> Tambah Buku</> : <><Check size={15} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ book, onClose, onConfirm }: { book: Book; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Trash2 size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-sm">Hapus Buku</h3>
            <p className="text-red-100 text-xs">Tindakan ini tidak dapat dibatalkan</p>
          </div>
          <button onClick={onClose} className="ml-auto w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={12} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
            <div className={`w-12 h-16 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} rounded-lg flex items-center justify-center`}>
              <BookOpen size={14} className="text-white/40" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{book.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{book.author}</p>
              <p className="text-xs text-slate-400 mt-1">{book.category} · {book.year}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus buku ini? Data buku akan dihapus permanen dari sistem.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Batal
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors text-sm shadow-md shadow-red-900/20 active:scale-[0.98]">
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminBooksPage({ nb, books, setBooks }: {
  nb: NotifBarProps;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [year, setYear] = useState("Semua");
  const [addModal, setAddModal] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);

  const categories = ["Semua", ...Array.from(new Set(books.map(b => b.category))).sort()];
  const years = ["Semua", ...Array.from(new Set(books.map(b => String(b.year)))).sort((a, b) => +b - +a)];

  const filtered = books.filter(b => {
    const qm = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase()) || b.isbn.includes(query);
    const cm = cat === "Semua" || b.category === cat;
    const ym = year === "Semua" || String(b.year) === year;
    return qm && cm && ym;
  });

  const handleAdd = (data: BookForm) => {
    const newBook: Book = {
      ...data,
      id: Date.now(),
      cover: Math.floor(Math.random() * COVER_GRADIENTS.length),
    };
    setBooks(prev => [newBook, ...prev]);
    setAddModal(false);
  };

  const handleEdit = (data: BookForm) => {
    if (!editBook) return;
    setBooks(prev => prev.map(b => b.id === editBook.id ? { ...b, ...data } : b));
    setEditBook(null);
  };

  const handleDelete = () => {
    if (!deleteBook) return;
    setBooks(prev => prev.filter(b => b.id !== deleteBook.id));
    setDeleteBook(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <AdminTopBar title="Kelola Buku" subtitle={`${books.length} buku dalam koleksi`} {...nb} />
      <div className="p-8">

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul, penulis, atau ISBN..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-slate-50 transition-all"
              />
            </div>
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#1B5E8C] text-white font-bold rounded-xl hover:bg-[#154d75] transition-colors text-sm shadow-md shadow-blue-900/20 shrink-0"
            >
              <Plus size={16} /> Tambah Buku
            </button>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Kategori</p>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${cat === c ? "bg-[#1B5E8C] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Tahun</p>
              <div className="flex gap-1.5 flex-wrap">
                {years.map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${year === y ? "bg-[#1B5E8C] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-500">
            Menampilkan <span className="text-slate-800">{filtered.length}</span> dari {books.length} buku
          </p>
        </div>

        {/* Book grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Buku tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {filtered.map(book => (
              <div key={book.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                {/* Cover */}
                <div className={`h-44 bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} relative flex items-end p-3`}>
                  {book.coverUrl
                    ? <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
                    : <BookOpen size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                  }
                  <div className="relative flex items-center justify-between w-full">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">{book.category}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${book.status === "Tersedia" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                      {book.status}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-slate-500 text-xs mb-1 truncate">{book.author}</p>
                  <p className="text-slate-400 text-xs mb-3">{book.year} · Stok: {book.stok}</p>
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditBook(book)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-blue-50 text-[#1B5E8C] hover:bg-blue-100 transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteBook(book)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addModal && <BookFormModal mode="add" onClose={() => setAddModal(false)} onSave={handleAdd} />}
      {editBook && <BookFormModal mode="edit" initial={editBook} onClose={() => setEditBook(null)} onSave={handleEdit} />}
      {deleteBook && <DeleteConfirmModal book={deleteBook} onClose={() => setDeleteBook(null)} onConfirm={handleDelete} />}
    </div>
  );
}

// ── Admin: Kelola Peminjaman — types & data ───────────────────────────────────

type LoanStatus = "menunggu" | "aktif" | "ditolak" | "selesai";

type LoanRequest = {
  id: number;
  studentName: string;
  nim: string;
  prodi: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string;
  bookCover: number;
  requestDate: string;    // YYYY-MM-DD
  borrowDate: string;     // YYYY-MM-DD
  dueDate: string;        // YYYY-MM-DD — current due (after extension)
  dueDateOriginal: string;// YYYY-MM-DD — original due before extension
  status: LoanStatus;
  rejectReason?: string;
  extended?: boolean;
  extendedAt?: string;    // YYYY-MM-DD when extension was done
  returnedDate?: string;  // YYYY-MM-DD when actually returned
};

const _today = new Date();
const _d = (offset: number) => {
  const d = new Date(_today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const INITIAL_LOAN_REQUESTS: LoanRequest[] = [
  // ── Mahasiswa demo (NIM 123456789) ─────────────────────────────────────────
  { id: 201, studentName: "Muhammad Kafi Rajaba", nim: "123456789", prodi: "Teknik Informatika", bookId: 1, bookTitle: "Algoritma dan Pemrograman", bookAuthor: "Dr. Rinaldi Munir",       bookCategory: "Teknologi", bookCover: 0, requestDate: _d(-5), borrowDate: _d(-5), dueDate: _d(9),  dueDateOriginal: _d(9),  status: "aktif" },
  { id: 202, studentName: "Muhammad Kafi Rajaba", nim: "123456789", prodi: "Teknik Informatika", bookId: 2, bookTitle: "Kalkulus Multivariabel",   bookAuthor: "Prof. Purcell & Varberg", bookCategory: "Sains",     bookCover: 1, requestDate: _d(-3), borrowDate: _d(-3), dueDate: _d(11), dueDateOriginal: _d(11), status: "aktif" },
  { id: 203, studentName: "Muhammad Kafi Rajaba", nim: "123456789", prodi: "Teknik Informatika", bookId: 3, bookTitle: "Sistem Operasi Modern",    bookAuthor: "Andrew S. Tanenbaum",     bookCategory: "Teknologi", bookCover: 2, requestDate: _d(-20), borrowDate: _d(-20), dueDate: _d(-7), dueDateOriginal: _d(-7), status: "selesai", returnedDate: _d(-7) },
  { id: 204, studentName: "Muhammad Kafi Rajaba", nim: "123456789", prodi: "Teknik Informatika", bookId: 4, bookTitle: "Pengantar Basis Data",     bookAuthor: "Dr. Sri Kusumadewi",      bookCategory: "Teknologi", bookCover: 3, requestDate: _d(-35), borrowDate: _d(-35), dueDate: _d(-22), dueDateOriginal: _d(-22), status: "selesai", returnedDate: _d(-22) },
  { id: 205, studentName: "Muhammad Kafi Rajaba", nim: "123456789", prodi: "Teknik Informatika", bookId: 5, bookTitle: "Fisika Dasar Jilid II",    bookAuthor: "Dr. Young & Freedman",   bookCategory: "Sains",     bookCover: 4, requestDate: _d(-50), borrowDate: _d(-50), dueDate: _d(-37), dueDateOriginal: _d(-37), status: "selesai", returnedDate: _d(-37) },
  // ── Mahasiswa lain ──────────────────────────────────────────────────────────
  { id: 1,  studentName: "Ahmad Fauzi",     nim: "2021001", prodi: "Teknik Informatika",  bookId: 1,  bookTitle: "Algoritma dan Pemrograman", bookAuthor: "Dr. Rinaldi Munir",       bookCategory: "Teknologi", bookCover: 0, requestDate: _d(0),  borrowDate: _d(0),  dueDate: _d(14), dueDateOriginal: _d(14), status: "menunggu" },
  { id: 2,  studentName: "Siti Rahmah",     nim: "2020045", prodi: "Sistem Informasi",    bookId: 5,  bookTitle: "Fisika Dasar Jilid II",    bookAuthor: "Dr. Young & Freedman",   bookCategory: "Sains",     bookCover: 4, requestDate: _d(0),  borrowDate: _d(0),  dueDate: _d(14), dueDateOriginal: _d(14), status: "menunggu" },
  { id: 3,  studentName: "Budi Santoso",    nim: "2022018", prodi: "Teknik Informatika",  bookId: 7,  bookTitle: "Machine Learning Dasar",   bookAuthor: "Dr. Imam Muslem",         bookCategory: "Teknologi", bookCover: 6, requestDate: _d(0),  borrowDate: _d(0),  dueDate: _d(14), dueDateOriginal: _d(14), status: "menunggu" },
  { id: 4,  studentName: "Dewi Lestari",    nim: "2021033", prodi: "Matematika",           bookId: 2,  bookTitle: "Kalkulus Multivariabel",   bookAuthor: "Prof. Purcell & Varberg", bookCategory: "Sains",     bookCover: 1, requestDate: _d(0),  borrowDate: _d(0),  dueDate: _d(14), dueDateOriginal: _d(14), status: "aktif" },
  { id: 5,  studentName: "Rizky Pratama",   nim: "2023007", prodi: "Kimia",                bookId: 4,  bookTitle: "Pengantar Basis Data",     bookAuthor: "Dr. Sri Kusumadewi",      bookCategory: "Teknologi", bookCover: 3, requestDate: _d(0),  borrowDate: _d(0),  dueDate: _d(14), dueDateOriginal: _d(14), status: "menunggu" },
  { id: 6,  studentName: "Nur Aisyah",      nim: "2022055", prodi: "Biologi",              bookId: 6,  bookTitle: "Sejarah Peradaban Islam",  bookAuthor: "Prof. Dr. Samsul Munir",  bookCategory: "Sejarah",   bookCover: 5, requestDate: _d(-1), borrowDate: _d(-1), dueDate: _d(13), dueDateOriginal: _d(13), status: "aktif" },
  { id: 7,  studentName: "Eko Prasetyo",    nim: "2020099", prodi: "Fisika",               bookId: 5,  bookTitle: "Fisika Dasar Jilid II",    bookAuthor: "Dr. Young & Freedman",   bookCategory: "Sains",     bookCover: 4, requestDate: _d(-1), borrowDate: _d(-1), dueDate: _d(13), dueDateOriginal: _d(13), status: "ditolak", rejectReason: "Stok habis, semua sedang dipinjam." },
  { id: 8,  studentName: "Fitri Handayani", nim: "2022031", prodi: "Teknik Informatika",  bookId: 8,  bookTitle: "Jaringan Komputer",        bookAuthor: "Prof. Forouzan",          bookCategory: "Teknologi", bookCover: 7, requestDate: _d(-1), borrowDate: _d(-1), dueDate: _d(13), dueDateOriginal: _d(13), status: "selesai", returnedDate: _d(-1) },
  { id: 9,  studentName: "Hendra Wijaya",   nim: "2021067", prodi: "Sistem Informasi",    bookId: 3,  bookTitle: "Sistem Operasi Modern",    bookAuthor: "Andrew S. Tanenbaum",     bookCategory: "Teknologi", bookCover: 2, requestDate: _d(-2), borrowDate: _d(-2), dueDate: _d(12), dueDateOriginal: _d(12), status: "aktif" },
  { id: 10, studentName: "Indah Permata",   nim: "2023015", prodi: "Agribisnis",           bookId: 6,  bookTitle: "Sejarah Peradaban Islam",  bookAuthor: "Prof. Dr. Samsul Munir",  bookCategory: "Sejarah",   bookCover: 5, requestDate: _d(-2), borrowDate: _d(-2), dueDate: _d(12), dueDateOriginal: _d(12), status: "selesai", returnedDate: _d(-2) },
  { id: 11, studentName: "Joko Susilo",     nim: "2022088", prodi: "Teknik Pertambangan", bookId: 8,  bookTitle: "Jaringan Komputer",        bookAuthor: "Prof. Forouzan",          bookCategory: "Teknologi", bookCover: 7, requestDate: _d(-3), borrowDate: _d(-3), dueDate: _d(11), dueDateOriginal: _d(11), status: "aktif" },
  { id: 12, studentName: "Kartika Sari",    nim: "2021044", prodi: "Matematika",           bookId: 2,  bookTitle: "Kalkulus Multivariabel",   bookAuthor: "Prof. Purcell & Varberg", bookCategory: "Sains",     bookCover: 1, requestDate: _d(-3), borrowDate: _d(-3), dueDate: _d(11), dueDateOriginal: _d(11), status: "ditolak", rejectReason: "Data NIM tidak ditemukan dalam sistem." },
];

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_META: Record<LoanStatus, { label: string; bg: string; text: string }> = {
  menunggu: { label: "Menunggu",    bg: "bg-amber-50",   text: "text-amber-700" },
  aktif:    { label: "Aktif",       bg: "bg-blue-50",    text: "text-[#1B5E8C]" },
  ditolak:  { label: "Ditolak",     bg: "bg-red-50",     text: "text-red-600" },
  selesai:  { label: "Selesai",     bg: "bg-emerald-50", text: "text-emerald-700" },
};

// ── Loan detail modal ─────────────────────────────────────────────────────────

function LoanDetailModal({ req, onClose, onAccept, onReject }: {
  req: LoanRequest;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const sm = STATUS_META[req.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Eye size={15} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm">Detail Peminjaman</h3>
              <p className="text-blue-300 text-xs">ID #{req.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={13} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${sm.bg} ${sm.text}`}>{sm.label}</span>
          </div>

          {/* Student info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Mahasiswa</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#1B5E8C] to-[#0D2137] rounded-full flex items-center justify-center shrink-0">
                <User size={18} className="text-white/70" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{req.studentName}</p>
                <p className="text-slate-500 text-xs">NIM: {req.nim}</p>
                <p className="text-slate-500 text-xs">{req.prodi}</p>
              </div>
            </div>
          </div>

          {/* Book info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Buku</p>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-16 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-lg flex items-center justify-center`}>
                <BookOpen size={14} className="text-white/40" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{req.bookTitle}</p>
                <p className="text-slate-500 text-xs mt-0.5">{req.bookAuthor}</p>
                <span className="inline-block mt-1.5 text-xs font-medium bg-blue-50 text-[#1B5E8C] px-2 py-0.5 rounded-full">{req.bookCategory}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Tgl Pengajuan",   value: fmtDate(req.requestDate) },
              { label: "Tgl Pinjam",      value: fmtDate(req.borrowDate) },
              { label: "Tgl Kembali",     value: fmtDate(req.dueDate) },
            ].map(d => (
              <div key={d.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{d.label}</p>
                <p className="text-xs font-bold text-slate-700 leading-tight">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Extension info */}
          {req.extended && req.extendedAt && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5">
              <p className="text-xs font-bold text-violet-700 mb-1">Info Perpanjangan:</p>
              <p className="text-sm text-violet-600">
                Diperpanjang pada {fmtDate(req.extendedAt)} · Jatuh tempo baru: {fmtDate(req.dueDate)}
              </p>
            </div>
          )}

          {/* Return info */}
          {req.status === "selesai" && req.returnedDate && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <p className="text-xs font-bold text-emerald-700 mb-1">Pengembalian:</p>
              <p className="text-sm text-emerald-600">Dikembalikan pada {fmtDate(req.returnedDate)}</p>
            </div>
          )}

          {/* Reject reason */}
          {req.status === "ditolak" && req.rejectReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
              <p className="text-xs font-bold text-red-700 mb-1">Alasan Penolakan:</p>
              <p className="text-sm text-red-600">{req.rejectReason}</p>
            </div>
          )}

          {/* Actions for pending */}
          {req.status === "menunggu" && onAccept && onReject && (
            <div className="flex gap-3 pt-1">
              <button onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm">
                <X size={14} /> Tolak
              </button>
              <button onClick={onAccept}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1B5E8C] text-white font-bold rounded-xl hover:bg-[#154d75] transition-colors text-sm shadow-md shadow-blue-900/20">
                <Check size={14} /> Terima
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reject reason modal ───────────────────────────────────────────────────────

function RejectModal({ req, onClose, onConfirm }: {
  req: LoanRequest;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <X size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm">Tolak Peminjaman</h3>
              <p className="text-red-100 text-xs truncate max-w-[180px]">{req.bookTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={12} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">
              Alasan Penolakan <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Tuliskan alasan penolakan peminjaman ini..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 resize-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Batal
            </button>
            <button
              disabled={!reason.trim()}
              onClick={() => reason.trim() && onConfirm(reason.trim())}
              className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm ${
                reason.trim() ? "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-900/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}>
              Konfirmasi Tolak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Accept confirm modal ──────────────────────────────────────────────────────

function AcceptModal({ req, onClose, onConfirm }: {
  req: LoanRequest;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm">Terima Peminjaman</h3>
              <p className="text-emerald-100 text-xs truncate max-w-[180px]">{req.bookTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
            <X size={12} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
            <div className={`w-12 h-16 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-lg flex items-center justify-center`}>
              <BookOpen size={14} className="text-white/40" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{req.bookTitle}</p>
              <p className="text-slate-500 text-xs mt-0.5">{req.studentName} — {req.nim}</p>
              <p className="text-xs text-slate-400 mt-1">{fmtDate(req.borrowDate)} s/d {fmtDate(req.dueDate)}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin <strong>menerima</strong> pengajuan peminjaman ini? Status akan berubah menjadi <strong>Aktif</strong>.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Batal
            </button>
            <button onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm shadow-md shadow-emerald-900/20 active:scale-[0.98]">
              Ya, Terima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AdminLoansPage ────────────────────────────────────────────────────────────

function AdminLoansPage({ nb, loanRequests, setLoanRequests, addStudentNotif }: {
  nb: NotifBarProps;
  loanRequests: LoanRequest[];
  setLoanRequests: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
  addStudentNotif: (n: Omit<Notif, "id" | "read">) => void;
}) {
  const todayISO = new Date().toISOString().split("T")[0];
  const [filterDate, setFilterDate] = useState(todayISO);
  const [filterProdi, setFilterProdi] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState<"semua" | LoanStatus>("semua");
  const [detailReq, setDetailReq] = useState<LoanRequest | null>(null);
  const [acceptReq, setAcceptReq] = useState<LoanRequest | null>(null);
  const [rejectReq, setRejectReq] = useState<LoanRequest | null>(null);

  const prodiList = ["Semua", ...Array.from(new Set(loanRequests.map(r => r.prodi))).sort()];

  const filtered = loanRequests.filter(r => {
    const dateMatch = !filterDate || r.requestDate === filterDate;
    const prodiMatch = filterProdi === "Semua" || r.prodi === filterProdi;
    const statusMatch = filterStatus === "semua" || r.status === filterStatus;
    return dateMatch && prodiMatch && statusMatch;
  });

  const counts = {
    total:    loanRequests.filter(r => r.requestDate === filterDate).length,
    menunggu: loanRequests.filter(r => r.requestDate === filterDate && r.status === "menunggu").length,
    aktif:    loanRequests.filter(r => r.requestDate === filterDate && r.status === "aktif").length,
    ditolak:  loanRequests.filter(r => r.requestDate === filterDate && r.status === "ditolak").length,
  };

  const handleAccept = (id: number) => {
    const req = loanRequests.find(r => r.id === id)!;
    setLoanRequests(prev => prev.map(r => r.id === id ? { ...r, status: "aktif" as LoanStatus } : r));
    addStudentNotif({
      type: "success",
      title: "Peminjaman Disetujui!",
      message: `Pengajuan peminjaman "${req.bookTitle}" telah disetujui. Buku siap diambil.`,
      time: "Baru saja",
    });
  };

  const handleReject = (id: number, reason: string) => {
    const req = loanRequests.find(r => r.id === id)!;
    setLoanRequests(prev => prev.map(r => r.id === id ? { ...r, status: "ditolak" as LoanStatus, rejectReason: reason } : r));
    addStudentNotif({
      type: "warning",
      title: "Peminjaman Ditolak",
      message: `Pengajuan peminjaman "${req.bookTitle}" ditolak. Alasan: ${reason}`,
      time: "Baru saja",
    });
    setRejectReq(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <AdminTopBar title="Kelola Peminjaman" subtitle="Terima & kelola pengajuan peminjaman buku" {...nb} />
      <div className="p-8 space-y-6">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-wrap gap-5 items-end">
            {/* Date filter */}
            <div className="min-w-[220px]">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Tanggal Pengajuan</p>
              <DatePicker
                value={filterDate}
                onChange={setFilterDate}
                placeholder="Pilih tanggal"
              />
            </div>

            {/* Prodi filter */}
            <div className="min-w-[200px]">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Program Studi</p>
              <div className="relative">
                <select
                  value={filterProdi}
                  onChange={e => setFilterProdi(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-white appearance-none cursor-pointer pr-10 transition-all"
                >
                  {prodiList.map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Status filter pills */}
            <div className="flex-1 min-w-[260px]">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Status</p>
              <div className="flex gap-1.5 flex-wrap">
                {([["semua", "Semua"], ["menunggu", "Menunggu"], ["aktif", "Aktif"], ["ditolak", "Ditolak"], ["selesai", "Selesai"]] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setFilterStatus(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      filterStatus === val ? "bg-[#1B5E8C] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setFilterDate(todayISO); setFilterProdi("Semua"); setFilterStatus("semua"); }}
              className="px-4 py-3 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Stat cards — counts for selected date */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Pengajuan",  value: counts.total,    color: "text-slate-700",   bg: "bg-slate-50",   icon: BookMarked },
            { label: "Menunggu",         value: counts.menunggu, color: "text-amber-600",   bg: "bg-amber-50",   icon: Clock },
            { label: "Aktif / Diterima", value: counts.aktif,    color: "text-[#1B5E8C]",  bg: "bg-blue-50",    icon: Check },
            { label: "Ditolak",          value: counts.ditolak,  color: "text-red-500",     bg: "bg-red-50",     icon: X },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon size={17} className={s.color} />
              </div>
              <div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Menampilkan <span className="text-slate-800 font-bold">{filtered.length}</span> peminjaman
            {filterDate && <span className="text-slate-500"> pada <span className="text-[#1B5E8C] font-semibold">{fmtDate(filterDate)}</span></span>}
          </p>
        </div>

        {/* Loan list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
            <BookMarked size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Tidak ada data peminjaman</p>
            <p className="text-sm mt-1">Coba ubah filter tanggal atau program studi</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Mahasiswa</span>
              <span>Buku</span>
              <span>Tgl Kembali</span>
              <span>Status</span>
              <span>Aksi</span>
            </div>

            <div className="divide-y divide-slate-50">
              {filtered.map(req => {
                const sm = STATUS_META[req.status];
                return (
                  <div key={req.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-slate-50/60 transition-colors">
                    {/* Student */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#1B5E8C] to-[#0D2137] rounded-full flex items-center justify-center shrink-0">
                        <User size={14} className="text-white/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{req.studentName}</p>
                        <p className="text-slate-400 text-xs truncate">{req.nim} · {req.prodi}</p>
                      </div>
                    </div>

                    {/* Book */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-11 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[req.bookCover]} rounded-md flex items-center justify-center`}>
                        <BookOpen size={10} className="text-white/40" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-700 text-xs truncate">{req.bookTitle}</p>
                        <p className="text-slate-400 text-xs truncate">{req.bookCategory}</p>
                      </div>
                    </div>

                    {/* Due date */}
                    <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{fmtDate(req.dueDate)}</p>

                    {/* Status badge */}
                    <div className="flex flex-col gap-1 w-fit">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${sm.bg} ${sm.text} whitespace-nowrap`}>
                        {sm.label}
                      </span>
                      {req.extended && (
                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 whitespace-nowrap">
                          Diperpanjang
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 w-[112px] shrink-0">
                      <button
                        onClick={() => setDetailReq(req)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={14} />
                      </button>
                      {req.status === "menunggu" ? (
                        <>
                          <button
                            onClick={() => setAcceptReq(req)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Terima"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setRejectReq(req)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Tolak"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        /* placeholder agar kolom tetap lebar 112px */
                        <div className="w-[68px] shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {detailReq && (
        <LoanDetailModal
          req={detailReq}
          onClose={() => setDetailReq(null)}
          onAccept={detailReq.status === "menunggu" ? () => { setDetailReq(null); setAcceptReq(detailReq); } : undefined}
          onReject={detailReq.status === "menunggu" ? () => { setDetailReq(null); setRejectReq(detailReq); } : undefined}
        />
      )}
      {acceptReq && (
        <AcceptModal
          req={acceptReq}
          onClose={() => setAcceptReq(null)}
          onConfirm={() => { handleAccept(acceptReq.id); setAcceptReq(null); }}
        />
      )}
      {rejectReq && (
        <RejectModal
          req={rejectReq}
          onClose={() => setRejectReq(null)}
          onConfirm={reason => handleReject(rejectReq.id, reason)}
        />
      )}
    </div>
  );
}

function AdminPengadaanPage({ 
  nb, 
  procurements, 
  setProcurements, 
  addAdminNotif 
}: {
  nb: NotifBarProps;
  procurements: ProcurementRequest[];
  setProcurements: React.Dispatch<React.SetStateAction<ProcurementRequest[]>>;
  addAdminNotif: (n: Omit<Notif, "id" | "read">) => void;
}) {
  const handleStatus = (id: number, status: "disetujui" | "ditolak") => {
    setProcurements(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    addAdminNotif({ 
      type: status === "disetujui" ? "success" : "warning", 
      title: "Usulan Diperbarui", 
      message: `Usulan literatur kini berstatus ${status}.`, 
      time: "Baru saja" 
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <AdminTopBar title="Kelola Pengadaan Literatur" {...nb} />
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Dosen</th>
                <th className="px-6 py-4">Literatur</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procurements.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-semibold text-slate-800">{p.dosenName}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{p.title}</p>
                    <p className="text-slate-400 text-xs">{p.type} · {p.author}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700' : 
                      p.status === 'ditolak' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === "menunggu" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(p.id, "disetujui")} className="text-emerald-600 font-bold hover:underline">Terima</button>
                        <button onClick={() => handleStatus(p.id, "ditolak")} className="text-red-600 font-bold hover:underline">Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Admin: Data Mahasiswa — types & data ─────────────────────────────────────

type Student = {
  id: number;
  name: string;
  nim: string;
  prodi: string;
  email: string;
  telepon: string;
  registeredAt: string;  // ISO date
  photoUrl?: string;
  totalLoans: number;
  activeLoans: number;
};

const INITIAL_STUDENTS: Student[] = [
  { id: 1,  name: "Muhammad Kafi Rajaba", nim: "123456789", prodi: "Teknik Informatika",  email: "muhammad.kafi@mhs.uinjkt.ac.id",   telepon: "08123456789", registeredAt: "2024-08-15", totalLoans: 14, activeLoans: 2 },
  { id: 2,  name: "Ahmad Fauzi",          nim: "2021001",   prodi: "Teknik Informatika",  email: "ahmad.fauzi@mhs.uinjkt.ac.id",     telepon: "08134567890", registeredAt: "2024-08-16", totalLoans: 8,  activeLoans: 1 },
  { id: 3,  name: "Siti Rahmah",          nim: "2020045",   prodi: "Sistem Informasi",    email: "siti.rahmah@mhs.uinjkt.ac.id",     telepon: "08145678901", registeredAt: "2024-08-17", totalLoans: 12, activeLoans: 1 },
  { id: 4,  name: "Budi Santoso",         nim: "2022018",   prodi: "Teknik Informatika",  email: "budi.santoso@mhs.uinjkt.ac.id",    telepon: "08156789012", registeredAt: "2024-09-01", totalLoans: 6,  activeLoans: 1 },
  { id: 5,  name: "Dewi Lestari",         nim: "2021033",   prodi: "Matematika",           email: "dewi.lestari@mhs.uinjkt.ac.id",    telepon: "08167890123", registeredAt: "2024-09-02", totalLoans: 9,  activeLoans: 1 },
  { id: 6,  name: "Rizky Pratama",        nim: "2023007",   prodi: "Kimia",                email: "rizky.pratama@mhs.uinjkt.ac.id",   telepon: "08178901234", registeredAt: "2024-09-10", totalLoans: 3,  activeLoans: 1 },
  { id: 7,  name: "Nur Aisyah",           nim: "2022055",   prodi: "Biologi",              email: "nur.aisyah@mhs.uinjkt.ac.id",      telepon: "08189012345", registeredAt: "2024-09-12", totalLoans: 7,  activeLoans: 1 },
  { id: 8,  name: "Eko Prasetyo",         nim: "2020099",   prodi: "Fisika",               email: "eko.prasetyo@mhs.uinjkt.ac.id",    telepon: "08190123456", registeredAt: "2024-09-14", totalLoans: 11, activeLoans: 0 },
  { id: 9,  name: "Fitri Handayani",      nim: "2022031",   prodi: "Teknik Informatika",  email: "fitri.handayani@mhs.uinjkt.ac.id", telepon: "08201234567", registeredAt: "2024-10-01", totalLoans: 5,  activeLoans: 0 },
  { id: 10, name: "Hendra Wijaya",        nim: "2021067",   prodi: "Sistem Informasi",    email: "hendra.wijaya@mhs.uinjkt.ac.id",   telepon: "08212345678", registeredAt: "2024-10-05", totalLoans: 10, activeLoans: 1 },
  { id: 11, name: "Indah Permata",        nim: "2023015",   prodi: "Agribisnis",           email: "indah.permata@mhs.uinjkt.ac.id",   telepon: "08223456789", registeredAt: "2024-10-08", totalLoans: 4,  activeLoans: 0 },
  { id: 12, name: "Joko Susilo",          nim: "2022088",   prodi: "Teknik Pertambangan", email: "joko.susilo@mhs.uinjkt.ac.id",     telepon: "08234567890", registeredAt: "2024-10-12", totalLoans: 8,  activeLoans: 1 },
  { id: 13, name: "Kartika Sari",         nim: "2021044",   prodi: "Matematika",           email: "kartika.sari@mhs.uinjkt.ac.id",    telepon: "08245678901", registeredAt: "2024-10-15", totalLoans: 6,  activeLoans: 0 },
  { id: 14, name: "Lutfi Hakim",          nim: "2023042",   prodi: "Teknik Informatika",  email: "lutfi.hakim@mhs.uinjkt.ac.id",     telepon: "08256789012", registeredAt: "2024-11-01", totalLoans: 2,  activeLoans: 0 },
  { id: 15, name: "Maya Putri",           nim: "2022076",   prodi: "Biologi",              email: "maya.putri@mhs.uinjkt.ac.id",      telepon: "08267890123", registeredAt: "2024-11-05", totalLoans: 7,  activeLoans: 1 },
  { id: 16, name: "Nanda Kurniawan",      nim: "2021089",   prodi: "Kimia",                email: "nanda.kurniawan@mhs.uinjkt.ac.id", telepon: "08278901234", registeredAt: "2024-11-10", totalLoans: 5,  activeLoans: 0 },
  { id: 17, name: "Olivia Santoso",       nim: "2023061",   prodi: "Sistem Informasi",    email: "olivia.santoso@mhs.uinjkt.ac.id",  telepon: "08289012345", registeredAt: "2024-11-15", totalLoans: 1,  activeLoans: 1 },
  { id: 18, name: "Prayoga Dwi",          nim: "2020112",   prodi: "Fisika",               email: "prayoga.dwi@mhs.uinjkt.ac.id",     telepon: "08290123456", registeredAt: "2024-11-20", totalLoans: 13, activeLoans: 0 },
];

// ── Student detail modal ──────────────────────────────────────────────────────

function StudentDetailModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D2137] to-[#1B5E8C] px-6 py-7 flex items-center gap-5">
          <div className="w-16 h-16 shrink-0 rounded-2xl border-2 border-white/25 overflow-hidden shadow-lg">
            {student.photoUrl
              ? <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-white/20 flex items-center justify-center"><User size={28} className="text-white/70" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-extrabold text-base truncate">{student.name}</h3>
            <p className="text-blue-200 text-sm">NIM: {student.nim}</p>
            <p className="text-blue-300 text-xs mt-0.5">{student.prodi}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors shrink-0">
            <X size={13} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Loan stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Pinjam",   value: student.totalLoans,                          color: "text-[#1B5E8C]",  bg: "bg-blue-50" },
              { label: "Aktif",          value: student.activeLoans,                         color: "text-amber-600",  bg: "bg-amber-50" },
              { label: "Selesai",        value: student.totalLoans - student.activeLoans,    color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-white`}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info rows */}
          <div className="space-y-3">
            {[
              { label: "Email",           value: student.email,     icon: Info },
              { label: "Telepon",         value: student.telepon,   icon: Bell },
              { label: "Program Studi",   value: student.prodi,     icon: BookOpen },
              { label: "Terdaftar Sejak", value: new Date(student.registeredAt + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), icon: Calendar },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <row.icon size={14} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{row.label}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate mt-0.5">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AdminStudentsPage ─────────────────────────────────────────────────────────

function AdminStudentsPage({ nb, students, loans, done, loanRequests }: {
  nb: NotifBarProps;
  students: Student[];
  loans: ActiveLoan[];
  done: DoneLoan[];
  loanRequests: LoanRequest[];
}) {
  // compute real-time active loans per student NIM from loanRequests
  const activeLoansByNim: Record<string, number> = {};
  const totalLoansByNim: Record<string, number> = {};
  loanRequests.forEach(r => {
    if (r.status === "aktif") activeLoansByNim[r.nim] = (activeLoansByNim[r.nim] || 0) + 1;
    if (r.status !== "menunggu" && r.status !== "ditolak")
      totalLoansByNim[r.nim] = (totalLoansByNim[r.nim] || 0) + 1;
  });
  const enriched = students.map(s => ({
    ...s,
    activeLoans: activeLoansByNim[s.nim] ?? s.activeLoans,
    totalLoans: totalLoansByNim[s.nim] ?? s.totalLoans,
  }));
  const studentsActiveCount = enriched.filter(s => s.activeLoans > 0).length;
  const totalLoansAll = enriched.reduce((a, s) => a + s.totalLoans, 0);
  const [query, setQuery] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua");
  const [detail, setDetail] = useState<Student | null>(null);

  const prodiList = ["Semua", ...Array.from(new Set(enriched.map(s => s.prodi))).sort()];

  const filtered = enriched.filter(s => {
    const qm = !query
      || s.name.toLowerCase().includes(query.toLowerCase())
      || s.nim.includes(query);
    const pm = filterProdi === "Semua" || s.prodi === filterProdi;
    return qm && pm;
  });

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <AdminTopBar title="Data Mahasiswa" subtitle={`${students.length} mahasiswa terdaftar`} {...nb} />
      <div className="p-8 space-y-6">

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari berdasarkan nama atau NIM..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E8C]/40 focus:border-[#1B5E8C] bg-slate-50 transition-all"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-widest">Program Studi</p>
            <div className="flex gap-1.5 flex-wrap">
              {prodiList.map(p => (
                <button key={p} onClick={() => setFilterProdi(p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filterProdi === p ? "bg-[#1B5E8C] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Mahasiswa",  value: enriched.length,          color: "text-[#1B5E8C]",  bg: "bg-blue-50",    icon: Users },
            { label: "Aktif Meminjam",   value: studentsActiveCount,       color: "text-amber-600",  bg: "bg-amber-50",   icon: BookMarked },
            { label: "Total Peminjaman", value: totalLoansAll,             color: "text-violet-600", bg: "bg-violet-50",  icon: TrendingUp },
            { label: "Hasil Pencarian",  value: filtered.length,           color: "text-emerald-600",bg: "bg-emerald-50", icon: Search },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon size={17} className={s.color} />
              </div>
              <div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Result info */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Menampilkan <span className="text-slate-800 font-bold">{filtered.length}</span> dari {students.length} mahasiswa
            {filterProdi !== "Semua" && <span className="text-[#1B5E8C] font-semibold"> · {filterProdi}</span>}
          </p>
        </div>

        {/* Student grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Mahasiswa tidak ditemukan</p>
            <p className="text-sm mt-1">Coba ubah kata kunci atau filter program studi</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(student => (
              <div
                key={student.id}
                onClick={() => setDetail(student)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                    {student.photoUrl
                      ? <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#1B5E8C] to-[#0D2137] flex items-center justify-center">
                          <User size={20} className="text-white/70" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#1B5E8C] transition-colors">{student.name}</h4>
                    <p className="text-slate-400 text-xs">{student.nim}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{student.prodi}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-[#1B5E8C] font-bold">
                      <BookMarked size={11} /> {student.totalLoans}
                    </span>
                    {student.activeLoans > 0 && (
                      <span className="bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                        {student.activeLoans} aktif
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(student.registeredAt + "T00:00:00").toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {detail && <StudentDetailModal student={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ── Report PDF export ─────────────────────────────────────────────────────────

function exportReportPDF(
  books: Book[],
  students: Student[],
  loans: ActiveLoan[],
  done: DoneLoan[],
  loanRequests: LoanRequest[],
) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const totalLoans    = loans.length + done.length;
  const activeLoans   = loans.length;
  const doneLoans     = done.length;
  const pendingReqs   = loanRequests.filter(r => r.status === "menunggu").length;
  const availBooks    = books.filter(b => b.status === "Tersedia").length;

  // Category breakdown
  const catCount: Record<string, number> = {};
  books.forEach(b => { catCount[b.category] = (catCount[b.category] || 0) + 1; });
  const catLines = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) => `  - ${cat}: ${n} judul`)
    .join("\n");

  // Top prodi from loan requests
  const prodiCount: Record<string, number> = {};
  loanRequests.forEach(r => { prodiCount[r.prodi] = (prodiCount[r.prodi] || 0) + 1; });
  const prodiLines = Object.entries(prodiCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([prodi, n]) => `  - ${prodi}: ${n} peminjaman`)
    .join("\n");

  const safe = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const buildStream = () => {
    const lines: string[] = [];
    const ln = (text: string, x: number, y: number, size = 11) =>
      lines.push(`BT /F${size > 12 ? "2" : "1"} ${size} Tf ${x} ${y} Td (${safe(text)}) Tj ET`);

    let y = 800;
    const nl = (gap = 18) => { y -= gap; };

    ln("PERPUSTAKAAN DIGITAL FST UIN JAKARTA", 50, y, 14); nl(22);
    ln("LAPORAN SISTEM PERPUSTAKAAN DIGITAL", 50, y, 12); nl(16);
    ln(`Dicetak: ${dateStr} pukul ${timeStr}`, 50, y, 10); nl(30);

    lines.push(`BT /F1 10 Tf 50 ${y} Td (${safe("─".repeat(80))}) Tj ET`); nl(22);

    ln("A. RINGKASAN UMUM", 50, y, 12); nl(20);
    ln(`Total Koleksi Buku   : ${books.length} judul (${availBooks} tersedia)`, 60, y); nl();
    ln(`Total Mahasiswa      : ${students.length} terdaftar`, 60, y); nl();
    ln(`Total Peminjaman     : ${totalLoans} (${activeLoans} aktif, ${doneLoans} selesai)`, 60, y); nl();
    ln(`Menunggu Persetujuan : ${pendingReqs} pengajuan`, 60, y); nl(26);

    lines.push(`BT /F1 10 Tf 50 ${y} Td (${safe("─".repeat(80))}) Tj ET`); nl(22);

    ln("B. DISTRIBUSI KOLEKSI BUKU PER KATEGORI", 50, y, 12); nl(20);
    Object.entries(catCount).sort((a, b) => b[1] - a[1]).forEach(([cat, n]) => {
      ln(`${cat.padEnd(22)}: ${n} judul`, 60, y); nl();
    });
    nl(10);

    lines.push(`BT /F1 10 Tf 50 ${y} Td (${safe("─".repeat(80))}) Tj ET`); nl(22);

    ln("C. PEMINJAMAN PER PROGRAM STUDI (TOP 5)", 50, y, 12); nl(20);
    Object.entries(prodiCount).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([prodi, n]) => {
      ln(`${prodi.padEnd(28)}: ${n} peminjaman`, 60, y); nl();
    });
    nl(10);

    lines.push(`BT /F1 10 Tf 50 ${y} Td (${safe("─".repeat(80))}) Tj ET`); nl(22);

    ln("D. STATUS PENGAJUAN PEMINJAMAN", 50, y, 12); nl(20);
    (["menunggu", "aktif", "ditolak", "selesai"] as const).forEach(s => {
      const count = loanRequests.filter(r => r.status === s).length;
      const label = { menunggu: "Menunggu", aktif: "Aktif", ditolak: "Ditolak", selesai: "Selesai" }[s];
      ln(`${label.padEnd(22)}: ${count}`, 60, y); nl();
    });
    nl(10);

    lines.push(`BT /F1 10 Tf 50 ${y} Td (${safe("─".repeat(80))}) Tj ET`); nl(22);

    ln("E. PEMINJAMAN AKTIF SAAT INI", 50, y, 12); nl(20);
    loans.slice(0, 8).forEach(loan => {
      const b = INITIAL_BOOKS.find(bk => bk.id === loan.bookId);
      if (b) { ln(`- ${b.title.substring(0, 40)} (${loan.dueDate})`, 60, y); nl(); }
    });
    if (loans.length === 0) { ln("Tidak ada peminjaman aktif.", 60, y); nl(); }

    nl(20);
    ln("─────────────────────────────────────────────────", 50, y, 10); nl(16);
    ln("Dokumen ini dicetak otomatis oleh Sistem Perpustakaan Digital FST UIN Jakarta.", 50, y, 9); nl(12);
    ln(`© ${now.getFullYear()} Perpustakaan Digital FST UIN Jakarta`, 50, y, 9);

    return lines.join("\n");
  };

  const stream = buildStream();
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 900]\n/Contents 5 0 R /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> >>\nendobj\n";
  const obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj5 = `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj6 = "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  let pdf = "%PDF-1.4\n";
  const offs: number[] = [];
  offs.push(pdf.length); pdf += obj1 + "\n";
  offs.push(pdf.length); pdf += obj2 + "\n";
  offs.push(pdf.length); pdf += obj3 + "\n";
  offs.push(pdf.length); pdf += obj4 + "\n";
  offs.push(pdf.length); pdf += obj5 + "\n";
  offs.push(pdf.length); pdf += obj6 + "\n";

  const xref = pdf.length;
  pdf += "xref\n0 7\n";
  pdf += "0000000000 65535 f \n";
  offs.forEach(o => { pdf += `${String(o).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan-Perpustakaan-${now.toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── AdminReportsPage ──────────────────────────────────────────────────────────

function AdminReportsPage({ nb, books, students, loans, done, loanRequests }: {
  nb: NotifBarProps;
  books: Book[];
  students: Student[];
  loans: ActiveLoan[];
  done: DoneLoan[];
  loanRequests: LoanRequest[];
}) {
  const [exporting, setExporting] = useState(false);
  const now = new Date();
  const monthName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // ── computed data ───────────────────────────────────────────────────────────
  const totalLoans    = loans.length + done.length;
  const activeLoans   = loans.length;
  const pendingReqs   = loanRequests.filter(r => r.status === "menunggu").length;
  const rejectedReqs  = loanRequests.filter(r => r.status === "ditolak").length;

  const catCount: Record<string, number> = {};
  books.forEach(b => { catCount[b.category] = (catCount[b.category] || 0) + 1; });
  const categoryData = Object.entries(catCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const prodiCount: Record<string, number> = {};
  loanRequests.forEach(r => { prodiCount[r.prodi] = (prodiCount[r.prodi] || 0) + 1; });
  const prodiData = Object.entries(prodiCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const statusData = [
    { name: "Menunggu", value: loanRequests.filter(r => r.status === "menunggu").length, color: "#E8871A" },
    { name: "Aktif",    value: loanRequests.filter(r => r.status === "aktif").length,    color: "#1B5E8C" },
    { name: "Selesai",  value: loanRequests.filter(r => r.status === "selesai").length,  color: "#10b981" },
    { name: "Ditolak",  value: loanRequests.filter(r => r.status === "ditolak").length,  color: "#ef4444" },
  ];

  // top 5 most borrowed books from loanRequests
  const bookLoanCount: Record<number, number> = {};
  loanRequests.forEach(r => { bookLoanCount[r.bookId] = (bookLoanCount[r.bookId] || 0) + 1; });
  const topBooks = Object.entries(bookLoanCount)
    .map(([id, count]) => ({ book: books.find(b => b.id === +id), count }))
    .filter(x => x.book)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportReportPDF(books, students, loans, done, loanRequests);
      setExporting(false);
    }, 800);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F0F4F8]">
      <AdminTopBar title="Laporan" subtitle={`Periode ${monthName}`} {...nb} />
      <div className="p-8 space-y-7">

        {/* Page header with export */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Laporan Sistem Perpustakaan</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Data terakhir diperbarui: {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#E8871A] text-white font-bold rounded-xl hover:bg-[#d17516] transition-all text-sm shadow-md shadow-orange-900/20 active:scale-[0.98] disabled:opacity-60"
          >
            {exporting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengekspor...</>
            ) : (
              <><FileText size={16} /> Export PDF</>
            )}
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: "Total Koleksi Buku",    value: books.length,             sub: `${books.filter(b => b.status === "Tersedia").length} tersedia`,    icon: BookCopy,   color: "text-[#1B5E8C]",  bg: "bg-blue-50",    trend: "+2 bulan ini" },
            { label: "Total Mahasiswa",        value: students.length,          sub: "terdaftar aktif",                                                  icon: Users,       color: "text-violet-600", bg: "bg-violet-50",  trend: "+3 bulan ini" },
            { label: "Total Peminjaman",       value: totalLoans,               sub: `${activeLoans} sedang berjalan`,                                   icon: BookMarked, color: "text-[#E8871A]",  bg: "bg-orange-50",  trend: "+12 bulan ini" },
            { label: "Menunggu Persetujuan",   value: pendingReqs,              sub: `${rejectedReqs} ditolak`,                                          icon: Clock,      color: "text-amber-600",  bg: "bg-amber-50",   trend: "Perlu ditindak" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-2">{s.trend}</p>
            </div>
          ))}
        </div>

        {/* Charts row 1: monthly + status donut */}
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Tren Peminjaman per Bulan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tahun 2026</p>
              </div>
              <span className="bg-blue-50 text-[#1B5E8C] text-xs font-bold px-2.5 py-1 rounded-full">
                Total {MONTHLY_LOANS.reduce((s, m) => s + m.count, 0)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_LOANS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`${v} peminjaman`, ""]} />
                <Bar dataKey="count" fill="#1B5E8C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">Status Peminjaman</h3>
            <p className="text-xs text-slate-400 mb-4">Distribusi seluruh pengajuan</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={38}>
                  {statusData.map((entry, i) => (
                    <Cell key={`report-status-${i}-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-slate-600 font-medium flex-1">{s.name}</span>
                  <span className="font-extrabold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2: category bar + prodi bar */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">Distribusi Kategori Buku</h3>
            <p className="text-xs text-slate-400 mb-5">Jumlah judul per kategori</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`${v} judul`, ""]} />
                <Bar dataKey="value" fill="#1B5E8C" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">Peminjaman per Program Studi</h3>
            <p className="text-xs text-slate-400 mb-5">Jumlah pengajuan dari setiap prodi</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={prodiData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`${v} peminjaman`, ""]} />
                <Bar dataKey="value" fill="#E8871A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: top books + recent activity */}
        <div className="grid grid-cols-5 gap-5">
          {/* Top borrowed books */}
          <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">Buku Paling Banyak Dipinjam</h3>
            <p className="text-xs text-slate-400 mb-5">Top 5 berdasarkan total pengajuan</p>
            <div className="space-y-3.5">
              {topBooks.map(({ book, count }, i) => book && (
                <div key={book.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-500"
                  }`}>{i + 1}</span>
                  <div className={`w-8 h-11 shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[book.cover]} rounded-lg flex items-center justify-center`}>
                    <BookOpen size={10} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{book.title}</p>
                    <p className="text-xs text-slate-400 truncate">{book.category}</p>
                  </div>
                  <span className="text-sm font-extrabold text-[#1B5E8C] shrink-0">{count}×</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent loan requests */}
          <div className="col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Pengajuan Terbaru</h3>
                <p className="text-xs text-slate-400 mt-0.5">10 pengajuan terakhir</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {loanRequests.slice(0, 8).map(req => {
                const sm = STATUS_META[req.status];
                return (
                  <div key={req.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1B5E8C] to-[#0D2137] rounded-full flex items-center justify-center shrink-0">
                      <User size={13} className="text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{req.studentName}</p>
                      <p className="text-xs text-slate-400 truncate">{req.bookTitle}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${sm.bg} ${sm.text}`}>{sm.label}</span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">{fmtDate(req.requestDate).split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [adminPage, setAdminPage] = useState<AdminPage>("admin-home");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [adminNotifs, setAdminNotifs] = useState<Notif[]>(INITIAL_ADMIN_NOTIFS);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>(INITIAL_LOAN_REQUESTS);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [borrowPreset, setBorrowPreset] = useState<{ category: string; title: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    nama: "Muhammad Kafi Rajaba",
    nim: "123456789",
    email: "muhammad.kafi@university.ac.id",
    prodi: "Teknik Informatika",
    telepon: "08123456789",
  });

  // ── Derived student loan views (loanRequests = single source of truth) ──────
  const studentNim = profile.nim;
  const loans: ActiveLoan[] = loanRequests
    .filter(r => r.nim === studentNim && r.status === "aktif")
    .map(r => ({ id: r.id, bookId: r.bookId, borrowDate: fmtDate(r.borrowDate), dueDate: fmtDate(r.dueDate), dueDateISO: r.dueDate }));
  const done: DoneLoan[] = loanRequests
    .filter(r => r.nim === studentNim && r.status === "selesai")
    .map(r => ({ id: r.id, bookId: r.bookId, borrowDate: fmtDate(r.borrowDate), returnedDate: r.returnedDate ? fmtDate(r.returnedDate) : fmtDate(r.dueDate) }));
  const pendingLoans = loanRequests.filter(r => r.nim === studentNim && r.status === "menunggu");
  const rejectedLoans = loanRequests.filter(r => r.nim === studentNim && r.status === "ditolak");

  const addNotif = (n: Omit<Notif, "id" | "read">) =>
    setNotifs(prev => [{ ...n, id: Date.now(), read: false }, ...prev]);

  const addAdminNotif = (n: Omit<Notif, "id" | "read">) =>
    setAdminNotifs(prev => [{ ...n, id: Date.now(), read: false }, ...prev]);

  const nb: NotifBarProps = {
    notifs,
    onMarkRead: (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    onMarkAll: () => setNotifs(prev => prev.map(n => ({ ...n, read: true }))),
    onClear: (id) => setNotifs(prev => prev.filter(n => n.id !== id)),
  };

  const adminNb: NotifBarProps = {
    notifs: adminNotifs,
    onMarkRead: (id) => setAdminNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    onMarkAll: () => setAdminNotifs(prev => prev.map(n => ({ ...n, read: true }))),
    onClear: (id) => setAdminNotifs(prev => prev.filter(n => n.id !== id)),
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    
    if (role === "admin") {
      setAdminPage("admin-home");
    } else if (role === "dosen") {
      // SET PROFILE JADI DATA DOSEN
      setProfile({
        nama: "Dr. Budi Santoso, M.Kom",
        nim: "198001012026", // Ini jadi NIP
        email: "budi.santoso@uinjkt.ac.id",
        prodi: "Dosen Teknik Informatika",
        telepon: "081234567890",
      });
      setPage("home");
    } else {
      // SET PROFILE KEMBALI JADI DATA MAHASISWA (Kafi)
      setProfile({
        nama: "Muhammad Kafi Rajaba",
        nim: "123456789",
        email: "muhammad.kafi@university.ac.id",
        prodi: "Teknik Informatika",
        telepon: "08123456789",
      });
      setPage("home");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setPage("landing");
  };

  const wrap = (el: React.ReactNode) => (
    <div className="size-full overflow-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{el}</div>
  );

  // ── Public pages — hanya tampil jika belum login ─────────────────────────
  if (!userRole) {
    if (page === "register") return wrap(<RegisterPage setPage={setPage} onRegister={reg => {
      setStudents(prev => [{
        id: Date.now(),
        name: reg.name,
        nim: reg.nim,
        prodi: reg.prodi,
        email: reg.email,
        telepon: "",
        registeredAt: new Date().toISOString().split("T")[0],
        totalLoans: 0,
        activeLoans: 0,
      }, ...prev]);
    }} />);
    if (page === "login")    return wrap(<LoginPage setPage={setPage} onLogin={handleLogin} />);
    return wrap(<LandingPage setPage={setPage} />);
  }

  // ── Admin layout ──────────────────────────────────────────────────────────
  if (userRole === "admin") {
    return (
      <div className="size-full flex overflow-hidden bg-[#F0F4F8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <AdminSidebar page={adminPage} setPage={setAdminPage} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {adminPage === "admin-home"      && <AdminHomePage nb={adminNb} books={books} loans={loans} done={done} students={students} loanRequests={loanRequests} />}
          {adminPage === "admin-books"     && <AdminBooksPage nb={adminNb} books={books} setBooks={setBooks} />}
          {adminPage === "admin-loans"     && <AdminLoansPage nb={adminNb} loanRequests={loanRequests} setLoanRequests={setLoanRequests} addStudentNotif={addNotif} />}
          {adminPage === "admin-students"  && <AdminStudentsPage nb={adminNb} students={students} loans={loans} done={done} loanRequests={loanRequests} />}
          {adminPage === "admin-reports"   && <AdminReportsPage nb={adminNb} books={books} students={students} loans={loans} done={done} loanRequests={loanRequests} />}
          
          {/* Tambahkan baris ini di bawah AdminReportsPage */}
          {adminPage === "admin-pengadaan" && (
            <AdminPengadaanPage 
              nb={adminNb} 
              procurements={procurements} 
              setProcurements={setProcurements} 
              addAdminNotif={addAdminNotif} 
            />
          )}
        </div>
      </div>
    );
  }

// ── Mahasiswa & Dosen layout ───────────────────────────────────────────────
  return (
    <div className="size-full flex overflow-hidden bg-[#F0F4F8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. Sidebar sudah ditambahkan userName dan userSub biar namanya muncul */}
      <Sidebar 
        page={page} 
        setPage={setPage} 
        onLogout={handleLogout} 
        userRole={userRole} 
        userName={profile.nama} 
        userSub={userRole === 'dosen' ? `NIP. ${profile.nim}` : `NIM. ${profile.nim}`} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Tambahkan userRole & userName ke HomePage */}
        {page === "home" && (
          <HomePage 
            setPage={setPage} 
            nb={nb} 
            loans={loans} 
            done={done} 
            books={books} 
            userRole={userRole!} 
            userName={profile.nama}
            onBorrowBook={b => { 
              if(userRole === 'mahasiswa') {
                setBorrowPreset({ category: b.category, title: b.title }); 
                setPage("borrow"); 
              } else {
                alert("Dosen hanya bisa mengajukan pengadaan");
              }
            }} 
          />
        )}
        
        {page === "search" && <SearchPage setPage={setPage} nb={nb} books={books} onBorrowBook={b => { setBorrowPreset({ category: b.category, title: b.title }); setPage("borrow"); }} />}
        
        {page === "borrow" && <BorrowPage setPage={setPage} nb={nb} addNotif={addNotif} preset={borrowPreset} onClearPreset={() => setBorrowPreset(null)} addLoanRequest={req => setLoanRequests(prev => [req, ...prev])} books={books} studentNim={profile.nim} studentName={profile.nama} studentProdi={profile.prodi} />}
        
        {page === "history" && <HistoryPage nb={nb} addNotif={addNotif} addAdminNotif={addAdminNotif} loanRequests={loanRequests} setLoanRequests={setLoanRequests} studentNim={profile.nim} books={books} />}
        
        {page === "profile" && <ProfilePage setPage={setPage} nb={nb} profile={profile} loans={loans} done={done} onLogout={handleLogout} />}
        
        {page === "edit-profile" && <EditProfilePage setPage={setPage} nb={nb} profile={profile} onSave={setProfile} addNotif={addNotif} />}
        
        {/* 3. Render Page Pengadaan Khusus Dosen */}
        {page === "pengadaan" && userRole === "dosen" && (
            <PengadaanPage 
                setPage={setPage} 
                nb={nb} 
                addNotif={addNotif} 
                procurements={procurements} 
                setProcurements={setProcurements} 
                userName={profile.nama} 
            />
        )}
      </div>
    </div>
  ); // Ini menutup return
} // Ini menutup fungsi App