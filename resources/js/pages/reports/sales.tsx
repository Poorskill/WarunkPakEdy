import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Receipt,
    Calendar,
    TrendingUp,
    CreditCard,
    DollarSign,
    Package,
    ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, type PaginationLink } from '@/components/pagination';

interface PaymentStat {
    payment_method: string;
    count: number;
    total_amount: string;
}

interface TopProduct {
    product_name: string;
    sku: string;
    total_qty: string;
    total_revenue: string;
}

interface SaleItem {
    id: number;
    product_name: string;
}

interface Sale {
    id: number;
    invoice_number: string;
    sale_date: string;
    total: string;
    customer: { id: number; name: string } | null;
    user: { id: number; name: string };
    payments: { id: number; payment_method: string }[];
}

interface ReportSalesProps {
    metrics: {
        totalSales: number;
        totalTransactions: number;
        averageTransaction: number;
        totalDiscount: number;
    };
    paymentBreakdown: PaymentStat[];
    topProducts: TopProduct[];
    transactions: {
        data: Sale[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
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
        hour: '2-digit',
        minute: '2-digit',
    });
}

function paymentMethodLabel(method: string): string {
    const map: Record<string, string> = {
        cash: 'Tunai',
        qris: 'QRIS',
        transfer: 'Transfer Bank',
        ewallet: 'E-Wallet',
    };
    return map[method] || method.toUpperCase();
}

export default function ReportSales({
    metrics,
    paymentBreakdown,
    topProducts,
    transactions,
    filters,
}: ReportSalesProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const applyDateFilter = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        router.get(
            '/reports/sales',
            { start_date: start, end_date: end },
            { preserveState: true, replace: true }
        );
    };

    const handlePresetToday = () => {
        const today = new Date().toISOString().split('T')[0];
        applyDateFilter(today, today);
    };

    const handlePresetMonth = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        const today = now.toISOString().split('T')[0];
        applyDateFilter(firstDay, today);
    };

    const handleCustomFilter = (e: React.FormEvent) => {
        e.preventDefault();
        applyDateFilter(startDate, endDate);
    };

    return (
        <>
            <Head title="Laporan Penjualan" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Laporan Penjualan
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Analisis pendapatan kasir, ringkasan transaksi, dan produk terlaris
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePresetToday}
                            className="text-xs h-9"
                        >
                            Hari Ini
                        </Button>
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
                </div>

                {/* Date Filter Card */}
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
                        Terapkan Periode
                    </Button>
                </form>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ECFDF5]">
                            <DollarSign className="size-5 text-[#047857]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Penjualan</p>
                            <p className="text-lg font-bold text-[#047857]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.totalSales)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#EFF6FF]">
                            <Receipt className="size-5 text-[#2563EB]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Jumlah Transaksi</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.totalTransactions} Nota
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#F5F3FF]">
                            <TrendingUp className="size-5 text-[#7C3AED]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Rata-rata Transaksi</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.averageTransaction)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF3C7]">
                            <BarChart3 className="size-5 text-[#D97706]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Diskon Toko</p>
                            <p className="text-lg font-bold text-[#D97706]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.totalDiscount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Breakdown & Top Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Method Breakdown */}
                    <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className="p-4 border-b border-[#E2E8F0]">
                            <h2 className="text-base font-semibold text-[#0F172A]">
                                Rincian Metode Pembayaran
                            </h2>
                        </div>
                        {paymentBreakdown.length === 0 ? (
                            <div className="p-8 text-center text-xs text-[#94A3B8]">
                                Belum ada transaksi dalam periode ini
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F1F5F9]">
                                {paymentBreakdown.map((item) => (
                                    <div
                                        key={item.payment_method}
                                        className="p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
                                                <CreditCard className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#0F172A]">
                                                    {paymentMethodLabel(item.payment_method)}
                                                </p>
                                                <p className="text-xs text-[#94A3B8]">
                                                    {item.count} transaksi
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className="text-sm font-bold text-[#0F172A]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(item.total_amount))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top 5 Selling Products */}
                    <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className="p-4 border-b border-[#E2E8F0]">
                            <h2 className="text-base font-semibold text-[#0F172A]">
                                5 Produk Terlaris
                            </h2>
                        </div>
                        {topProducts.length === 0 ? (
                            <div className="p-8 text-center text-xs text-[#94A3B8]">
                                Belum ada produk terjual dalam periode ini
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F1F5F9]">
                                {topProducts.map((prod, index) => (
                                    <div
                                        key={prod.sku}
                                        className="p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-bold text-[#047857]">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-[#0F172A]">
                                                    {prod.product_name}
                                                </p>
                                                <p className="text-xs text-[#94A3B8]">
                                                    SKU: {prod.sku}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className="text-sm font-bold text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {prod.total_qty} Terjual
                                            </p>
                                            <p
                                                className="text-xs text-[#047857] font-semibold"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(prod.total_revenue))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Transactions Table */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Daftar Faktur Penjualan dalam Periode
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        No. Invoice
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Waktu Transaksi
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Kasir
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Pelanggan
                                    </th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Metode
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((sale) => (
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
                                            {formatDate(sale.sale_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#0F172A]">
                                            {sale.user?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#64748B]">
                                            {sale.customer?.name || 'Umum'}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs">
                                            <span className="px-2 py-0.5 rounded bg-[#F1F5F9] font-medium text-[#0F172A]">
                                                {sale.payments[0]
                                                    ? paymentMethodLabel(sale.payments[0].payment_method)
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(sale.total))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 border-t border-[#E2E8F0]">
                        <Pagination
                            links={transactions.links}
                            from={transactions.from}
                            to={transactions.to}
                            total={transactions.total}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

ReportSales.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Laporan Penjualan', href: '/reports/sales' },
    ],
};
