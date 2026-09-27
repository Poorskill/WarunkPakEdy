import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ReturnItemHistory {
    id: number;
    quantity: string;
}

interface SaleItem {
    id: number;
    product_id: number;
    product_name: string;
    sku: string;
    quantity: string;
    unit_price: string;
    return_items?: ReturnItemHistory[];
    product: {
        id: number;
        name: string;
        unit: string;
    };
}

interface SelectedSale {
    id: number;
    invoice_number: string;
    sale_date: string;
    total: string;
    customer: { id: number; name: string } | null;
    user: { id: number; name: string };
    items: SaleItem[];
}

interface SaleOption {
    id: number;
    invoice_number: string;
    total: string;
    customer: { id: number; name: string } | null;
}

interface ReturnCreateProps {
    selectedSale: SelectedSale | null;
    completedSales: SaleOption[];
}

interface ReturnItemRow {
    sale_item_id: number;
    product_name: string;
    unit: string;
    unit_price: number;
    purchased_qty: number;
    already_returned_qty: number;
    max_returnable: number;
    return_qty: string;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function ReturnCreate({ selectedSale, completedSales }: ReturnCreateProps) {
    const [saleId, setSaleId] = useState<string>(
        selectedSale ? selectedSale.id.toString() : ''
    );
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [itemRows, setItemRows] = useState<ReturnItemRow[]>(() => {
        if (!selectedSale) return [];
        return selectedSale.items.map((item) => {
            const purchased = Number(item.quantity) || 0;
            const already =
                item.return_items?.reduce(
                    (acc, r) => acc + (Number(r.quantity) || 0),
                    0
                ) || 0;
            const max = Math.max(0, purchased - already);

            return {
                sale_item_id: item.id,
                product_name: item.product_name,
                unit: item.product?.unit || 'pcs',
                unit_price: Number(item.unit_price) || 0,
                purchased_qty: purchased,
                already_returned_qty: already,
                max_returnable: max,
                return_qty: '0',
            };
        });
    });

    const handleSelectSale = (id: string) => {
        setSaleId(id);
        router.get(
            '/returns/create',
            { sale_id: id },
            { preserveState: false }
        );
    };

    const handleQtyChange = (saleItemId: number, val: string) => {
        setItemRows((prev) =>
            prev.map((row) => {
                if (row.sale_item_id === saleItemId) {
                    const numVal = Number(val);
                    if (numVal > row.max_returnable) {
                        toast.error(
                            `Maksimal retur untuk ${row.product_name} adalah ${row.max_returnable} ${row.unit}.`
                        );
                        return { ...row, return_qty: row.max_returnable.toString() };
                    }
                    return { ...row, return_qty: val };
                }
                return row;
            })
        );
    };

    const totalRefund = itemRows.reduce((acc, row) => {
        const qty = Number(row.return_qty) || 0;
        return acc + qty * row.unit_price;
    }, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSale) {
            toast.error('Pilih faktur penjualan terlebih dahulu.');
            return;
        }

        const validItems = itemRows
            .filter((row) => Number(row.return_qty) > 0)
            .map((row) => ({
                sale_item_id: row.sale_item_id,
                quantity: Number(row.return_qty),
            }));

        if (validItems.length === 0) {
            toast.error('Masukkan jumlah retur minimal pada salah satu produk.');
            return;
        }

        if (!reason.trim()) {
            toast.error('Alasan retur wajib diisi.');
            return;
        }

        setIsSubmitting(true);

        router.post(
            '/returns',
            {
                sale_id: selectedSale.id,
                reason,
                items: validItems,
            },
            {
                onSuccess: () => {
                    toast.success('Transaksi retur berhasil diproses.');
                },
                onError: (err) => {
                    const msg = Object.values(err)[0] || 'Gagal memproses retur.';
                    toast.error(msg as string);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <>
            <Head title="Proses Retur Penjualan" />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-9">
                        <Link href="/returns">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-[24px] font-bold text-[#0F172A]">
                            Proses Retur Penjualan
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Pilih faktur penjualan dan tentukan jumlah barang yang dikembalikan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Selector */}
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 space-y-4">
                        <h2 className="text-base font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                            Pilih Faktur Penjualan
                        </h2>

                        <div className="max-w-md">
                            <Label htmlFor="sale-select">Nomor Faktur / Invoice *</Label>
                            <Select value={saleId} onValueChange={handleSelectSale}>
                                <SelectTrigger id="sale-select" className="mt-1">
                                    <SelectValue placeholder="Pilih Faktur Penjualan Selesai" />
                                </SelectTrigger>
                                <SelectContent>
                                    {completedSales.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.invoice_number} ({formatRupiah(Number(s.total))}) - {s.customer?.name || 'Pelanggan Umum'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedSale && (
                            <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="text-[#64748B]">No. Invoice:</span>
                                    <p className="font-semibold text-[#0F172A] mt-0.5">
                                        {selectedSale.invoice_number}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[#64748B]">Pelanggan:</span>
                                    <p className="font-semibold text-[#0F172A] mt-0.5">
                                        {selectedSale.customer?.name || 'Pelanggan Umum'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[#64748B]">Total Nilai Faktur:</span>
                                    <p className="font-semibold text-[#047857] mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {formatRupiah(Number(selectedSale.total))}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedSale && (
                        <>
                            {/* Return Items Table */}
                            <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                                <div className="p-4 border-b border-[#E2E8F0]">
                                    <h2 className="text-base font-semibold text-[#0F172A]">
                                        Pilih Barang yang Diretur
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
                                                    Dibeli
                                                </th>
                                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                                    Sudah Diretur
                                                </th>
                                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                                    Maks. Retur
                                                </th>
                                                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-36">
                                                    Qty Diretur *
                                                </th>
                                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-36">
                                                    Subtotal Retur
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemRows.map((row) => {
                                                const rowQty = Number(row.return_qty) || 0;
                                                const rowSubtotal = rowQty * row.unit_price;
                                                const isExhausted = row.max_returnable <= 0;

                                                return (
                                                    <tr
                                                        key={row.sale_item_id}
                                                        className={`border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] ${
                                                            isExhausted ? 'opacity-50' : ''
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-medium text-[#0F172A]">
                                                                {row.product_name}
                                                            </p>
                                                            <p className="text-xs text-[#94A3B8]">
                                                                Harga: {formatRupiah(row.unit_price)}
                                                            </p>
                                                        </td>
                                                        <td
                                                            className="px-4 py-3 text-right text-sm text-[#0F172A]"
                                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                                        >
                                                            {row.purchased_qty} {row.unit}
                                                        </td>
                                                        <td
                                                            className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                                        >
                                                            {row.already_returned_qty} {row.unit}
                                                        </td>
                                                        <td
                                                            className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                                        >
                                                            {row.max_returnable} {row.unit}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={row.max_returnable}
                                                                step="any"
                                                                disabled={isExhausted}
                                                                value={row.return_qty}
                                                                onChange={(e) =>
                                                                    handleQtyChange(row.sale_item_id, e.target.value)
                                                                }
                                                                className="w-24 h-8 text-center text-sm font-bold text-[#DC2626] mx-auto"
                                                            />
                                                        </td>
                                                        <td
                                                            className="px-4 py-3 text-right text-sm font-bold text-[#DC2626]"
                                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                                        >
                                                            {formatRupiah(rowSubtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Reason & Total Refund */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-2">
                                    <Label htmlFor="return-reason">Alasan Retur Barang *</Label>
                                    <Input
                                        id="return-reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Contoh: Barang cacat pabrik / kemasan rusak / salah varian"
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-3">
                                    <div className="flex justify-between items-center text-sm text-[#64748B]">
                                        <span>Total Nilai Pengembalian:</span>
                                        <span
                                            className="text-2xl font-extrabold text-[#DC2626]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(totalRefund)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#94A3B8]">
                                        Stok fisik barang yang diretur akan otomatis ditambahkan kembali ke inventori toko.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Button variant="outline" asChild>
                                    <Link href="/returns">Batal</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || totalRefund <= 0}
                                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold"
                                >
                                    <RotateCcw className="size-4 mr-1.5" />
                                    {isSubmitting ? 'Memproses Retur...' : 'Konfirmasi & Simpan Retur'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </>
    );
}

ReturnCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Retur Penjualan', href: '/returns' },
        { title: 'Proses Retur Baru', href: '#' },
    ],
};
