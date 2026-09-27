import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Calendar, User, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReturnItem {
    id: number;
    quantity: string;
    unit_price: string;
    subtotal: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
    };
}

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
    items: ReturnItem[];
    created_at: string;
}

interface ReturnShowProps {
    return: SaleReturn;
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

export default function ReturnShow({ return: saleReturn }: ReturnShowProps) {
    return (
        <>
            <Head title={`Retur ${saleReturn.return_number}`} />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="size-9">
                            <Link href="/returns">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[24px] font-bold text-[#0F172A]">
                                    {saleReturn.return_number}
                                </h1>
                                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                                    Selesai
                                </span>
                            </div>
                            <p className="text-sm text-[#64748B]">
                                Rincian transaksi retur barang dan pengembalian stok
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <Receipt className="size-3.5" />
                            <span>Faktur Penjualan Asal</span>
                        </div>
                        <Link
                            href={`/sales/${saleReturn.sale.id}`}
                            className="text-sm font-semibold text-[#2563EB] hover:underline"
                        >
                            {saleReturn.sale.invoice_number}
                        </Link>
                        {saleReturn.sale.customer && (
                            <p className="text-xs text-[#64748B] mt-0.5">
                                Pelanggan: {saleReturn.sale.customer.name}
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <Calendar className="size-3.5" />
                            <span>Tanggal Retur</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {formatDate(saleReturn.return_date)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <User className="size-3.5" />
                            <span>Diproses Oleh</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {saleReturn.user?.name || '-'}
                        </p>
                    </div>
                </div>

                {saleReturn.reason && (
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                        <span className="font-semibold text-[#0F172A]">Alasan Retur: </span>
                        {saleReturn.reason}
                    </div>
                )}

                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Daftar Barang yang Diretur ({saleReturn.items.length} Barang)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Produk
                                    </th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-28">
                                        Jumlah Diretur
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-40">
                                        Harga Satuan
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-44">
                                        Subtotal Pengembalian
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {saleReturn.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-[#0F172A]">
                                                {item.product?.name}
                                            </p>
                                            <p className="text-xs text-[#94A3B8]">
                                                SKU: {item.product?.sku}
                                            </p>
                                        </td>
                                        <td
                                            className="px-4 py-3 text-center text-sm font-semibold text-[#DC2626]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {item.quantity} {item.product?.unit}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right text-sm text-[#64748B]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(item.unit_price))}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right text-sm font-bold text-[#DC2626]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(item.subtotal))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-base font-bold">
                        <span className="text-[#0F172A]">Total Nilai Pengembalian:</span>
                        <span
                            className="text-xl text-[#DC2626]"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {formatRupiah(Number(saleReturn.total))}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

ReturnShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Retur Penjualan', href: '/returns' },
        { title: 'Detail Retur', href: '#' },
    ],
};
