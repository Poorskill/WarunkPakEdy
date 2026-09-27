import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, ShoppingBag, Eye, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/search-input';
import { Pagination, type PaginationLink } from '@/components/pagination';

interface Purchase {
    id: number;
    purchase_number: string;
    purchase_date: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    status: 'draft' | 'completed' | 'cancelled';
    notes: string | null;
    items_count: number;
    supplier: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

interface PurchasesProps {
    purchases: {
        data: Purchase[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
        status: string;
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

function statusBadge(status: 'draft' | 'completed' | 'cancelled'): {
    label: string;
    bg: string;
    text: string;
} {
    switch (status) {
        case 'completed':
            return { label: 'Selesai', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' };
        case 'draft':
            return { label: 'Draft', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' };
        case 'cancelled':
            return { label: 'Dibatalkan', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' };
        default:
            return { label: status, bg: 'bg-neutral-100', text: 'text-neutral-700' };
    }
}

export default function PurchasesIndex({ purchases, filters }: PurchasesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const applyFilters = (newSearch: string, newStatus: string) => {
        router.get(
            '/purchases',
            {
                search: newSearch,
                status: newStatus === 'all' ? '' : newStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        applyFilters(val, status);
    };

    const handleStatusChange = (val: string) => {
        setStatus(val);
        applyFilters(search, val);
    };

    return (
        <>
            <Head title="Data Pembelian Barang" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Pembelian Barang
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Kelola pesanan restock dan pembelian barang dari supplier
                        </p>
                    </div>
                    <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold">
                        <Link href="/purchases/create">
                            <Plus className="size-4 mr-1.5" />
                            Catat Pembelian Baru
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari nomor PO atau nama supplier..."
                            className="w-full sm:max-w-xs"
                        />

                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-40 h-9 text-xs">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {purchases.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Truck className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada transaksi pembelian
                            </p>
                            <p className="text-xs text-[#94A3B8] mb-4">
                                Catat faktur restock barang dari distributor atau supplier Anda
                            </p>
                            <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white text-xs">
                                <Link href="/purchases/create">
                                    <Plus className="size-3.5 mr-1" />
                                    Tambah Pembelian
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            No. Pembelian
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Supplier
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Item
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Nominal
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases.data.map((p) => {
                                        const badge = statusBadge(p.status);
                                        return (
                                            <tr
                                                key={p.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                                    {p.purchase_number}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#64748B]">
                                                    {formatDate(p.purchase_date)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-[#0F172A]">
                                                        {p.supplier.name}
                                                    </p>
                                                    <p className="text-xs text-[#94A3B8]">
                                                        Oleh: {p.user.name}
                                                    </p>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {p.items_count} jenis
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {formatRupiah(Number(p.total))}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="size-8 text-[#64748B] hover:text-[#047857]"
                                                        title="Lihat Detail"
                                                    >
                                                        <Link href={`/purchases/${p.id}`}>
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-4 border-t border-[#E2E8F0]">
                        <Pagination
                            links={purchases.links}
                            from={purchases.from}
                            to={purchases.to}
                            total={purchases.total}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

PurchasesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pembelian', href: '/purchases' },
    ],
};
