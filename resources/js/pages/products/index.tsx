import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/status-badge';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
    description: string | null;
    purchase_price: string;
    selling_price: string;
    stock: string;
    minimum_stock: string;
    unit: string;
    image_url?: string | null;
    is_active: boolean;
    category: Category | null;
}

interface ProductsIndexProps {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search: string;
        category_id: string;
        stock_status: string;
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

export default function ProductsIndex({
    products,
    categories,
    filters,
}: ProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [stockStatus, setStockStatus] = useState(
        filters.stock_status || 'all',
    );
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(
        null,
    );

    const applyFilters = (
        newSearch: string,
        newCat: string,
        newStatus: string,
    ) => {
        router.get(
            '/products',
            {
                search: newSearch,
                category_id: newCat === 'all' ? '' : newCat,
                stock_status: newStatus === 'all' ? '' : newStatus,
            },
            { preserveState: true, replace: true },
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

    const handleDelete = () => {
        if (!deletingProduct) return;
        router.delete(`/products/${deletingProduct.id}`, {
            onSuccess: () => {
                setDeletingProduct(null);
                toast.success('Produk berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus produk');
            },
        });
    };

    const getStockStatus = (
        stock: number,
        minStock: number,
    ): 'normal' | 'menipis' | 'habis' => {
        if (stock <= 0) return 'habis';
        if (stock <= minStock) return 'menipis';
        return 'normal';
    };

    return (
        <>
            <Head title="Manajemen Produk" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-[28px] leading-9 font-bold text-[#0F172A]">
                            Manajemen Produk
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Kelola data master produk, harga, dan stok barang
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-[#047857] font-semibold text-white hover:bg-[#065F46]"
                    >
                        <Link href="/products/create">
                            <Plus className="mr-1.5 size-4" />
                            Tambah Produk
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    {/* Filters Toolbar */}
                    <div className="flex flex-col items-stretch justify-between gap-3 border-b border-[#E2E8F0] p-4 md:flex-row md:items-center">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari nama, SKU, atau barcode..."
                            className="w-full md:max-w-xs"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={categoryId}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger className="h-9 w-40 text-xs">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Kategori
                                    </SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id.toString()}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={stockStatus}
                                onValueChange={handleStockStatusChange}
                            >
                                <SelectTrigger className="h-9 w-36 text-xs">
                                    <SelectValue placeholder="Status Stok" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Stok
                                    </SelectItem>
                                    <SelectItem value="normal">
                                        Stok Normal
                                    </SelectItem>
                                    <SelectItem value="low">
                                        Stok Menipis
                                    </SelectItem>
                                    <SelectItem value="out">
                                        Stok Habis
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Package className="mb-2 size-10 text-[#94A3B8]" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada data produk
                            </p>
                            <p className="mb-4 text-xs text-[#94A3B8]">
                                Mulai dengan menambahkan produk pertama ke dalam
                                toko Anda
                            </p>
                            <Button
                                asChild
                                className="bg-[#047857] text-xs text-white hover:bg-[#065F46]"
                            >
                                <Link href="/products/create">
                                    <Plus className="mr-1 size-3.5" />
                                    Tambah Produk
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Produk
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Harga Beli
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Harga Jual
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Stok
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Status
                                        </th>
                                        <th className="w-24 px-4 py-2.5 text-center text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((p) => {
                                        const stock = Number(p.stock);
                                        const minStock = Number(
                                            p.minimum_stock,
                                        );
                                        const status = getStockStatus(
                                            stock,
                                            minStock,
                                        );

                                        return (
                                            <tr
                                                key={p.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {p.image_url ? (
                                                            <img
                                                                src={p.image_url}
                                                                alt={p.name}
                                                                className="size-10 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="size-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] shrink-0">
                                                                <Package className="size-5" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-[#0F172A] truncate">
                                                                {p.name}
                                                            </p>
                                                            <p className="text-xs text-[#94A3B8]">
                                                                SKU: {p.sku}{' '}
                                                                {p.barcode &&
                                                                    `· Barcode: ${p.barcode}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#64748B]">
                                                    {p.category?.name || '-'}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm text-[#64748B]"
                                                    style={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                >
                                                    {formatRupiah(
                                                        Number(
                                                            p.purchase_price,
                                                        ),
                                                    )}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                    style={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                >
                                                    {formatRupiah(
                                                        Number(p.selling_price),
                                                    )}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-medium text-[#0F172A]"
                                                    style={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                >
                                                    {stock} {p.unit}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <StatusBadge
                                                        status={status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            className="size-8 text-[#64748B] hover:text-[#047857]"
                                                            title="Edit"
                                                        >
                                                            <Link
                                                                href={`/products/${p.id}/edit`}
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setDeletingProduct(
                                                                    p,
                                                                )
                                                            }
                                                            className="size-8 text-[#64748B] hover:text-[#DC2626]"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-t border-[#E2E8F0] px-4">
                        <Pagination
                            links={products.links}
                            from={products.from}
                            to={products.to}
                            total={products.total}
                        />
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={!!deletingProduct}
                onOpenChange={(open) => !open && setDeletingProduct(null)}
                title="Hapus Produk?"
                description={`Apakah Anda yakin ingin menghapus produk "${deletingProduct?.name}"? Produk akan dinonaktifkan dari sistem kasir.`}
                confirmText="Hapus"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Produk', href: '/products' },
    ],
};
