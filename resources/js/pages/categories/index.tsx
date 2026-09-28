import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/search-input';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    description: string | null;
    products_count: number;
    created_at: string;
}

interface CategoriesProps {
    categories: {
        data: Category[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function CategoriesIndex({
    categories = { data: [], links: [], from: 0, to: 0, total: 0 },
    filters = { search: '' },
}: CategoriesProps) {
    const { auth } = usePage().props as { auth: { user: { role: string } } };
    const role = auth?.user?.role || 'owner';
    const isOwner = role === 'owner';
    const canManage = ['owner', 'admin'].includes(role);

    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(
        null,
    );

    const createForm = useForm({
        name: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        description: '',
    });

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/categories',
            { search: val },
            { preserveState: true, replace: true },
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/categories', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Kategori berhasil ditambahkan');
            },
        });
    };

    const openEdit = (cat: Category) => {
        setEditingCategory(cat);
        editForm.setData({
            name: cat.name,
            description: cat.description || '',
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        editForm.put(`/categories/${editingCategory.id}`, {
            onSuccess: () => {
                setEditingCategory(null);
                editForm.reset();
                toast.success('Kategori berhasil diperbarui');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingCategory) return;
        router.delete(`/categories/${deletingCategory.id}`, {
            onSuccess: () => {
                setDeletingCategory(null);
                toast.success('Kategori berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus kategori');
            },
        });
    };

    return (
        <>
            <Head title="Kategori Produk" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-[28px] leading-9 font-bold text-[#0F172A]">
                            Kategori Produk
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Kelola kategori produk toko
                        </p>
                    </div>
                    {canManage && (
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#047857] font-semibold text-white hover:bg-[#065F46]"
                        >
                            <Plus className="mr-1.5 size-4" />
                            Tambah Kategori
                        </Button>
                    )}
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="border-b border-[#E2E8F0] p-4">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari kategori..."
                            className="max-w-sm"
                        />
                    </div>

                    {(categories?.data || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <FolderTree className="mb-2 size-10 text-[#94A3B8]" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada kategori
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Tambahkan kategori pertama untuk mengelompokkan
                                produk
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Nama Kategori
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Deskripsi
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Jumlah Produk
                                        </th>
                                        <th className="w-24 px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(categories?.data || []).map((cat) => (
                                        <tr
                                            key={cat.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">
                                                {cat.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#64748B]">
                                                {cat.description || '-'}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                style={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {cat.products_count}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {canManage ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(cat)
                                                            }
                                                            className="p-1 text-[#64748B] transition-colors hover:text-[#047857]"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                        {isOwner && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeletingCategory(
                                                                        cat,
                                                                    )
                                                                }
                                                                className="p-1 text-[#64748B] transition-colors hover:text-[#DC2626]"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[#94A3B8]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-t border-[#E2E8F0] px-4">
                        <Pagination
                            links={categories?.links || []}
                            from={categories?.from}
                            to={categories?.to}
                            total={categories?.total}
                        />
                    </div>
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori</DialogTitle>
                        <DialogDescription>
                            Buat kategori baru untuk produk toko Anda
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="create-name">Nama Kategori</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData('name', e.target.value)
                                }
                                placeholder="Contoh: Sembako"
                                className="mt-1"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="mt-1 text-xs text-[#DC2626]">
                                    {createForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="create-desc">
                                Deskripsi (Opsional)
                            </Label>
                            <Input
                                id="create-desc"
                                value={createForm.data.description}
                                onChange={(e) =>
                                    createForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                placeholder="Keterangan kategori"
                                className="mt-1"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-[#047857] text-white hover:bg-[#065F46]"
                            >
                                {createForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!editingCategory}
                onOpenChange={(open) => !open && setEditingCategory(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Kategori</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi kategori
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="edit-name">Nama Kategori</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                                className="mt-1"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="mt-1 text-xs text-[#DC2626]">
                                    {editForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="edit-desc">Deskripsi</Label>
                            <Input
                                id="edit-desc"
                                value={editForm.data.description}
                                onChange={(e) =>
                                    editForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                className="mt-1"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingCategory(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-[#047857] text-white hover:bg-[#065F46]"
                            >
                                {editForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                title="Hapus Kategori?"
                description={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kategori', href: '/categories' },
    ],
};
