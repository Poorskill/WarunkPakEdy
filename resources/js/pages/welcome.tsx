import { Head, Link, usePage } from '@inertiajs/react';
import {
    ShoppingCart,
    Package,
    TrendingUp,
    ShieldCheck,
    Shield,
    ShieldAlert,
    ArrowRight,
    LogIn,
    Store,
    LogOut,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="WarunkPakEdy — Sistem Kasir & Manajemen Toko" />
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#0F172A]">
                {/* Navbar */}
                <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-30">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex aspect-square size-12 items-center justify-center rounded-xl overflow-hidden shrink-0">
                                <AppLogoIcon className="size-12 rounded-xl" />
                            </div>
                            <div>
                                <span className="font-extrabold text-base tracking-tight text-[#0F172A] block leading-tight">
                                    WarunkPakEdy
                                </span>
                                <span className="text-[11px] font-semibold text-[#64748B] block leading-tight">
                                    POS & Retail Management
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-[#64748B] hidden sm:inline">
                                        Masuk sebagai:{' '}
                                        <strong className="text-[#0F172A]">
                                            {auth.user.name} ({auth.user.role})
                                        </strong>
                                    </span>
                                    <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold">
                                        <Link href={dashboard()}>
                                            Buka Dashboard
                                            <ArrowRight className="size-4 ml-1.5" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="icon" className="size-9 text-[#DC2626]">
                                        <a href="/logout" title="Keluar">
                                            <LogOut className="size-4" />
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <Button asChild variant="outline" className="border-[#CBD5E1] text-[#0F172A]">
                                    <Link href={login()}>
                                        <LogIn className="size-4 mr-1.5" />
                                        Masuk Akun
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero & Quick Access */}
                <main className="max-w-6xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
                    <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs font-bold">
                            <Store className="size-3.5" />
                            <span>Aplikasi Kasir & Inventori Retail UMKM</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                            Kelola Toko Kelontong Lebih Cepat, Rapi, & Menguntungkan
                        </h1>
                        <p className="text-sm sm:text-base text-[#64748B]">
                            Sistem POS terintegrasi stok barang, faktur pembelian supplier, transaksi penjualan kasir, retur, dan laporan keuntungan otomatis.
                        </p>
                    </div>

                    {/* Quick Demo Login Cards */}
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs max-w-4xl mx-auto w-full mb-12">
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-bold text-[#0F172A]">
                                Masuk Cepat (Akses Demo)
                            </h2>
                            <p className="text-xs text-[#64748B] mt-0.5">
                                Klik salah satu tombol di bawah untuk langsung beralih dan masuk ke peran yang diinginkan
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Owner */}
                            <div className="border border-[#E2E8F0] hover:border-[#047857] rounded-lg p-5 flex flex-col justify-between transition-all bg-[#F8FAFC]/50 hover:bg-[#ECFDF5]/30">
                                <div>
                                    <div className="flex items-center gap-2 text-[#047857] mb-2">
                                        <ShieldCheck className="size-5" />
                                        <span className="font-bold text-sm">Owner / Pemilik</span>
                                    </div>
                                    <p className="text-xs font-bold text-[#0F172A]">Pak Edy</p>
                                    <p className="text-[11px] text-[#64748B] font-mono mt-0.5">owner@warunkpakedy.test</p>
                                    <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
                                        Akses penuh: Kasir POS, Dashboard, Inventori, Pembelian, Laba Rugi, Pengguna, & Pengaturan.
                                    </p>
                                </div>
                                <Button asChild className="mt-4 w-full bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-xs h-9">
                                    <a href="/demo-login/owner">Masuk sebagai Owner</a>
                                </Button>
                            </div>

                            {/* Admin */}
                            <div className="border border-[#E2E8F0] hover:border-[#2563EB] rounded-lg p-5 flex flex-col justify-between transition-all bg-[#F8FAFC]/50 hover:bg-[#EFF6FF]/30">
                                <div>
                                    <div className="flex items-center gap-2 text-[#2563EB] mb-2">
                                        <Shield className="size-5" />
                                        <span className="font-bold text-sm">Admin Toko</span>
                                    </div>
                                    <p className="text-xs font-bold text-[#0F172A]">Siti Admin</p>
                                    <p className="text-[11px] text-[#64748B] font-mono mt-0.5">admin@warunkpakedy.test</p>
                                    <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
                                        Akses operasional: Kasir POS, Manajemen Produk, Restock Pembelian, dan Opname Stok.
                                    </p>
                                </div>
                                <Button asChild className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs h-9">
                                    <a href="/demo-login/admin">Masuk sebagai Admin</a>
                                </Button>
                            </div>

                            {/* Cashier */}
                            <div className="border border-[#E2E8F0] hover:border-[#D97706] rounded-lg p-5 flex flex-col justify-between transition-all bg-[#F8FAFC]/50 hover:bg-[#FEF3C7]/30">
                                <div>
                                    <div className="flex items-center gap-2 text-[#D97706] mb-2">
                                        <ShieldAlert className="size-5" />
                                        <span className="font-bold text-sm">Kasir Toko</span>
                                    </div>
                                    <p className="text-xs font-bold text-[#0F172A]">Budi Kasir</p>
                                    <p className="text-[11px] text-[#64748B] font-mono mt-0.5">kasir@warunkpakedy.test</p>
                                    <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
                                        Akses kasir POS: Scan barcode, keranjang belanja, cetak struk nota, dan riwayat transaksi.
                                    </p>
                                </div>
                                <Button asChild className="mt-4 w-full bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs h-9">
                                    <a href="/demo-login/cashier">Masuk sebagai Kasir</a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-[#E2E8F0]">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#047857] shrink-0">
                                <ShoppingCart className="size-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0F172A]">Kasir POS Modern</h3>
                                <p className="text-xs text-[#64748B] mt-0.5">
                                    Pencarian instan, barcode scanner, multi metode bayar (Tunai, QRIS, Transfer), & cetak nota.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-[#E2E8F0]">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB] shrink-0">
                                <Package className="size-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0F172A]">Inventori Otomatis</h3>
                                <p className="text-xs text-[#64748B] mt-0.5">
                                    Pengurangan stok saat jual, penambahan saat restock, rekonsiliasi opname, & audit pergerakan.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-[#E2E8F0]">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#7C3AED] shrink-0">
                                <TrendingUp className="size-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0F172A]">Laba & Keuntungan</h3>
                                <p className="text-xs text-[#64748B] mt-0.5">
                                    Laporan laba kotor real-time, margin keuntungan harian, dan analisis produk terlaris.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
                    <p className="font-medium text-[#0F172A]">WarunkPakEdy POS System</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        Dibangun dengan Laravel 13, React, TypeScript, Inertia.js, & Tailwind CSS
                    </p>
                </footer>
            </div>
        </>
    );
}
