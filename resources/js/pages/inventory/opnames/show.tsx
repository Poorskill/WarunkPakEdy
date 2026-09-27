import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpnameItem {
    id: number;
    system_stock: string;
    actual_stock: string;
    difference: string;
    notes: string | null;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
        category: { id: number; name: string } | null;
    };
}

interface StockOpname {
    id: number;
    opname_number: string;
    opname_date: string;
    status: string;
    notes: string | null;
    user: {
        id: number;
        name: string;
    };
    items: OpnameItem[];
    created_at: string;
}

interface OpnameShowProps {
    opname: StockOpname;
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

export default function StockOpnameShow({ opname }: OpnameShowProps) {
    const totalAdjusted = opname.items.filter((i) => Number(i.difference) !== 0).length;

    return (
        <>
            <Head title={`Detail ${opname.opname_number}`} />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-9">
                        <Link href="/stock-opnames">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[24px] font-bold text-[#0F172A]">
                                {opname.opname_number}
                            </h1>
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                                Selesai
                            </span>
                        </div>
                        <p className="text-sm text-[#64748B]">
                            Detail hasil rekonsiliasi stok fisik dan penyesuaian sistem
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <Calendar className="size-3.5" />
                            <span>Waktu Pelaksanaan</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {formatDate(opname.opname_date)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <User className="size-3.5" />
                            <span>Petugas Pelaksana</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {opname.user?.name || '-'}
                        </p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <FileText className="size-3.5" />
                            <span>Ringkasan Selisih</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {totalAdjusted} dari {opname.items.length} item berselisih
                        </p>
                    </div>
                </div>

                {opname.notes && (
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                        <span className="font-semibold text-[#0F172A]">Catatan: </span>
                        {opname.notes}
                    </div>
                )}

                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Rincian Item Produk
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Produk
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Stok Sistem
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Stok Fisik
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Selisih
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Keterangan
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {opname.items.map((item) => {
                                    const diff = Number(item.difference);
                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-[#0F172A]">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-xs text-[#94A3B8]">
                                                    SKU: {item.product.sku}
                                                </p>
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {item.system_stock} {item.product.unit}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {item.actual_stock} {item.product.unit}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-bold"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {diff === 0 ? (
                                                    <span className="text-[#94A3B8]">0</span>
                                                ) : diff > 0 ? (
                                                    <span className="text-[#16A34A]">
                                                        +{diff} {item.product.unit}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#DC2626]">
                                                        {diff} {item.product.unit}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#64748B]">
                                                {item.notes || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

StockOpnameShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventori', href: '/inventory' },
        { title: 'Stock Opname', href: '/stock-opnames' },
        { title: 'Detail', href: '#' },
    ],
};
