import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Boxes,
    Package,
    AlertTriangle,
    XCircle,
    SlidersHorizontal,
    History,
    ClipboardCheck,
    ArrowUpCircle,
    ArrowDownCircle,
} from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/status-badge';
import { Pagination, type PaginationLink } from '@/components/pagination';
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
    stock: string;
    minimum_stock: string;
    unit: string;
    category: Category | null;
}

interface InventoryProps {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    categories: Category[];
    metrics: {
        totalSkus: number;
        totalPhysicalStock: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
    filters: {
        search: string;
        category_id: string;
        stock_status: string;
    };
}

export default function InventoryIndex({
    products,
    categories,
    metrics,
    filters,
}: InventoryProps) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const role = auth?.user?.role || 'owner';
    const isOwner = role === 'owner';
    const canManage = ['owner', 'admin'].includes(role);

    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');
    const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

    const adjustForm = useForm({
        product_id: 0,
        type: 'addition' as 'addition' | 'subtraction',
        quantity: '',
        notes: '',
    });

    const applyFilters = (newSearch: string, newCat: string, newStatus: string) => {
        router.get(
            '/inventory',
            {
                search: newSearch,
                category_id: newCat === 'all' ? '' : newCat,
                stock_status: newStatus === 'all' ? '' : newStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        applyFilters(val, categoryId, stockStatus);
    };

    const handleCategoryChange = (val: string) => {
        setCategoryId(val);
        applyFilters(search, val, stockStatus);
    };

    const handleStockStatusChange = (val: string) => {
        setStockStatus(val);
        applyFilters(search, categoryId, val);
    };

    const openAdjustModal = (product: Product) => {
        setAdjustingProduct(product);
        adjustForm.setData({
            product_id: product.id,
            type: 'addition',
            quantity: '',
            notes: '',
        });
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adjustForm.post('/inventory/adjust', {
            onSuccess: () => {
                setAdjustingProduct(null);
                adjustForm.reset();
                toast.success('Penyesuaian stok berhasil diterapkan');
            },
            onError: (err) => {
                const msg = err.notes || err.quantity || 'Periksa input penyesuaian stok.';
                toast.error(msg);
            },
        });
    };

    const getStockStatus = (stock: number, minStock: number): 'normal' | 'menipis' | 'habis' => {
        if (stock <= 0) return 'habis';
        if (stock <= minStock) return 'menipis';
        return 'normal';
    };

    return (
        <>
            <Head title="Manajemen Stok & Inventori" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Manajemen Stok
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Pantau pergerakan fisik barang, stok menipis, dan penyesuaian inventori
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" asChild className="text-xs h-9">
                                <Link href="/inventory/movements">
                                    <History className="size-4 mr-1.5 text-[#2563EB]" />
                                    Riwayat Pergerakan
                                </Link>
                            </Button>
                            <Button asChild className="bg-[#047857] hover:bg-[#065F46] text-white text-xs h-9 font-semibold">
                                <Link href="/stock-opnames">
                                    <ClipboardCheck className="size-4 mr-1.5" />
                                    Stock Opname
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#EFF6FF]">
                            <Package className="size-5 text-[#2563EB]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Jenis Produk</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.totalSkus} SKU
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ECFDF5]">
                            <Boxes className="size-5 text-[#047857]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Total Unit Stok Fisik</p>
                            <p className="text-lg font-bold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.totalPhysicalStock} Unit
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF3C7]">
                            <AlertTriangle className="size-5 text-[#D97706]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Stok Menipis</p>
                            <p className="text-lg font-bold text-[#D97706]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.lowStockCount} Produk
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEE2E2]">
                            <XCircle className="size-5 text-[#DC2626]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#64748B]">Stok Habis</p>
                            <p className="text-lg font-bold text-[#DC2626]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {metrics.outOfStockCount} Produk
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table & Filters */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari nama barang, SKU, atau barcode..."
                            className="w-full md:max-w-xs"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={categoryId} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-40 h-9 text-xs">
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

