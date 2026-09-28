import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Camera, Image as ImageIcon, X } from 'lucide-react';
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

interface ProductCreateProps {
    categories: Category[];
}

export default function ProductCreate({ categories }: ProductCreateProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        category_id: string;
        sku: string;
        barcode: string;
        name: string;
        description: string;
        purchase_price: string;
        selling_price: string;
        stock: string;
        minimum_stock: string;
        unit: string;
        image: File | null;
        is_active: boolean;
    }>({
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        sku: '',
        barcode: '',
        name: '',
        description: '',
        purchase_price: '',
        selling_price: '',
        stock: '0',
        minimum_stock: '5',
        unit: 'pcs',
        image: null,
        is_active: true,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran foto maksimal 2MB');
                return;
            }
            setData('image', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/products', {
            onSuccess: () => {
                toast.success('Produk berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Periksa kembali input form Anda');
            },
        });
    };

    return (
        <>
            <Head title="Tambah Produk Baru" />
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
                            Tambah Produk Baru
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Isi detail informasi produk toko Anda
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
                                    placeholder="Contoh: Indomie Goreng Spesial 85g"
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
                                    placeholder="pcs, pack, botol, kg, dll"
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
                                    placeholder="Contoh: MKN-IND-001"
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
                                <Label htmlFor="barcode">
                                    Barcode (Opsional)
                                </Label>
                                <Input
                                    id="barcode"
                                    value={data.barcode}
                                    onChange={(e) =>
                                        setData('barcode', e.target.value)
                                    }
                                    placeholder="Scan barcode atau masukkan angka"
                                    className="mt-1"
                                />
                                {errors.barcode && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.barcode}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="description">
                                    Deskripsi (Opsional)
                                </Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Deskripsi singkat produk"
                                    className="mt-1"
                                />
                            </div>

                            {/* Foto Produk */}
                            <div className="md:col-span-2 pt-2 border-t border-[#E2E8F0]">
                                <Label className="block text-sm font-medium text-[#0F172A] mb-2">
                                    Foto Produk (Opsional)
                                </Label>
                                <div className="flex items-center gap-4">
                                    <div className="size-20 rounded-lg border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-center overflow-hidden shrink-0">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="size-8 text-[#94A3B8]" />
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/jpg"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-xs h-8 gap-1.5"
                                            >
                                                <Camera className="size-3.5" />
                                                {previewUrl ? 'Ganti Foto' : 'Pilih Foto'}
                                            </Button>
                                            {previewUrl && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    className="text-xs h-8 text-[#DC2626] hover:bg-[#FEF2F2] gap-1"
                                                >
                                                    <X className="size-3.5" />
                                                    Hapus
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#64748B]">
                                            Format: JPG, PNG, atau WebP. Maksimal 2MB.
                                        </p>
                                    </div>
                                </div>
                                {errors.image && (
                                    <p className="mt-1 text-xs text-[#DC2626]">{errors.image}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-6">
                        <h2 className="border-b border-[#E2E8F0] pb-2 text-base font-semibold text-[#0F172A]">
                            Harga & Stok Awal
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
                                    placeholder="Rp 0"
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
                                    placeholder="Rp 0"
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
                                <Label htmlFor="stock">Stok Awal *</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData('stock', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                <p className="mt-1 text-xs text-[#94A3B8]">
                                    Stok awal akan otomatis dicatat sebagai
                                    pergerakan stok (Stock Movement).
                                </p>
                                {errors.stock && (
                                    <p className="mt-1 text-xs text-[#DC2626]">
                                        {errors.stock}
                                    </p>
                                )}
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
                                <p className="mt-1 text-xs text-[#94A3B8]">
                                    Peringatan stok menipis muncul jika stok
                                    kurang dari atau sama dengan nilai ini.
                                </p>
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
                            {processing ? 'Menyimpan...' : 'Simpan Produk'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Produk', href: '/products' },
        { title: 'Tambah Produk', href: '/products/create' },
    ],
};
