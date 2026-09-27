import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
    description: string | null;
    purchase_price: string;
    selling_price: string;
    stock: string;
    minimum_stock: string;
    unit: string;
    is_active: boolean;
}

interface ProductEditProps {
    product: Product;
    categories: Category[];
}

export default function ProductEdit({ product, categories }: ProductEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        category_id: product.category_id.toString(),
        sku: product.sku,
        barcode: product.barcode || '',
        name: product.name,
        description: product.description || '',
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock: product.stock,
        minimum_stock: product.minimum_stock,
        unit: product.unit,
        is_active: product.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/products/${product.id}`, {
            onSuccess: () => {
                toast.success('Produk berhasil diperbarui');
            },
            onError: () => {
                toast.error('Periksa kembali input form Anda');
            },
        });
    };

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-9"
                    >
                        <Link href="/products">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-[24px] font-bold text-[#0F172A]">
                            Edit Produk
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Perbarui informasi produk {product.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-6">
                        <h2 className="border-b border-[#E2E8F0] pb-2 text-base font-semibold text-[#0F172A]">
                            Informasi Dasar
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Label htmlFor="name">Nama Produk *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="category_id">Kategori *</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(val) =>
                                        setData('category_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="category_id"
                                        className="mt-1"
                                    >
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                {errors.category_id && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="unit">Satuan Unit *</Label>
                                <Input
                                    id="unit"
                                    value={data.unit}
                                    onChange={(e) =>
                                        setData('unit', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {errors.unit && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.unit}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="sku">SKU / Kode Produk *</Label>
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) =>
                                        setData('sku', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {errors.sku && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.sku}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    value={data.barcode}
                                    onChange={(e) =>
                                        setData('barcode', e.target.value)
                                    }
                                    className="mt-1"
                                />
                                {errors.barcode && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.barcode}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-6">
                        <h2 className="border-b border-[#E2E8F0] pb-2 text-base font-semibold text-[#0F172A]">
                            Harga & Stok
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="purchase_price">
                                    Harga Beli (Modal) *
                                </Label>
                                <Input
                                    id="purchase_price"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={data.purchase_price}
                                    onChange={(e) =>
                                        setData(
                                            'purchase_price',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                    required
                                />
                                {errors.purchase_price && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.purchase_price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="selling_price">
                                    Harga Jual *
                                </Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={data.selling_price}
                                    onChange={(e) =>
                                        setData('selling_price', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {errors.selling_price && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.selling_price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="stock">
                                    Stok Saat Ini (Hanya Baca)
                                </Label>
                                <Input
                                    id="stock"
                                    disabled
                                    value={data.stock}
                                    className="mt-1 bg-[#F8FAFC] text-[#64748B]"
                                />
                                <p className="mt-1 text-xs text-[#94A3B8]">
                                    Perubahan stok dilakukan melalui modul
                                    Pembelian, Penyesuaian, atau Stock Opname.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="minimum_stock">
                                    Batas Minimum Stok *
                                </Label>
                                <Input
                                    id="minimum_stock"
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={data.minimum_stock}
                                    onChange={(e) =>
                                        setData('minimum_stock', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {errors.minimum_stock && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.minimum_stock}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/products">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#047857] font-semibold text-white hover:bg-[#065F46]"
                        >
                            <Save className="mr-1.5 size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Produk', href: '/products' },
        { title: 'Edit Produk', href: '#' },
    ],
};
