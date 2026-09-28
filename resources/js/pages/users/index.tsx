import { useState, useRef } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Users, ShieldCheck, ShieldAlert, Shield, Camera } from 'lucide-react';
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/search-input';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { toast } from 'sonner';

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: 'owner' | 'admin' | 'cashier';
    avatar?: string;
    is_active?: boolean;
    created_at: string;
}

interface UsersIndexProps {
    users: {
        data: UserItem[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
        role: string;
    };
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function roleBadge(role: 'owner' | 'admin' | 'cashier'): {
    label: string;
    bg: string;
    text: string;
    icon: typeof Shield;
} {
    switch (role) {
        case 'owner':
            return { label: 'Owner / Pemilik', bg: 'bg-[#ECFDF5]', text: 'text-[#047857]', icon: ShieldCheck };
        case 'admin':
            return { label: 'Admin Toko', bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', icon: Shield };
        case 'cashier':
            return { label: 'Kasir', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', icon: ShieldAlert };
        default:
            return { label: role, bg: 'bg-neutral-100', text: 'text-neutral-700', icon: Shield };
    }
}

export default function UsersIndex({ users, filters }: UsersIndexProps) {
    const { auth } = usePage().props;
    const currentUserId = auth.user?.id;
    const getInitials = useInitials();

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);

    const createForm = useForm<{
        name: string;
        email: string;
        password: string;
        role: string;
        photo: File | null;
    }>({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        photo: null,
    });

    const editForm = useForm<{
        name: string;
        email: string;
        password: string;
        role: string;
        photo: File | null;
        remove_photo: boolean;
    }>({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        photo: null,
        remove_photo: false,
    });

    const applyFilters = (newSearch: string, newRole: string) => {
        router.get(
            '/users',
            {
                search: newSearch,
                role: newRole === 'all' ? '' : newRole,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        applyFilters(val, roleFilter);
    };

    const handleRoleFilterChange = (val: string) => {
        setRoleFilter(val);
        applyFilters(search, val);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/users', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreatePreview(null);
                createForm.reset();
                if (createFileInputRef.current) createFileInputRef.current.value = '';
                toast.success('Pengguna baru berhasil ditambahkan');
            },
        });
    };

    const openEdit = (u: UserItem) => {
        setEditingUser(u);
        setEditPreview(null);
        editForm.setData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            photo: null,
            remove_photo: false,
        });
        if (editFileInputRef.current) editFileInputRef.current.value = '';
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.transform((data) => ({
            ...data,
            _method: 'put',
        }));
        editForm.post(`/users/${editingUser.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingUser(null);
                setEditPreview(null);
                editForm.reset();
                if (editFileInputRef.current) editFileInputRef.current.value = '';
                toast.success('Data pengguna berhasil diperbarui');
            },
            onError: (err: Record<string, string>) => {
                const msg = Object.values(err)[0] || 'Gagal memperbarui pengguna.';
                toast.error(msg);
            },
        });
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(`/users/${deletingUser.id}`, {
            onSuccess: () => {
                setDeletingUser(null);
                toast.success('Pengguna berhasil dihapus');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menghapus pengguna.';
                toast.error(msg as string);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Pengguna" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Manajemen Pengguna
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Kelola staf kasir, admin operasional, dan akun pemilik toko
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                    >
                        <Plus className="size-4 mr-1.5" />
                        Tambah Pengguna
                    </Button>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari nama atau email pengguna..."
                            className="w-full sm:max-w-xs"
                        />

                        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                            <SelectTrigger className="w-40 h-9 text-xs">
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="cashier">Kasir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {users.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Users className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Tidak ada data pengguna
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Tambahkan akun staf baru untuk operasional kasir
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Pengguna
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Email / Kontak
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Role / Peran
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Bergabung
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((u) => {
                                        const badge = roleBadge(u.role);
                                        const isSelf = u.id === currentUserId;

                                        return (
                                            <tr
                                                key={u.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="size-8 rounded-full border border-[#E2E8F0] shrink-0">
                                                            <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                                                            <AvatarFallback className="rounded-full bg-[#ECFDF5] text-[#047857] text-xs font-bold">
                                                                {getInitials(u.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#0F172A]">
                                                                {u.name} {isSelf && <span className="text-xs text-[#047857] font-normal">(Anda)</span>}
                                                            </p>
                                                            {u.phone && (
                                                                <p className="text-[11px] text-[#64748B]">
                                                                    {u.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#64748B]">
                                                    {u.email}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}
                                                    >
                                                        <badge.icon className="size-3" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded">
                                                        <span className="size-1.5 rounded-full bg-[#16A34A]" />
                                                        Aktif
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#64748B]">
                                                    {formatDate(u.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(u)}
                                                            className="p-1 text-[#64748B] hover:text-[#047857] transition-colors"
                                                            title="Edit Pengguna"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                        {!isSelf && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingUser(u)}
                                                                className="p-1 text-[#64748B] hover:text-[#DC2626] transition-colors"
                                                                title="Hapus Pengguna"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>
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
                            links={users.links}
                            from={users.from}
                            to={users.to}
                            total={users.total}
                        />
                    </div>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>
                            Buat akun staf baru untuk mengakses sistem
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 pt-2">
                        <div>
                            <Label>Foto Profile</Label>
                            <div className="mt-1 flex items-center gap-3">
                                <Avatar className="size-14 border border-[#E2E8F0]">
                                    {createPreview ? (
                                        <AvatarImage src={createPreview} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-[#ECFDF5] text-[#047857] text-sm font-bold">
                                        {getInitials(createForm.data.name || 'User')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <input
                                        ref={createFileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error('Ukuran file maksimal 2MB.');
                                                    return;
                                                }
                                                createForm.setData('photo', file);
                                                setCreatePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => createFileInputRef.current?.click()}
                                            className="text-xs h-8 gap-1.5"
                                        >
                                            <Camera className="size-3.5" />
                                            {createPreview ? 'Ganti Foto' : 'Pilih Foto'}
                                        </Button>
                                        {createPreview && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    createForm.setData('photo', null);
                                                    setCreatePreview(null);
                                                    if (createFileInputRef.current) createFileInputRef.current.value = '';
                                                }}
                                                className="text-xs h-8 text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                                            >
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#94A3B8]">JPG, PNG, WebP maks 2MB</p>
                                </div>
                            </div>
                            {createForm.errors.photo && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.photo}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="create-user-name">Nama Lengkap *</Label>
                            <Input
                                id="create-user-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Rina Kasir"
                                className="mt-1"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="create-user-email">Email Login *</Label>
                            <Input
                                id="create-user-email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="rina@warunkpakedy.test"
                                className="mt-1"
                                required
                            />
                            {createForm.errors.email && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="create-user-role">Role / Peran *</Label>
                            <Select
                                value={createForm.data.role}
                                onValueChange={(val) => createForm.setData('role', val)}
                            >
                                <SelectTrigger id="create-user-role" className="mt-1">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">Kasir (Hanya POS & Pelanggan)</SelectItem>
                                    <SelectItem value="admin">Admin (Operasional & Toko)</SelectItem>
                                    <SelectItem value="owner">Owner (Akses Penuh)</SelectItem>
                                </SelectContent>
                            </Select>
                            {createForm.errors.role && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.role}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="create-user-pass">Password (Min. 8 Karakter) *</Label>
                            <Input
                                id="create-user-pass"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="mt-1"
                                required
                            />
                            {createForm.errors.password && (
                                <p className="text-xs text-[#DC2626] mt-1">{createForm.errors.password}</p>
                            )}
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
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Pengguna</DialogTitle>
                        <DialogDescription>
                            Perbarui detail akun dan hak akses pengguna
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-2">
                        <div>
                            <Label>Foto Profile</Label>
                            <div className="mt-1 flex items-center gap-3">
                                <Avatar className="size-14 border border-[#E2E8F0]">
                                    <AvatarImage
                                        src={editPreview || (editForm.data.remove_photo ? undefined : editingUser?.avatar)}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-[#ECFDF5] text-[#047857] text-sm font-bold">
                                        {getInitials(editForm.data.name || 'User')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <input
                                        ref={editFileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error('Ukuran file maksimal 2MB.');
                                                    return;
                                                }
                                                editForm.setData((prev) => ({
                                                    ...prev,
                                                    photo: file,
                                                    remove_photo: false,
                                                }));
                                                setEditPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => editFileInputRef.current?.click()}
                                            className="text-xs h-8 gap-1.5"
                                        >
                                            <Camera className="size-3.5" />
                                            {editPreview || (!editForm.data.remove_photo && editingUser?.avatar) ? 'Ganti Foto' : 'Pilih Foto'}
                                        </Button>
                                        {(editPreview || (!editForm.data.remove_photo && editingUser?.avatar)) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    editForm.setData((prev) => ({
                                                        ...prev,
                                                        photo: null,
                                                        remove_photo: true,
                                                    }));
                                                    setEditPreview(null);
                                                    if (editFileInputRef.current) editFileInputRef.current.value = '';
                                                }}
                                                className="text-xs h-8 text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                                            >
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#94A3B8]">JPG, PNG, WebP maks 2MB</p>
                                </div>
                            </div>
                            {editForm.errors.photo && (
                                <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.photo}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="edit-user-name">Nama Lengkap *</Label>
                            <Input
                                id="edit-user-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="edit-user-email">Email Login *</Label>
                            <Input
                                id="edit-user-email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                className="mt-1"
                                required
                            />
                            {editForm.errors.email && (
                                <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="edit-user-role">Role / Peran *</Label>
                            <Select
                                value={editForm.data.role}
                                onValueChange={(val) => editForm.setData('role', val)}
                            >
                                <SelectTrigger id="edit-user-role" className="mt-1">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">Kasir</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                            {editForm.errors.role && (
                                <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.role}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="edit-user-pass">
                                Ganti Password (Kosongkan jika tidak diubah)
                            </Label>
                            <Input
                                id="edit-user-pass"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="mt-1"
                            />
                            {editForm.errors.password && (
                                <p className="text-xs text-[#DC2626] mt-1">{editForm.errors.password}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
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
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                title="Hapus Pengguna?"
                description={`Apakah Anda yakin ingin menghapus akun pengguna "${deletingUser?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sistem', href: '#' },
        { title: 'Pengguna', href: '/users' },
    ],
};
