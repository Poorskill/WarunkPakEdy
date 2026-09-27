import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, ClipboardCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, type PaginationLink } from '@/components/pagination';

interface OpnameItem {
    id: number;
    product: {
        id: number;
        name: string;
    };
}

interface StockOpname {
    id: number;
    opname_number: string;
    opname_date: string;
    status: string;
    notes: string | null;
    items_count: number;
    user: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface OpnamesIndexProps {
    opnames: {
        data: StockOpname[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
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

export default function StockOpnameIndex({ opnames }: OpnamesIndexProps) {
    return (
        <>
            <Head title="Stock Opname" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="size-9">
                            <Link href="/inventory">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                                Stock Opname
                            </h1>
                            <p className="text-sm text-[#64748B]">
                                Riwayat pemeriksaan dan rekonsiliasi stok fisik toko
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold">
                        <Link href="/stock-opnames/create">
                            <Plus className="size-4 mr-1.5" />
                            Buat Stock Opname
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    {opnames.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <ClipboardCheck className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada riwayat stock opname
                            </p>
                            <p className="text-xs text-[#94A3B8] mb-4">
                                Lakukan penghitungan fisik untuk menyamakan stok toko dengan sistem
                            </p>
                            <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white text-xs">
                                <Link href="/stock-opnames/create">
                                    <Plus className="size-3.5 mr-1" />
                                    Mulai Stock Opname
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            No. Opname
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Tanggal Pelaksanaan
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Petugas
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Item Diperiksa
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Catatan
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-24">
                                            Detail
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opnames.data.map((o) => (
                                        <tr
                                            key={o.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                                {o.opname_number}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#64748B]">
                                                {formatDate(o.opname_date)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#0F172A]">
                                                {o.user?.name || '-'}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {o.items_count} produk
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                                                    Selesai
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#64748B] max-w-xs truncate">
                                                {o.notes || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    className="size-8 text-[#64748B] hover:text-[#047857]"
                                                    title="Lihat Detail"
                                                >
                                                    <Link href={`/stock-opnames/${o.id}`}>
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
                            links={opnames.links}
                            from={opnames.from}
                            to={opnames.to}
                            total={opnames.total}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

StockOpnameIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventori', href: '/inventory' },
        { title: 'Stock Opname', href: '/stock-opnames' },
    ],
};