                            <Select value={stockStatus} onValueChange={handleStockStatusChange}>
                                <SelectTrigger className="w-36 h-9 text-xs">
                                    <SelectValue placeholder="Status Stok" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Stok</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Menipis</SelectItem>
                                    <SelectItem value="out">Habis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Boxes className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Tidak ada data stok yang cocok
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Coba ubah kata kunci pencarian atau filter status stok
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Produk
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Stok Sistem
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Batas Minimum
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-32">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((p) => {
                                        const stock = Number(p.stock);
                                        const minStock = Number(p.minimum_stock);
                                        const status = getStockStatus(stock, minStock);

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
                                                        SKU: {p.sku} {p.barcode && `· Barcode: ${p.barcode}`}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#64748B]">
                                                    {p.category?.name || '-'}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {stock} {p.unit}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {minStock} {p.unit}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <StatusBadge status={status} />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {isOwner ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openAdjustModal(p)}
                                                            className="h-8 text-xs font-medium text-[#047857] border-[#A7F3D0] hover:bg-[#ECFDF5]"
                                                        >
                                                            <SlidersHorizontal className="size-3.5 mr-1" />
                                                            Sesuaikan
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-[#94A3B8]">-</span>
                                                    )}
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
                            links={products.links}
                            from={products.from}
                            to={products.to}
                            total={products.total}
                        />
                    </div>
                </div>
            </div>

            {/* Adjust Stock Dialog */}
            <Dialog open={!!adjustingProduct} onOpenChange={(open) => !open && setAdjustingProduct(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Penyesuaian Stok Manual</DialogTitle>
                        <DialogDescription>
                            Ubah stok fisik dan catat alasan perubahannya ke log pergerakan stok
                        </DialogDescription>
                    </DialogHeader>

                    {adjustingProduct && (
                        <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-2">
                            <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs space-y-1">
                                <p className="font-semibold text-[#0F172A]">{adjustingProduct.name}</p>
                                <div className="flex items-center justify-between text-[#64748B]">
                                    <span>SKU: {adjustingProduct.sku}</span>
                                    <span>
                                        Stok Saat Ini:{' '}
                                        <strong className="text-[#0F172A]">
                                            {adjustingProduct.stock} {adjustingProduct.unit}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label>Jenis Penyesuaian *</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => adjustForm.setData('type', 'addition')}
                                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                                            adjustForm.data.type === 'addition'
                                                ? 'bg-[#ECFDF5] border-[#047857] text-[#047857]'
                                                : 'border-[#CBD5E1] text-[#64748B] hover:bg-neutral-50'
                                        }`}
                                    >
                                        <ArrowUpCircle className="size-4" />
                                        Tambah Stok (+)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => adjustForm.setData('type', 'subtraction')}
                                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                                            adjustForm.data.type === 'subtraction'
                                                ? 'bg-[#FEF2F2] border-[#DC2626] text-[#DC2626]'
                                                : 'border-[#CBD5E1] text-[#64748B] hover:bg-neutral-50'
                                        }`}
                                    >
                                        <ArrowDownCircle className="size-4" />
                                        Kurangi Stok (-)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="adj-qty">
                                    Jumlah ({adjustingProduct.unit}) *
                                </Label>
                                <Input
                                    id="adj-qty"
                                    type="number"
                                    min="0.001"
                                    step="any"
                                    value={adjustForm.data.quantity}
                                    onChange={(e) => adjustForm.setData('quantity', e.target.value)}
                                    placeholder="Contoh: 5"
                                    className="mt-1"
                                    required
                                />
                                {adjustForm.errors.quantity && (
                                    <p className="text-xs text-[#DC2626] mt-1">{adjustForm.errors.quantity}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="adj-notes">Alasan Penyesuaian *</Label>
                                <Input
                                    id="adj-notes"
                                    value={adjustForm.data.notes}
                                    onChange={(e) => adjustForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Barang rusak / barang kedaluwarsa / selisih hitung"
                                    className="mt-1"
                                    required
                                />
                                {adjustForm.errors.notes && (
                                    <p className="text-xs text-[#DC2626] mt-1">{adjustForm.errors.notes}</p>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAdjustingProduct(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={adjustForm.processing}
                                    className="bg-[#047857] hover:bg-[#065F46] text-white"
                                >
                                    {adjustForm.processing ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventori & Stok', href: '/inventory' },
    ],
};
