import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Boxes,
    PackageSearch,
    AlertTriangle,
    XCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { Pagination, type PaginationLink } from '@/components/pagination';

interface Category {
    id: number;
    name: string;
}

interface ProductWithAsset {
    id: number;
    sku: string;
    barcode: string | null;
    name: string;
    purchase_price: string;
    selling_price: string;
    stock: string;
    minimum_stock: string;
    unit: string;
    asset_value: string;
    category: Category | null;
}

interface ReportStockProps {
    metrics: {
        totalAssetValue: number;
        totalPhysicalStock: number;
        lowStockCount: number;
        outOfStockCount: number;
        totalStockIn: number;
        totalStockOut: number;
    };
    products: {
        data: ProductWithAsset[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    categories: Category[];
    filters: {
        start_date: string;
        end_date: string;
        category_id: string;
        stock_status: string;
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

export default function ReportStock({
    metrics,
    products,
    categories,
    filters,
}: ReportStockProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');

    const applyFilters = (
        start: string,
        end: string,
        cat: string,
        status: string
    ) => {
        router.get(
            '/reports/stock',
            {
                start_date: start,
                end_date: end,
                category_id: cat === 'all' ? '' : cat,
                stock_status: status === 'all' ? '' : status,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleDateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(startDate, endDate, categoryId, stockStatus);
    };

    const handleCategoryChange = (val: string) => {
        setCategoryId(val);
        applyFilters(startDate, endDate, val, stockStatus);
    };

    const handleStatusChange = (val: string) => {
        setStockStatus(val);
        applyFilters(startDate, endDate, categoryId, val);
    };

    const getStockStatus = (stock: number, minStock: number): 'normal' | 'menipis' | 'habis' => {
        if (stock <= 0) return 'habis';
        if (stock <= minStock) return 'menipis';
        return 'normal';
    };

    return (
        <>
            <Head title="Laporan Stok & Inventori" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                        Laporan Stok Barang
                    </h1>
                    <p className="text-sm text-[#64748B]">
                        Valuasi aset inventori, ringkasan mutasi barang masuk/keluar, dan status ketersediaan
                    </p>
                </div>

                {/* Filter Toolbar */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 flex flex-wrap items-center justify-between gap-3">
                    <form onSubmit={handleDateSubmit} className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#64748B]">Periode Mutasi:</span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-36 h-8 text-xs"
                        />
                        <span className="text-xs text-[#64748B]">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-36 h-8 text-xs"
                        />
                        <Button type="submit" size="sm" className="h-8 text-xs bg-[#047857] hover:bg-[#065F46] text-white">
                            Filter
                        </Button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={categoryId} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-40 h-8 text-xs">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={stockStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue placeholder="Status Stok" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Menipis</SelectItem>
                                <SelectItem value="out">Habis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#EFF6FF]">
                            <DollarSign className="size-5 text-[#2563EB]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Nilai Aset Stok</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(metrics.totalAssetValue)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ECFDF5]">
                            <Boxes className="size-5 text-[#047857]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Unit Stok Fisik</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.totalPhysicalStock} Unit
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF3C7]">
                            <AlertTriangle className="size-5 text-[#D97706]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Produk Menipis</p>
                            <p className="text-lg font-bold text-[#D97706]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.lowStockCount} Produk
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEE2E2]">
                            <XCircle className="size-5 text-[#DC2626]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Produk Habis</p>
                            <p className="text-lg font-bold text-[#DC2626]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.outOfStockCount} Produk
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stock Movement Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5]">
                        <div className="flex items-center gap-3">
                            <ArrowUpCircle className="size-8 text-[#047857]" />
                            <div>
                                <p className="text-xs font-semibold text-[#047857]">Total Mutasi Masuk (Restock/Retur)</p>
                                <p className="text-xl font-extrabold text-[#047857] mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    +{metrics.totalStockIn} Unit
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2]">
                        <div className="flex items-center gap-3">
                            <ArrowDownCircle className="size-8 text-[#DC2626]" />
                            <div>
                                <p className="text-xs font-semibold text-[#DC2626]">Total Mutasi Keluar (Terjual)</p>
                                <p className="text-xl font-extrabold text-[#DC2626] mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    -{metrics.totalStockOut} Unit
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Valuation Table */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Valuasi Stok Produk
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Produk
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Harga Modal (Beli)
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Stok
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Nilai Aset Modal
                                    </th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((p) => {
                                    const stockNum = Number(p.stock);
                                    const minStockNum = Number(p.minimum_stock);
                                    const status = getStockStatus(stockNum, minStockNum);

                                    return (
                                        <tr
                                            key={p.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-[#0F172A]">
                                                    {p.name}
                                                </p>
                                                <p className="text-xs text-[#94A3B8]">
                                                    SKU: {p.sku}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#64748B]">
                                                {p.category?.name || '-'}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(p.purchase_price))}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {stockNum} {p.unit}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold text-[#047857]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(p.asset_value))}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={status} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 border-t border-[#E2E8F0]">
                        <Pagination
                            links={products.links}
                            from={products.from}
                            to={products.to}
                            total={products.total}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

ReportStock.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Laporan Stok', href: '/reports/stock' },
    ],
};
