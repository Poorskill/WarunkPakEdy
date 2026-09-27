import { useState, useId } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Save, ShoppingCart, CheckCircle2 } from 'lucide-react';
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

interface Supplier {
    id: number;
    name: string;
    phone: string | null;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    unit: string;
    purchase_price: string;
    stock: string;
}

interface PurchaseCreateProps {
    suppliers: Supplier[];
    products: Product[];
}

interface PurchaseItemRow {
    rowId: string;
    product_id: string;
    quantity: string;
    purchase_price: string;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function PurchaseCreate({ suppliers = [], products = [] }: PurchaseCreateProps) {
    const today = new Date().toISOString().split('T')[0];

    const [supplierId, setSupplierId] = useState(
        (suppliers || []).length > 0 ? suppliers[0].id.toString() : ''
    );
    const [purchaseDate, setPurchaseDate] = useState(today);
    const [status, setStatus] = useState<'completed' | 'draft'>('completed');
    const [discount, setDiscount] = useState('0');
    const [tax, setTax] = useState('0');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [items, setItems] = useState<PurchaseItemRow[]>(() => {
        const firstProd = (products || [])[0];
        return [
            {
                rowId: '1',
                product_id: firstProd ? firstProd.id.toString() : '',
                quantity: '1',
                purchase_price: firstProd ? firstProd.purchase_price : '0',
            },
        ];
    });

    const addRow = () => {
        const firstProd = (products || [])[0];
        setItems((prev) => [
            ...prev,
            {
                rowId: Math.random().toString(),
                product_id: firstProd ? firstProd.id.toString() : '',
                quantity: '1',
                purchase_price: firstProd ? firstProd.purchase_price : '0',
            },
        ]);
    };

    const removeRow = (rowId: string) => {
        if (items.length <= 1) {
            toast.error('Pembelian minimal harus memiliki 1 item barang.');
            return;
        }
        setItems((prev) => prev.filter((item) => item.rowId !== rowId));
    };

    const handleProductChange = (rowId: string, prodId: string) => {
        const prod = products.find((p) => p.id.toString() === prodId);
        setItems((prev) =>
            prev.map((item) =>
                item.rowId === rowId
                    ? {
                          ...item,
                          product_id: prodId,
                          purchase_price: prod ? prod.purchase_price : '0',
                      }
                    : item
            )
        );
    };

    const handleQuantityChange = (rowId: string, val: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.rowId === rowId ? { ...item, quantity: val } : item
            )
        );
    };

    const handlePriceChange = (rowId: string, val: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.rowId === rowId ? { ...item, purchase_price: val } : item
            )
        );
    };

    // Calculation
    const subtotal = items.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.purchase_price) || 0;
        return acc + qty * price;
    }, 0);

    const discountAmount = Number(discount) || 0;
    const taxAmount = Number(tax) || 0;
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!supplierId) {
            toast.error('Pilih supplier terlebih dahulu.');
            return;
        }

        if (items.length === 0) {
            toast.error('Tambahkan minimal 1 item barang.');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            supplier_id: Number(supplierId),
            purchase_date: purchaseDate,
            status,
            discount: discountAmount,
            tax: taxAmount,
            notes: notes || null,
            items: items.map((i) => ({
                product_id: Number(i.product_id),
                quantity: Number(i.quantity) || 0,
                purchase_price: Number(i.purchase_price) || 0,
            })),
        };

        router.post('/purchases', payload, {
            onSuccess: () => {
                toast.success('Transaksi pembelian berhasil disimpan');
            },
            onError: (err) => {
                toast.error('Periksa kembali isian form pembelian');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Catat Pembelian Baru" />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="size-9">
                        <Link href="/purchases">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-[24px] font-bold text-[#0F172A]">
                            Catat Pembelian Barang
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Pencatatan restock barang dari supplier ke inventori toko
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Info */}
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 space-y-4">
                        <h2 className="text-base font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                            Informasi Transaksi & Supplier
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="supplier-select">Supplier *</Label>
                                <Select value={supplierId} onValueChange={setSupplierId}>
                                    <SelectTrigger id="supplier-select" className="mt-1">
                                        <SelectValue placeholder="Pilih Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="purchase-date">Tanggal Pembelian *</Label>
                                <Input
                                    id="purchase-date"
                                    type="date"
                                    value={purchaseDate}
                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Status Transaksi *</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('completed')}
                                        className={`p-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                                            status === 'completed'
                                                ? 'bg-[#ECFDF5] border-[#047857] text-[#047857]'
                                                : 'border-[#CBD5E1] text-[#64748B] hover:bg-neutral-50'
                                        }`}
                                    >
                                        Selesai (+Stok)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('draft')}
                                        className={`p-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                                            status === 'draft'
                                                ? 'bg-[#FEF3C7] border-[#D97706] text-[#B45309]'
                                                : 'border-[#CBD5E1] text-[#64748B] hover:bg-neutral-50'
                                        }`}
                                    >
                                        Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                            <h2 className="text-base font-semibold text-[#0F172A]">
                                Rincian Barang yang Dibeli
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                className="text-xs text-[#047857] border-[#A7F3D0] hover:bg-[#ECFDF5]"
                            >
                                <Plus className="size-3.5 mr-1" />
                                Tambah Baris
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] min-w-64">
                                            Produk
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-28">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-40">
                                            Harga Beli (Rp)
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-40">
                                            Subtotal
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-16">
                                            Hapus
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const prod = (products || []).find(
                                            (p) => p.id.toString() === item.product_id
                                        );
                                        const rowQty = Number(item.quantity) || 0;
                                        const rowPrice = Number(item.purchase_price) || 0;
                                        const rowSubtotal = rowQty * rowPrice;

                                        return (
                                            <tr
                                                key={item.rowId}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3">
                                                    <Select
                                                        value={item.product_id}
                                                        onValueChange={(val) =>
                                                            handleProductChange(item.rowId, val)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9 text-xs">
                                                            <SelectValue placeholder="Pilih Produk" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map((p) => (
                                                                <SelectItem
                                                                    key={p.id}
                                                                    value={p.id.toString()}
                                                                >
                                                                    {p.name} ({p.sku})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {prod && (
                                                        <p className="text-[11px] text-[#94A3B8] mt-1 pl-1">
                                                            Stok saat ini: {prod.stock} {prod.unit}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min="0.001"
                                                            step="any"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    item.rowId,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-9 w-20 text-center text-xs font-semibold"
                                                            required
                                                        />
                                                        <span className="text-xs text-[#64748B]">
                                                            {prod?.unit || ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="100"
                                                        value={item.purchase_price}
                                                        onChange={(e) =>
                                                            handlePriceChange(
                                                                item.rowId,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-9 text-right text-xs"
                                                        required
                                                    />
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {formatRupiah(rowSubtotal)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRow(item.rowId)}
                                                        className="size-8 text-[#94A3B8] hover:text-[#DC2626]"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-2">
                            <Label htmlFor="purchase-notes">Catatan Pembelian (Opsional)</Label>
                            <Input
                                id="purchase-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Faktur No. INV-IND-881, tempo 14 hari"
                                className="mt-1"
                            />
                        </div>

                        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-3">
                            <div className="flex justify-between text-sm text-[#64748B]">
                                <span>Subtotal</span>
                                <span
                                    className="font-medium text-[#0F172A]"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {formatRupiah(subtotal)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-[#64748B]">
                                <span>Potongan Diskon (Rp)</span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-32 h-8 text-right text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm text-[#64748B]">
                                <span>Pajak / PPN (Rp)</span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={tax}
                                    onChange={(e) => setTax(e.target.value)}
                                    className="w-32 h-8 text-right text-xs"
                                />
                            </div>

                            <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-center">
                                <span className="font-bold text-[#0F172A]">Total Pembelian</span>
                                <span
                                    className="text-xl font-bold text-[#047857]"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {formatRupiah(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/purchases">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                        >
                            <Save className="size-4 mr-1.5" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Pembelian'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PurchaseCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pembelian', href: '/purchases' },
        { title: 'Catat Pembelian Baru', href: '#' },
    ],
};
