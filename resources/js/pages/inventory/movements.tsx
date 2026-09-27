import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, History, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
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

interface Movement {
    id: number;
    product_id: number;
    user_id: number;
    type: string;
    quantity: string;
    stock_before: string;
    stock_after: string;
    reference_type: string | null;
    reference_id: number | null;
    notes: string | null;
    created_at: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
        category: { id: number; name: string } | null;
    };
    user: {
        id: number;
        name: string;
    };
}

interface MovementsProps {
    movements: {
        data: Movement[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
        type: string;
    };
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

function movementBadge(type: string): { label: string; bg: string; text: string } {
    switch (type) {
        case 'purchase':
            return { label: 'Pembelian', bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' };
        case 'sale':
            return { label: 'Penjualan', bg: 'bg-[#ECFDF5]', text: 'text-[#047857]' };
        case 'return':
            return { label: 'Retur', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' };
        case 'adjustment':
            return { label: 'Penyesuaian', bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]' };
        case 'opname':
            return { label: 'Stock Opname', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' };
        default:
            return { label: type, bg: 'bg-neutral-100', text: 'text-neutral-700' };
    }
}

export default function InventoryMovements({ movements, filters }: MovementsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');

    const applyFilters = (newSearch: string, newType: string) => {
        router.get(
            '/inventory/movements',
            {
                search: newSearch,
                type: newType === 'all' ? '' : newType,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        applyFilters(val, type);
    };

    const handleTypeChange = (val: string) => {
        setType(val);
        applyFilters(search, val);
    };

    return (
        <>
            <Head title="Riwayat Pergerakan Stok" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-9">
                        <Link href="/inventory">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Riwayat Pergerakan Stok
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Audit trail perubahan stok dari penjualan, pembelian, penyesuaian, dan opname
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari produk, SKU, atau catatan..."
                            className="w-full sm:max-w-xs"
                        />

                        <Select value={type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-44 h-9 text-xs">
                                <SelectValue placeholder="Semua Jenis Pergerakan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis Pergerakan</SelectItem>
                                <SelectItem value="purchase">Pembelian</SelectItem>
                                <SelectItem value="sale">Penjualan</SelectItem>
                                <SelectItem value="return">Retur</SelectItem>
                                <SelectItem value="adjustment">Penyesuaian</SelectItem>
                                <SelectItem value="opname">Stock Opname</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {movements.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <History className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada riwayat pergerakan stok
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Setiap transaksi yang mengubah stok akan otomatis tercatat di sini
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Waktu
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Produk
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Jenis
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Sebelum
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Perubahan
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Sesudah
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Dicatat Oleh
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Keterangan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.data.map((m) => {
                                        const badge = movementBadge(m.type);
                                        const qty = Number(m.quantity);
                                        const isPositive = qty > 0;

                                        return (
                                            <tr
                                                key={m.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                                                    {formatDate(m.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-[#0F172A]">
                                                        {m.product.name}
                                                    </p>
                                                    <p className="text-xs text-[#94A3B8]">
                                                        {m.product.sku}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-xs text-[#64748B]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {m.stock_before} {m.product.unit}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    <span
                                                        className={
                                                            isPositive
                                                                ? 'text-[#16A34A]'
                                                                : 'text-[#DC2626]'
                                                        }
                                                    >
                                                        {isPositive ? `+${qty}` : qty} {m.product.unit}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {m.stock_after} {m.product.unit}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#0F172A]">
                                                    {m.user?.name || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#64748B] max-w-xs truncate">
                                                    {m.notes || m.reference_type || '-'}
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
                            links={movements.links}
                            from={movements.from}
                            to={movements.to}
                            total={movements.total}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

InventoryMovements.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventori', href: '/inventory' },
        { title: 'Pergerakan Stok', href: '/inventory/movements' },
    ],
};
