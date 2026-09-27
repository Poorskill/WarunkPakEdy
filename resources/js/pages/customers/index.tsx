import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, UserCircle, Phone, Mail, MapPin, ShoppingBag, Star, History, Loader2 } from 'lucide-react';
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

interface PointHistoryItem {
    id: number;
    type: string;
    points: number;
    balance_after: number;
    description: string | null;
    created_at: string;
    sale?: { invoice_number: string };
    return?: { return_number: string };
}

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    formatted_phone?: string;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_member?: boolean;
    loyalty_points?: number;
    total_spending?: string | number;
    total_transactions?: number;
    sales_count: number;
    created_at: string;
}

interface CustomersProps {
    customers: {
        data: Customer[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function CustomersIndex({
    customers = { data: [], links: [], from: 0, to: 0, total: 0 },
    filters = { search: '' },
}: CustomersProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
    const [pointHistories, setPointHistories] = useState<PointHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const openHistory = async (cust: Customer) => {
        setHistoryCustomer(cust);
        setIsLoadingHistory(true);
        try {
            const res = await fetch(`/customers/${cust.id}/point-history`);
            const data = await res.json();
            setPointHistories(data.histories || []);
        } catch {
            toast.error('Gagal memuat riwayat point.');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const createForm = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });

    const editForm = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/customers',
            { search: val },
            { preserveState: true, replace: true }
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/customers', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Pelanggan berhasil ditambahkan');
            },
        });
    };

    const openEdit = (cust: Customer) => {
        setEditingCustomer(cust);
        editForm.setData({
            name: cust.name,
            phone: cust.phone || '',
            email: cust.email || '',
            address: cust.address || '',
            notes: cust.notes || '',
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        editForm.put(`/customers/${editingCustomer.id}`, {
            onSuccess: () => {
                setEditingCustomer(null);
                editForm.reset();
                toast.success('Pelanggan berhasil diperbarui');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingCustomer) return;
        router.delete(`/customers/${deletingCustomer.id}`, {
            onSuccess: () => {
                setDeletingCustomer(null);
                toast.success('Pelanggan berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus pelanggan');
            },
        });
    };

    return (
        <>
            <Head title="Data Pelanggan" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Data Pelanggan
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Kelola data pelanggan toko, kontak, dan riwayat transaksi
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                    >
                        <Plus className="size-4 mr-1.5" />
                        Tambah Pelanggan
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0]">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari nama, no. telepon, atau email pelanggan..."
                            className="max-w-sm"
                        />
                    </div>

                    {(customers?.data || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <UserCircle className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada pelanggan
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Tambahkan data pelanggan untuk memudahkan pencatatan riwayat belanja di kasir
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Nama Pelanggan
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            No. HP / Kontak
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status & Point Member
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Alamat
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Belanja
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(customers?.data || []).map((cust) => (
                                        <tr
                                            key={cust.id}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-[#0F172A]">
                                                    {cust.name}
                                                </p>
                                                {cust.notes && (
                                                    <p className="text-xs text-[#94A3B8] truncate max-w-xs">
                                                        {cust.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#64748B]">
                                                {cust.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#0F172A] font-mono">
                                                        <Phone className="size-3 text-[#64748B]" />
                                                        <span>{cust.formatted_phone || cust.phone}</span>
                                                    </div>
                                                )}
                                                {cust.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                                                        <Mail className="size-3 text-[#94A3B8]" />
                                                        <span>{cust.email}</span>
                                                    </div>
                                                )}
                                                {!cust.phone && !cust.email && '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {cust.is_member !== false ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openHistory(cust)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] hover:bg-[#D1FAE5] transition-colors"
                                                        title="Klik untuk lihat riwayat point"
                                                    >
                                                        <Star className="size-3 fill-[#EAB308] text-[#EAB308]" />
                                                        <span>{(cust.loyalty_points || 0).toLocaleString('id-ID')} Pt</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-[#94A3B8]">Reguler</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#64748B] max-w-xs">
                                                {cust.address ? (
                                                    <div className="flex items-start gap-1.5 text-xs">
                                                        <MapPin className="size-3.5 text-[#94A3B8] shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{cust.address}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right text-sm font-semibold text-[#0F172A]"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                                                    <ShoppingBag className="size-3" />
                                                    <span>{cust.sales_count} order</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openHistory(cust)}
                                                        className="p-1 text-[#64748B] hover:text-[#EAB308] transition-colors"
                                                        title="Riwayat Point"
                                                    >
                                                        <History className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(cust)}
                                                        className="p-1 text-[#64748B] hover:text-[#047857] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingCustomer(cust)}
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
                            links={customers?.links || []}
                            from={customers?.from}
                            to={customers?.to}
                            total={customers?.total}
                        />
                    </div>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
                        <DialogDescription>
                            Daftarkan informasi kontak pelanggan baru
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="cust-create-name">Nama Pelanggan *</Label>
                            <Input
                                id="cust-create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Ibu Hajjah Maryam"
                                className="mt-1"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cust-create-phone">Nomor Telepon</Label>
                                <Input
                                    id="cust-create-phone"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                    placeholder="0813xxxxxxxx"
                                    className="mt-1"
                                />
                                {createForm.errors.phone && (
                                    <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.phone}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="cust-create-email">Email</Label>
                                <Input
                                    id="cust-create-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="pelanggan@mail.com"
                                    className="mt-1"
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="cust-create-address">Alamat</Label>
                            <Input
                                id="cust-create-address"
                                value={createForm.data.address}
                                onChange={(e) => createForm.setData('address', e.target.value)}
                                placeholder="Alamat rumah / toko pelanggan"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cust-create-notes">Catatan Tambahan</Label>
                            <Input
                                id="cust-create-notes"
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                placeholder="Contoh: Langganan sembako bulanan"
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
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Pelanggan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Pelanggan</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi data pelanggan
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="cust-edit-name">Nama Pelanggan *</Label>
                            <Input
                                id="cust-edit-name"
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
                                <Label htmlFor="cust-edit-phone">Nomor Telepon</Label>
                                <Input
                                    id="cust-edit-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                    className="mt-1"
                                />
                                {editForm.errors.phone && (
                                    <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.phone}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="cust-edit-email">Email</Label>
                                <Input
                                    id="cust-edit-email"
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
                            <Label htmlFor="cust-edit-address">Alamat</Label>
                            <Input
                                id="cust-edit-address"
                                value={editForm.data.address}
                                onChange={(e) => editForm.setData('address', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cust-edit-notes">Catatan</Label>
                            <Input
                                id="cust-edit-notes"
                                value={editForm.data.notes}
                                onChange={(e) => editForm.setData('notes', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingCustomer(null)}
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

            {/* Point History Dialog */}
            <Dialog open={!!historyCustomer} onOpenChange={(open) => !open && setHistoryCustomer(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
                            <Star className="size-4 fill-[#EAB308] text-[#EAB308]" />
                            Riwayat Point Member — {historyCustomer?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#64748B]">
                            {historyCustomer?.phone && `No. HP: ${historyCustomer.formatted_phone || historyCustomer.phone} | `}
                            Saldo Saat Ini: <strong className="text-[#047857]">{(historyCustomer?.loyalty_points || 0).toLocaleString('id-ID')} Point</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 max-h-96 overflow-y-auto">
                        {isLoadingHistory ? (
                            <div className="flex items-center justify-center p-8 text-xs text-[#64748B] gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                Memuat data riwayat point...
                            </div>
                        ) : pointHistories.length === 0 ? (
                            <div className="text-center p-8 text-xs text-[#94A3B8]">
                                Belum ada aktivitas point untuk member ini.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F1F5F9] text-xs">
                                {pointHistories.map((h) => {
                                    const isPositive = h.points > 0;
                                    return (
                                        <div key={h.id} className="py-2.5 flex items-start justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-[#0F172A]">
                                                    {h.description || (isPositive ? 'Perolehan Point' : 'Penukaran Point')}
                                                </p>
                                                <p className="text-[11px] text-[#94A3B8]">
                                                    {new Date(h.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`font-bold text-sm ${
                                                        isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                                                    }`}
                                                >
                                                    {isPositive ? `+${h.points}` : h.points} Pt
                                                </span>
                                                <p className="text-[10px] text-[#64748B]">
                                                    Sisa: {h.balance_after.toLocaleString('id-ID')} Pt
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setHistoryCustomer(null)}
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deletingCustomer}
                onOpenChange={(open) => !open && setDeletingCustomer(null)}
                title="Hapus Pelanggan?"
                description={`Apakah Anda yakin ingin menghapus pelanggan "${deletingCustomer?.name}"?`}
                confirmText="Hapus"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pelanggan', href: '/customers' },
    ],
};
