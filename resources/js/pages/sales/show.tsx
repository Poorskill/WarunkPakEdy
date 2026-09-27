import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, RotateCcw, Calendar, User, ShoppingBag, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import Logo from '@/components/logo';

interface Payment {
    id: number;
    payment_method: string;
    amount: string;
    reference_number: string | null;
}

interface SaleItem {
    id: number;
    product_name: string;
    sku: string;
    quantity: string;
    unit_price: string;
    subtotal: string;
}

interface Sale {
    id: number;
    invoice_number: string;
    sale_date: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    status: 'completed' | 'pending' | 'cancelled' | 'returned';
    notes: string | null;
    points_earned?: number;
    points_redeemed?: number;
    point_discount_amount?: string;
    member_discount_amount?: string;
    customer: {
        id: number;
        name: string;
        phone: string | null;
        formatted_phone?: string;
        is_member?: boolean;
        loyalty_points?: number;
    } | null;
    user: { id: number; name: string };
    payments: Payment[];
    items: SaleItem[];
}

interface SaleShowProps {
    sale: Sale;
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

export default function SaleShow({ sale }: SaleShowProps) {
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const payment = sale.payments[0];

    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Faktur ${sale.invoice_number}`} />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="size-9">
                            <Link href="/sales">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <Logo className="size-11 rounded-lg shrink-0" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[24px] font-bold text-[#0F172A]">
                                    {sale.invoice_number}
                                </h1>
                                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                                    {sale.status === 'completed' ? 'Lunas' : sale.status}
                                </span>
                            </div>
                            <p className="text-sm text-[#64748B]">
                                Rincian lengkap transaksi penjualan kasir
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsReceiptOpen(true)}
                            className="gap-1.5"
                        >
                            <Printer className="size-4" />
                            Cetak Struk Nota
                        </Button>
                        {sale.status === 'completed' && (
                            <Button asChild className="bg-[#D97706] hover:bg-[#B45309] text-white">
                                <Link href={`/returns/create?sale_id=${sale.id}`}>
                                    <RotateCcw className="size-4 mr-1.5" />
                                    Retur Barang
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <Calendar className="size-3.5" />
                            <span>Waktu Transaksi</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            {formatDate(sale.sale_date)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <User className="size-3.5" />
                            <span>Kasir & Pelanggan</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                            Kasir: {sale.user?.name || '-'}
                        </p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                            Pelanggan: {sale.customer?.name || 'Pelanggan Umum'}
                            {sale.customer?.phone && ` (${sale.customer.phone})`}
                        </p>
                        {sale.customer?.is_member && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-1.5 py-0.5 rounded mt-1">
                                <Star className="size-3 fill-[#EAB308] text-[#EAB308]" />
                                Member
                            </span>
                        )}
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                            <ShoppingBag className="size-3.5" />
                            <span>Metode Pembayaran</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A] uppercase">
                            {payment?.payment_method || 'Tunai'}
                        </p>
                        <p className="text-xs text-[#64748B]">
                            Nominal: {formatRupiah(Number(payment?.amount || sale.total))}
                        </p>
                    </div>
                </div>

                {/* Loyalty Info Banner if points earned/redeemed */}
                {(sale.points_earned || sale.points_redeemed) && (
                    <div className="p-3.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] flex items-center justify-between text-xs text-[#065F46]">
                        <div className="flex items-center gap-2">
                            <Star className="size-4 fill-[#EAB308] text-[#EAB308]" />
                            <span className="font-semibold">
                                Transaksi Member {sale.customer?.name}:
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {Number(sale.points_earned) > 0 && (
                                <span className="font-bold text-[#16A34A]">
                                    +{sale.points_earned} Point Diperoleh
                                </span>
                            )}
                            {Number(sale.points_redeemed) > 0 && (
                                <span className="font-bold text-[#D97706]">
                                    -{sale.points_redeemed} Point Ditukar (-{formatRupiah(Number(sale.point_discount_amount || 0))})
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Rincian Item Belanja ({sale.items.length} Barang)
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
                                        Harga Satuan
                                    </th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-44">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-[#0F172A]">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-[#94A3B8]">
                                                SKU: {item.sku}
                                            </p>
                                        </td>
                                        <td
                                            className="px-4 py-3 text-center text-sm font-semibold text-[#0F172A]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {item.quantity}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right text-sm text-[#64748B]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(Number(item.unit_price))}
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
                        <div className="flex justify-between w-72">
                            <span>Subtotal:</span>
                            <span
                                className="font-semibold text-[#0F172A]"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {formatRupiah(Number(sale.subtotal))}
                            </span>
                        </div>
                        {Number(sale.member_discount_amount || 0) > 0 && (
                            <div className="flex justify-between w-72 text-[#047857]">
                                <span className="flex items-center gap-1">
                                    <Gift className="size-3" />
                                    Diskon Member:
                                </span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    -{formatRupiah(Number(sale.member_discount_amount))}
                                </span>
                            </div>
                        )}
                        {Number(sale.point_discount_amount || 0) > 0 && (
                            <div className="flex justify-between w-72 text-[#D97706]">
                                <span className="flex items-center gap-1">
                                    <Star className="size-3" />
                                    Diskon Tukar Point:
                                </span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    -{formatRupiah(Number(sale.point_discount_amount))}
                                </span>
                            </div>
                        )}
                        {Number(sale.discount) > 0 && (
                            <div className="flex justify-between w-72 text-[#DC2626]">
                                <span>Total Diskon:</span>
                                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    -{formatRupiah(Number(sale.discount))}
                                </span>
                            </div>
                        )}
                        {Number(sale.tax) > 0 && (
                            <div className="flex justify-between w-72">
                                <span>Pajak (PPN):</span>
                                <span
                                    className="font-medium text-[#0F172A]"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    +{formatRupiah(Number(sale.tax))}
                                </span>
                            </div>
                        )}
                        <div className="border-t border-[#E2E8F0] pt-2 mt-1 flex justify-between w-72 text-base font-bold text-[#047857]">
                            <span>Total Penjualan:</span>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatRupiah(Number(sale.total))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thermal Receipt Print Modal */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-[#0F172A]">
                            Cetak Struk Nota Penjualan
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-1">
                        <div
                            id="printable-receipt"
                            className="border border-dashed border-[#CBD5E1] bg-white rounded-lg p-5 text-xs text-[#0F172A] font-mono leading-relaxed space-y-3"
                        >
                            <div className="text-center space-y-1">
                                <Logo className="size-12 rounded mx-auto mb-1" />
                                <h3 className="font-bold text-sm uppercase">WARUNK PAK EDY</h3>
                                <p className="text-[11px] text-[#64748B]">Kasir & Warung Retail</p>
                                <p className="text-[10px] text-[#94A3B8]">
                                    Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217
                                </p>
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span>No: {sale.invoice_number}</span>
                                    <span>{formatDate(sale.sale_date)}</span>
                                </div>
                                <div className="flex justify-between text-[#64748B]">
                                    <span>Kasir: {sale.user?.name || '-'}</span>
                                    <span>Pelanggan: {sale.customer?.name || 'Pelanggan Umum'}</span>
                                </div>
                                {sale.customer?.phone && (
                                    <div className="flex justify-between text-[#64748B]">
                                        <span>No. HP:</span>
                                        <span>{sale.customer.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1.5">
                                {sale.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex-1 pr-2">
                                            <p className="font-medium text-[#0F172A]">{item.product_name}</p>
                                            <p className="text-[10px] text-[#64748B]">
                                                {item.quantity} x {formatRupiah(Number(item.unit_price))}
                                            </p>
                                        </div>
                                        <span className="font-semibold text-right whitespace-nowrap">
                                            {formatRupiah(Number(item.subtotal))}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {sale.customer?.is_member && (
                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px] text-[#047857]">
                                    <div className="flex justify-between font-bold">
                                        <span>MEMBER: {sale.customer.name}</span>
                                        <span>{sale.customer.phone || ''}</span>
                                    </div>
                                    {Number(sale.points_earned) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Point Diperoleh:</span>
                                            <span>+{sale.points_earned} Point</span>
                                        </div>
                                    )}
                                    {Number(sale.points_redeemed) > 0 && (
                                        <div className="flex justify-between text-[#D97706]">
                                            <span>Point Ditukar:</span>
                                            <span>-{sale.points_redeemed} Point</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatRupiah(Number(sale.subtotal))}</span>
                                </div>
                                {Number(sale.discount) > 0 && (
                                    <div className="flex justify-between text-[#DC2626]">
                                        <span>Total Diskon:</span>
                                        <span>-{formatRupiah(Number(sale.discount))}</span>
                                    </div>
                                )}
                                {Number(sale.tax) > 0 && (
                                    <div className="flex justify-between">
                                        <span>Pajak:</span>
                                        <span>+{formatRupiah(Number(sale.tax))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-[#E2E8F0]">
                                    <span>TOTAL:</span>
                                    <span>{formatRupiah(Number(sale.total))}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span>Bayar ({payment?.payment_method?.toUpperCase() || 'TUNAI'}):</span>
                                    <span>{formatRupiah(Number(payment?.amount || sale.total))}</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-3 text-center text-[10px] text-[#64748B]">
                                <p>Terima kasih atas kunjungan Anda!</p>
                                <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsReceiptOpen(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                type="button"
                                onClick={handlePrintReceipt}
                                className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold gap-1.5"
                            >
                                <Printer className="size-4" />
                                Cetak Struk (Thermal 80mm)
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

SaleShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Penjualan', href: '/sales' },
        { title: 'Faktur', href: '#' },
    ],
};
