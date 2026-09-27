import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
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

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    sku: string;
    barcode: string | null;
    name: string;
    unit: string;
    stock: string;
    minimum_stock: string;
    category: Category | null;
}

interface OpnameCreateProps {
    products: Product[];
    categories: Category[];
    selectedCategoryId: string;
}

interface ItemEntry {
    product_id: number;
    system_stock: number;
    actual_stock: string;
    notes: string;
}

export default function StockOpnameCreate({
    products,
    categories,
    selectedCategoryId,
}: OpnameCreateProps) {
    const [items, setItems] = useState<Record<number, ItemEntry>>(() => {
        const initial: Record<number, ItemEntry> = {};
        products.forEach((p) => {
            initial[p.id] = {
                product_id: p.id,
                system_stock: Number(p.stock),
                actual_stock: p.stock,
                notes: '',
            };
        });
        return initial;
    });

    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCategoryFilter = (catId: string) => {
        router.get(
            '/stock-opnames/create',
            { category_id: catId === 'all' ? '' : catId },
            { preserveState: false }
        );
    };

    const handleActualStockChange = (productId: number, val: string) => {
        setItems((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                actual_stock: val,
            },
        }));
    };

    const handleItemNoteChange = (productId: number, val: string) => {
        setItems((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                notes: val,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payloadItems = Object.values(items).map((item) => ({
            product_id: item.product_id,
            actual_stock: Number(item.actual_stock) || 0,
            notes: item.notes || null,
        }));

        router.post(
            '/stock-opnames',
            {
                notes: notes || null,
                items: payloadItems,
            },
            {
                onSuccess: () => {
                    toast.success('Stock Opname berhasil disimpan dan stok telah diperbarui');
                },
                onError: (err) => {
                    toast.error('Periksa kembali input stok fisik');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <>
            <Head title="Buat Stock Opname Baru" />
            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="size-9">
                            <Link href="/stock-opnames">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-[24px] font-bold text-[#0F172A]">
                                Form Stock Opname
                            </h1>
                            <p className="text-sm text-[#64748B]">
                                Masukkan jumlah fisik aktual dari inventori toko
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={selectedCategoryId || 'all'}
                            onValueChange={handleCategoryFilter}
                        >
                            <SelectTrigger className="w-48 h-9 text-xs">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <Label htmlFor="general-notes">Catatan Pelaksanaan (Opsional)</Label>
                        <Input
                            id="general-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: Opname rutin akhir bulan September 2026"
                            className="mt-1"
                        />
                    </div>

                    <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                        <div className="p-4 border-b border-[#E2E8F0]">
                            <h2 className="text-base font-semibold text-[#0F172A]">
                                Daftar Produk yang Diperiksa ({products.length} Item)
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Produk
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-28">
                                            Stok Sistem
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-36">
                                            Stok Fisik Aktual *
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-28">
                                            Selisih
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Catatan Selisih
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => {
                                        const entry = items[p.id];
                                        const systemStock = Number(p.stock);
                                        const actualStock = Number(entry?.actual_stock) || 0;
                                        const diff = actualStock - systemStock;

                                        return (
                                            <tr
                                                key={p.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-[#0F172A]">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-xs text-[#94A3B8]">
                                                        SKU: {p.sku} {p.category && `· ${p.category.name}`}
                                                    </p>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-semibold text-[#64748B]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {systemStock} {p.unit}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={entry?.actual_stock ?? ''}
                                                            onChange={(e) =>
                                                                handleActualStockChange(
                                                                    p.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-24 h-8 text-center text-sm font-bold text-[#0F172A]"
                                                            required
                                                        />
                                                        <span className="text-xs text-[#64748B]">
                                                            {p.unit}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {diff === 0 ? (
                                                        <span className="text-[#94A3B8]">0</span>
                                                    ) : diff > 0 ? (
                                                        <span className="text-[#16A34A]">
                                                            +{diff} {p.unit}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#DC2626]">
                                                            {diff} {p.unit}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="text"
                                                        value={entry?.notes ?? ''}
                                                        onChange={(e) =>
                                                            handleItemNoteChange(p.id, e.target.value)
                                                        }
                                                        placeholder="Alasan selisih..."
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/stock-opnames">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                        >
                            <Save className="size-4 mr-1.5" />
                            {isSubmitting ? 'Memproses Opname...' : 'Simpan & Terapkan Opname'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

StockOpnameCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventori', href: '/inventory' },
        { title: 'Stock Opname', href: '/stock-opnames' },
        { title: 'Form Baru', href: '#' },
    ],
};
