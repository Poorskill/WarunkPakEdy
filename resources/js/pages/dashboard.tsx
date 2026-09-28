import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Package,
    ShoppingCart,
    AlertTriangle,
    TrendingUp,
    Plus,
    Truck,
    ClipboardCheck,
    ArrowRight,
    Boxes,
    ChevronRight,
    UserCircle,
    Receipt,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

interface Metrics {
    todaySales: number;
    todayTransactions: number;
    todayProfit: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalProducts: number;
    totalCustomers: number;
}

interface TrendDay {
    date: string;
    day_label: string;
    total: number;
    count: number;
}

interface LowStockProduct {
    id: number;
    name: string;
    sku: string;
    stock: string;
    minimum_stock: string;
    unit: string;
    category: { id: number; name: string } | null;
}

interface RecentSale {
    id: number;
    invoice_number: string;
    sale_date: string;
    total: string;
    status: string;
    user: { id: number; name: string };
    customer: { id: number; name: string } | null;
    items: { id: number }[];
}

interface DashboardProps {
    metrics: Metrics;
    weeklyTrend: TrendDay[];
    lowStockProducts: LowStockProduct[];
    recentSales: RecentSale[];
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Dashboard({
    metrics = {
        todaySales: 0,
        todayTransactions: 0,
        todayProfit: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalProducts: 0,
        totalCustomers: 0,
    },
    weeklyTrend = [],
    lowStockProducts = [],
    recentSales = [],
}: DashboardProps) {
    const { auth } = usePage().props as { auth: { user: { role: string; name: string } } };
    const role = auth?.user?.role || 'owner';
    const isOwner = role === 'owner';
    const isCashier = role === 'cashier';

    const kpiCards = [
        {
            title: isCashier ? 'Penjualan Saya Hari Ini' : 'Penjualan Hari Ini',
            value: formatRupiah(metrics?.todaySales || 0),
            icon: BarChart3,
            iconBg: 'bg-[#ECFDF5]',
            iconColor: 'text-[#047857]',
        },
        {
            title: isCashier ? 'Transaksi Saya Hari Ini' : 'Transaksi Hari Ini',
            value: `${metrics?.todayTransactions || 0} Nota`,
            icon: ShoppingCart,
            iconBg: 'bg-[#EFF6FF]',
            iconColor: 'text-[#2563EB]',
        },
        isOwner
            ? {
                  title: 'Estimasi Laba Hari Ini',
                  value: formatRupiah(metrics?.todayProfit || 0),
                  icon: TrendingUp,
                  iconBg: 'bg-[#F5F3FF]',
                  iconColor: 'text-[#7C3AED]',
              }
            : isCashier
            ? {
                  title: 'Total Pelanggan Terdaftar',
                  value: `${metrics?.totalCustomers || 0} Pelanggan`,
                  icon: UserCircle,
                  iconBg: 'bg-[#F5F3FF]',
                  iconColor: 'text-[#7C3AED]',
              }
            : {
                  title: 'Total Jenis Produk',
                  value: `${metrics?.totalProducts || 0} Produk`,
                  icon: Package,
                  iconBg: 'bg-[#F5F3FF]',
                  iconColor: 'text-[#7C3AED]',
              },
        {
            title: 'Stok Perlu Restock',
            value: `${(metrics?.lowStockCount || 0) + (metrics?.outOfStockCount || 0)} Produk`,
            icon: AlertTriangle,
            iconBg:
                (metrics?.lowStockCount || 0) + (metrics?.outOfStockCount || 0) > 0
                    ? 'bg-[#FEF3C7]'
                    : 'bg-[#ECFDF5]',
            iconColor:
                (metrics?.lowStockCount || 0) + (metrics?.outOfStockCount || 0) > 0
                    ? 'text-[#D97706]'
                    : 'text-[#16A34A]',
        },
    ];

    // Max daily sales for relative bar heights
    const maxSales =
        weeklyTrend && weeklyTrend.length > 0
            ? Math.max(...weeklyTrend.map((d) => d.total || 0), 100000)
            : 100000;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Dashboard Warung
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Ringkasan performa operasional toko dan inventori hari ini
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white font-bold h-10 px-4">
                            <Link href="/pos">
                                <ShoppingCart className="size-4 mr-2" />
                                Buka Kasir POS (F9)
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <div
                            key={card.title}
                            className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4.5 shadow-2xs"
                        >
                            <div
                                className={`flex size-11 items-center justify-center rounded-lg shrink-0 ${card.iconBg}`}
                            >
                                <card.icon className={`size-5 ${card.iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-[#64748B] truncate">
                                    {card.title}
                                </p>
                                <p
                                    className="text-xl font-extrabold text-[#0F172A] mt-0.5 truncate"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Bar */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
                        Aksi Cepat Operasional
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <Link
                            href="/pos"
                            className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                        >
                            <div className="flex items-center gap-2.5">
                                <ShoppingCart className="size-4 text-[#047857]" />
                                <span className="text-xs font-semibold text-[#0F172A]">Kasir POS</span>
                            </div>
                            <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                        </Link>

                        {isCashier ? (
                            <>
                                <Link
                                    href="/sales"
                                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Receipt className="size-4 text-[#047857]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">Riwayat Penjualan</span>
                                    </div>
                                    <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                                </Link>

                                <Link
                                    href="/customers"
                                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <UserCircle className="size-4 text-[#047857]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">Pelanggan / Member</span>
                                    </div>
                                    <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                                </Link>

                                <Link
                                    href="/returns"
                                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <RotateCcw className="size-4 text-[#047857]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">Retur Barang</span>
                                    </div>
                                    <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/products/create"
                                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Plus className="size-4 text-[#047857]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">Tambah Produk</span>
                                    </div>
                                    <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                                </Link>

                                <Link
                                    href="/purchases/create"
                                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Truck className="size-4 text-[#047857]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">Catat Pembelian</span>
                                    </div>
                                    <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                                </Link>

                                <Link
                                    href="/stock-opnames/create"
                                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <ClipboardCheck className="size-4 text-[#047857]" />
                                        <span className="text-xs font-semibold text-[#0F172A]">Stock Opname</span>
                                    </div>
                                    <ChevronRight className="size-3.5 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* 7-Day Sales Trend Bar Chart (Pure Clean SVG/CSS) */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-[#0F172A]">
                                Tren Penjualan 7 Hari Terakhir
                            </h2>
                            <p className="text-xs text-[#64748B]">
                                Volume pendapatan harian dari transaksi penjualan kasir
                            </p>
                        </div>
                        <Link
                            href="/reports/sales"
                            className="text-xs font-semibold text-[#047857] hover:underline flex items-center gap-1"
                        >
                            Lihat Laporan Lengkap
                            <ArrowRight className="size-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 border-b border-[#E2E8F0]">
                        {(weeklyTrend || []).map((day) => {
                            const barHeightPercent = Math.max(
                                8,
                                Math.round((day.total / maxSales) * 100)
                            );
                            const isToday =
                                day.date === new Date().toISOString().split('T')[0];

                            return (
                                <div
                                    key={day.date}
                                    className="flex flex-col items-center justify-end h-full group relative"
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap pointer-events-none shadow-md z-10">
                                        <p className="font-semibold">{formatRupiah(day.total)}</p>
                                        <p className="text-[#94A3B8]">{day.count} transaksi</p>
                                    </div>

                                    {/* Bar element */}
                                    <div
                                        style={{ height: `${barHeightPercent}%` }}
                                        className={`w-full max-w-12 rounded-t-md transition-all group-hover:brightness-95 ${
                                            isToday
                                                ? 'bg-[#047857]'
                                                : day.total > 0
                                                  ? 'bg-[#10B981]'
                                                  : 'bg-[#E2E8F0]'
                                        }`}
                                    />
                                    <span
                                        className={`mt-2 text-[11px] font-semibold truncate ${
                                            isToday ? 'text-[#047857]' : 'text-[#64748B]'
                                        }`}
                                    >
                                        {day.day_label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section: Recent Transactions & Low Stock Alerts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Transactions (2 cols) */}
                    <div className="col-span-1 rounded-lg border border-[#E2E8F0] bg-white lg:col-span-2 overflow-hidden">
                        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                            <h2 className="text-base font-bold text-[#0F172A]">
                                Transaksi Penjualan Terbaru
                            </h2>
                            <Link
                                href="/sales"
                                className="text-xs font-semibold text-[#047857] hover:underline"
                            >
                                Semua Penjualan
                            </Link>
                        </div>

                        {recentSales.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <ShoppingCart className="size-10 text-[#94A3B8] mb-2" />
                                <p className="text-sm font-semibold text-[#64748B]">
                                    Belum ada transaksi hari ini
                                </p>
                                <p className="text-xs text-[#94A3B8] mb-4">
                                    Transaksi dari kasir POS akan tampil di sini
                                </p>
                                <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white text-xs">
                                    <Link href="/pos">Buka Kasir Sekarang</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                                No. Invoice
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                                Kasir / Pelanggan
                                            </th>
                                            <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                                Total
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                                Waktu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(recentSales || []).map((sale) => (
                                            <tr
                                                key={sale.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                                    <Link
                                                        href={`/sales/${sale.id}`}
                                                        className="text-[#2563EB] hover:underline"
                                                    >
                                                        {sale.invoice_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#64748B]">
                                                    <p className="font-medium text-[#0F172A]">{sale.user.name}</p>
                                                    <p className="text-[11px] text-[#94A3B8]">
                                                        {sale.customer?.name || 'Pelanggan Umum'}
                                                    </p>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold text-[#047857]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {formatRupiah(Number(sale.total))}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                                                    {formatDate(sale.sale_date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alerts (1 col) */}
                    <div className="col-span-1 rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                            <h2 className="text-base font-bold text-[#0F172A]">
                                Peringatan Stok Menipis
                            </h2>
                            <Link
                                href="/inventory"
                                className="text-xs font-semibold text-[#D97706] hover:underline"
                            >
                                Kelola Stok
                            </Link>
                        </div>

                        {lowStockProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <Boxes className="size-10 text-[#16A34A] mb-2" />
                                <p className="text-sm font-semibold text-[#15803D]">
                                    Semua stok produk aman
                                </p>
                                <p className="text-xs text-[#94A3B8]">
                                    Tidak ada produk yang berada di bawah batas minimum
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F1F5F9]">
                                {(lowStockProducts || []).map((product) => {
                                    const stockNum = Number(product.stock);
                                    const isOut = stockNum <= 0;

                                    return (
                                        <div
                                            key={product.id}
                                            className="p-3.5 flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-bold text-[#0F172A]">
                                                    {product.name}
                                                </p>
                                                <p className="text-[11px] text-[#94A3B8]">
                                                    SKU: {product.sku}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        isOut
                                                            ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                                            : 'bg-[#FEF3C7] text-[#B45309]'
                                                    }`}
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {isOut ? 'Habis (0)' : `${stockNum} ${product.unit}`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {!isCashier && (
                                    <div className="p-3 bg-[#F8FAFC] text-center border-t border-[#E2E8F0]">
                                        <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold">
                                            <Link href="/purchases/create">
                                                <Truck className="size-3.5 mr-1 text-[#047857]" />
                                                Restock Lewat Pembelian
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
