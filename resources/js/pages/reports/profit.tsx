import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    TrendingUp,
    DollarSign,
    Percent,
    Wallet,
    Calendar,
    Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DailyReport {
    date: string;
    transactions_count: number;
    revenue: number;
    cogs: number;
    profit: number;
    margin: number;
}

interface TopProfitableProduct {
    product_name: string;
    sku: string;
    qty_sold: string;
    total_revenue: string;
    total_cogs: string;
    total_profit: string;
}

interface ReportProfitProps {
    metrics: {
        totalRevenue: number;
        totalCogs: number;
        grossProfit: number;
        marginPercentage: number;
    };
    dailyReports: DailyReport[];
    topProfitableProducts: TopProfitableProduct[];
    filters: {
        start_date: string;
        end_date: string;
    };
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
        year: 'numeric',
    });
}

export default function ReportProfit({
    metrics,
    dailyReports,
    topProfitableProducts,
    filters,
}: ReportProfitProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const applyDateFilter = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        router.get(
            '/reports/profit',
            { start_date: start, end_date: end },
            { preserveState: true, replace: true }
        );
    };

    const handleCustomFilter = (e: React.FormEvent) => {
        e.preventDefault();
        applyDateFilter(startDate, endDate);
    };

    const handlePresetMonth = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        const today = now.toISOString().split('T')[0];
        applyDateFilter(firstDay, today);
    };

    return (
        <>
            <Head title="Laporan Keuntungan & Laba" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Laporan Keuntungan
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Perhitungan omzet kotor, modal HPP, margin laba, dan performa harian
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePresetMonth}
                        className="text-xs h-9"
                    >
                        Bulan Ini
                    </Button>
                </div>

                {/* Filter Card */}
                <form
                    onSubmit={handleCustomFilter}
                    className="rounded-lg border border-[#E2E8F0] bg-white p-4 flex flex-wrap items-center gap-3"
                >
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#64748B]">Dari:</span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-36 h-8 text-xs"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#64748B]">Sampai:</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-36 h-8 text-xs"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-8 text-xs bg-[#047857] hover:bg-[#065F46] text-white"
                    >
                        Hitung Keuntungan
                    </Button>
                </form>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#EFF6FF]">
                            <DollarSign className="size-5 text-[#2563EB]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Omzet Penjualan</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.totalRevenue)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF2F2]">
                            <Wallet className="size-5 text-[#DC2626]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Modal (HPP)</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.totalCogs)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ECFDF5]">
                            <TrendingUp className="size-5 text-[#047857]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Keuntungan Kotor (Laba)</p>
                            <p className="text-lg font-bold text-[#047857]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.grossProfit)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#F5F3FF]">
                            <Percent className="size-5 text-[#7C3AED]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Margin Keuntungan</p>
                            <p className="text-lg font-bold text-[#7C3AED]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.marginPercentage}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Profitable Products */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-2">
                        <Award className="size-4 text-[#D97706]" />
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Produk dengan Kontribusi Keuntungan Terbesar
                        </h2>
                    </div>

                    {topProfitableProducts.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#94A3B8]">
                            Belum ada data penjualan pada periode ini
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Produk
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Terjual
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Omzet
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Modal
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Laba Bersih
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProfitableProducts.map((p) => (
                                        <tr
                                            key={p.sku}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-[#0F172A]">
                                                    {p.product_name}
                                                </p>
                                                <p className="text-xs text-[#94A3B8]">
                                                    SKU: {p.sku}
                                                </p>
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {p.qty_sold}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(p.total_revenue))}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(p.total_cogs))}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold text-[#047857]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(p.total_profit))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Daily Breakdown Table */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Rincian Performa Keuntungan Harian
                        </h2>
                    </div>

                    {dailyReports.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#94A3B8]">
                            Belum ada riwayat transaksi pada rentang tanggal yang dipilih
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Jumlah Transaksi
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Omzet Penjualan
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Modal (HPP)
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Keuntungan
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Margin (%)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyReports.map((d) => (
                                        <tr
                                            key={d.date}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                                {formatDate(d.date)}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {d.transactions_count} Nota
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-medium text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(d.revenue)}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(d.cogs)}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold text-[#047857]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(d.profit)}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-semibold text-[#7C3AED]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {d.margin}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ReportProfit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Laporan Keuntungan', href: '/reports/profit' },
    ],
};
