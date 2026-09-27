import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react';
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
import { StatusBadge } from '@/components/status-badge';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';

interface Supplier {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    purchases_count: number;
    created_at: string;
}

interface SuppliersProps {
    suppliers: {
        data: Supplier[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function SuppliersIndex({
    suppliers = { data: [], links: [], from: 0, to: 0, total: 0 },
    filters = { search: '' },
}: SuppliersProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const createForm = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/suppliers',
            { search: val },
            { preserveState: true, replace: true }
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/suppliers', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Supplier berhasil ditambahkan');
            },
        });
    };

    const openEdit = (sup: Supplier) => {
        setEditingSupplier(sup);
        editForm.setData({
            name: sup.name,
            phone: sup.phone || '',
            email: sup.email || '',
            address: sup.address || '',
            notes: sup.notes || '',
            is_active: sup.is_active,
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSupplier) return;
        editForm.put(`/suppliers/${editingSupplier.id}`, {
            onSuccess: () => {
                setEditingSupplier(null);
                editForm.reset();
                toast.success('Supplier berhasil diperbarui');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingSupplier) return;
        router.delete(`/suppliers/${deletingSupplier.id}`, {
            onSuccess: () => {
                setDeletingSupplier(null);
                toast.success('Supplier berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus supplier');
            },
        });
    };

    return (
        <>
            <Head title="Data Supplier" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Data Supplier
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Kelola mitra pemasok barang dan sembako toko
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                    >
                        <Plus className="size-4 mr-1.5" />
                        Tambah Supplier
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari nama, no. telepon, atau email supplier..."
                            className="max-w-sm"
                        />
                    </div>

                    {(suppliers?.data || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Truck className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada supplier
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Tambahkan data supplier pertama untuk mengelola restock barang
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Nama Supplier
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Kontak
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Alamat
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Pembelian
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(suppliers?.data || []).map((sup) => (
                                        <tr
                                            key={sup.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-[#0F172A]">
                                                    {sup.name}
                                                </p>
                                                {sup.notes && (
                                                    <p className="text-xs text-[#94A3B8] truncate max-w-xs">
                                                        {sup.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#64748B]">
                                                {sup.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#0F172A]">
                                                        <Phone className="size-3 text-[#64748B]" />
                                                        <span>{sup.phone}</span>
                                                    </div>
                                                )}
                                                {sup.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                                                        <Mail className="size-3 text-[#94A3B8]" />
                                                        <span>{sup.email}</span>
                                                    </div>
                                                )}
                                                {!sup.phone && !sup.email && '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#64748B] max-w-xs">
                                                {sup.address ? (
                                                    <div className="flex items-start gap-1.5 text-xs">
                                                        <MapPin className="size-3.5 text-[#94A3B8] shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{sup.address}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge
                                                    status={sup.is_active ? 'active' : 'inactive'}
                                                />
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {sup.purchases_count} transaksi
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(sup)}
                                                        className="p-1 text-[#64748B] hover:text-[#047857] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingSupplier(sup)}
                                                        className="p-1 text-[#64748B] hover:text-[#DC2626] transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-4 border-t border-[#E2E8F0]">
                        <Pagination
                            links={suppliers?.links || []}
                            from={suppliers?.from}
                            to={suppliers?.to}
                            total={suppliers?.total}
                        />
                    </div>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Supplier Baru</DialogTitle>
                        <DialogDescription>
                            Daftarkan mitra supplier atau distributor baru
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="sup-create-name">Nama Supplier *</Label>
                            <Input
                                id="sup-create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: PT Indomarco Adi Prima"
                                className="mt-1"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sup-create-phone">Nomor Telepon</Label>
                                <Input
                                    id="sup-create-phone"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                    placeholder="0812xxxxxxxx"
                                    className="mt-1"
                                />
                                {createForm.errors.phone && (
                                    <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.phone}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="sup-create-email">Email</Label>
                                <Input
                                    id="sup-create-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="supplier@mail.com"
                                    className="mt-1"
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sup-create-address">Alamat</Label>
                            <Input
                                id="sup-create-address"
                                value={createForm.data.address}
                                onChange={(e) => createForm.setData('address', e.target.value)}
                                placeholder="Alamat gudang / kantor distributor"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="sup-create-notes">Catatan Tambahan</Label>
                            <Input
                                id="sup-create-notes"
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                placeholder="Contoh: Distributor mi instan dan sembako kartonan"
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
                                className="bg-[#047857] hover:bg-[#065F46] text-white"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Supplier'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingSupplier} onOpenChange={(open) => !open && setEditingSupplier(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi mitra supplier
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="sup-edit-name">Nama Supplier *</Label>
                            <Input
                                id="sup-edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sup-edit-phone">Nomor Telepon</Label>
                                <Input
                                    id="sup-edit-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                    className="mt-1"
                                />
                                {editForm.errors.phone && (
                                    <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.phone}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="sup-edit-email">Email</Label>
                                <Input
                                    id="sup-edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="mt-1"
                                />
                                {editForm.errors.email && (
                                    <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sup-edit-address">Alamat</Label>
                            <Input
                                id="sup-edit-address"
                                value={editForm.data.address}
                                onChange={(e) => editForm.setData('address', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="sup-edit-notes">Catatan</Label>
                            <Input
                                id="sup-edit-notes"
                                value={editForm.data.notes}
                                onChange={(e) => editForm.setData('notes', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingSupplier(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-[#047857] hover:bg-[#065F46] text-white"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deletingSupplier}
                onOpenChange={(open) => !open && setDeletingSupplier(null)}
                title="Hapus Supplier?"
                description={`Apakah Anda yakin ingin menghapus data supplier "${deletingSupplier?.name}"?`}
                confirmText="Hapus"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Supplier', href: '/suppliers' },
    ],
};
