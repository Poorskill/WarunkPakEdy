import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle, Calendar, Truck, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PurchaseItem {
    id: number;
    quantity: string;
    purchase_price: string;
    subtotal: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
    };
}

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
    supplier: {
        id: number;
        name: string;
        phone: string | null;
        address: string | null;
    };
    user: {
        id: number;
        name: string;
    };
    items: PurchaseItem[];
    created_at: string;
}

interface PurchaseShowProps {
    purchase: Purchase;
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
            return { label: 'Selesai (+Stok Masuk)', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' };
        case 'draft':
            return { label: 'Draft (Belum Masuk Stok)', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' };
        case 'cancelled':
            return { label: 'Dibatalkan', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' };
        default:
            return { label: status, bg: 'bg-neutral-100', text: 'text-neutral-700' };
    }
}

export default function PurchaseShow({ purchase }: PurchaseShowProps) {
    const badge = statusBadge(purchase.status);

    const handleComplete = () => {
        router.post(`/purchases/${purchase.id}/complete`, {}, {
            onSuccess: () => {
                toast.success('Pembelian diselesaikan dan stok telah ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menyelesaikan pembelian');
            },
        });
    };

    const handleCancel = () => {
        router.post(`/purchases/${purchase.id}/cancel`, {}, {
            onSuccess: () => {
                toast.success('Draft pembelian dibatalkan');
            },
            onError: () => {
                toast.error('Gagal membatalkan pembelian');
            },
        });
    };

    return (
        <>
            <Head title={`Detail ${purchase.purchase_number}`} />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="size-9">
                            <Link href="/purchases">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[24px] font-bold text-[#0F172A]">
                                    {purchase.purchase_number}
                                </h1>
                                <span
                                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <p className="text-sm text-[#64748B]">
                                Rincian faktur pembelian barang dari supplier
                            </p>
                        </div>
                    </div>

                    {purchase.status === 'draft' && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="text-xs text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]"
                            >
                                <XCircle className="size-4 mr-1.5" />
                                Batalkan Draft
                            </Button>
                            <Button
                                onClick={handleComplete}
                                className="bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold"
                            >
                                <CheckCircle2 className="size-4 mr-1.5" />
                                Selesaikan & Tambah Stok
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <Truck className="size-3.5" />
                            <span>Supplier</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {purchase.supplier.name}
                        </p>
                        {purchase.supplier.phone && (
                            <p className="text-xs text-[#64748B] mt-0.5">{purchase.supplier.phone}</p>
                        )}
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <Calendar className="size-3.5" />
                            <span>Tanggal Pembelian</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {formatDate(purchase.purchase_date)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <User className="size-3.5" />
                            <span>Dicatat Oleh</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {purchase.user.name}
                        </p>
                    </div>
                </div>

                {purchase.notes && (
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                        <span className="font-semibold text-[#0F172A]">Catatan: </span>
                        {purchase.notes}
                    </div>
                )}

                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Daftar Barang yang Diterima ({purchase.items.length} Item)
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
                                        Jumlah
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-40">
                                        Harga Beli Satuan
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-44">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase.items.map((item) => (
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
                                            className="px-4 py-3 text-center text-sm font-semibold text-[#0F172A]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {item.quantity} {item.product.unit}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right text-sm text-[#64748B]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(item.purchase_price))}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(item.subtotal))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col items-end gap-1 text-sm text-[#64748B]">
                        <div className="flex justify-between w-64">
                            <span>Subtotal:</span>
                            <span
                                className="font-semibold text-[#0F172A]"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {formatRupiah(Number(purchase.subtotal))}
                            </span>
                        </div>
                        {Number(purchase.discount) > 0 && (
                            <div className="flex justify-between w-64 text-[#DC2626]">
                                <span>Diskon:</span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    -{formatRupiah(Number(purchase.discount))}
                                </span>
                            </div>
                        )}
                        {Number(purchase.tax) > 0 && (
                            <div className="flex justify-between w-64">
                                <span>Pajak (PPN):</span>
                                <span
                                    className="font-medium text-[#0F172A]"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    +{formatRupiah(Number(purchase.tax))}
                                </span>
                            </div>
                        )}
                        <div className="border-t border-[#E2E8F0] pt-2 mt-1 flex justify-between w-64 text-base font-bold text-[#047857]">
                            <span>Total Akhir:</span>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(Number(purchase.total))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

PurchaseShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pembelian', href: '/purchases' },
        { title: 'Detail', href: '#' },
    ],
};
