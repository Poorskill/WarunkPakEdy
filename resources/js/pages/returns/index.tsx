import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { RotateCcw, Plus, Eye, Receipt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search-input';
import { Pagination, type PaginationLink } from '@/components/pagination';

interface SaleReturn {
    id: number;
    return_number: string;
    return_date: string;
    reason: string | null;
    total: string;
    status: string;
    sale: {
        id: number;
        invoice_number: string;
        customer: { id: number; name: string } | null;
    };
    user: {
        id: number;
        name: string;
    };
    items_count?: number;
}

interface ReturnsIndexProps {
    returns: {
        data: SaleReturn[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
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

export default function ReturnsIndex({ returns, filters }: ReturnsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/returns',
            { search: val },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Riwayat Retur Penjualan" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Retur Penjualan
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Pencatatan pengembalian barang dari pelanggan dan pengembalian stok toko
                        </p>
                    </div>
                    <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold">
                        <Link href="/returns/create">
                            <Plus className="size-4 mr-1.5" />
                            Buat Retur Baru
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari no. retur atau no. invoice asal..."
                            className="max-w-sm"
                        />
                    </div>

                    {returns.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <RotateCcw className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada riwayat retur
                            </p>
                            <p className="text-xs text-[#94A3B8] mb-4">
                                Data retur barang yang diproses dari penjualan akan muncul di sini
                            </p>
                            <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white text-xs">
                                <Link href="/returns/create">
                                    <Plus className="size-3.5 mr-1" />
                                    Proses Retur Baru
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            No. Retur
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Faktur Asal
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Tanggal Retur
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Petugas
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Alasan Retur
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Nominal
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {returns.data.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                                {r.return_number}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#0F172A]">
                                                <Link
                                                    href={`/sales/${r.sale.id}`}
                                                    className="font-medium text-[#2563EB] hover:underline"
                                                >
                                                    {r.sale.invoice_number}
                                                </Link>
                                                {r.sale.customer && (
                                                    <p className="text-xs text-[#94A3B8]">
                                                        {r.sale.customer.name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#64748B]">
                                                {formatDate(r.return_date)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#0F172A]">
                                                {r.user?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#64748B] max-w-xs truncate">
                                                {r.reason || '-'}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold text-[#DC2626]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(Number(r.total))}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    className="size-8 text-[#64748B] hover:text-[#047857]"
                                                    title="Lihat Detail Retur"
                                                >
                                                    <Link href={`/returns/${r.id}`}>
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-4 border-t border-[#E2E8F0]">
                        <Pagination
                            links={returns.links}
                            from={returns.from}
                            to={returns.to}
                            total={returns.total}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

ReturnsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Retur Penjualan', href: '/returns' },
    ],
};
