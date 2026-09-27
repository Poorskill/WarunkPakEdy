import { useState, useRef } from 'react';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import {
    Camera,
    Trash2,
    CheckCircle2,
    ShieldCheck,
    Shield,
    ShieldAlert,
    Calendar,
    Phone,
    Mail,
    User as UserIcon,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import DeleteUser from '@/components/delete-user';
import { toast } from 'sonner';
import type { Auth, User } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: Auth;
    mustVerifyEmail: boolean;
    status?: string;
    profile?: Partial<User>;
};

export default function Profile({ mustVerifyEmail, status, profile }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const user = profile || auth.user;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: (user.phone as string) || '',
        photo: null as File | null,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
            toast.error('Format file harus berupa JPG, PNG, atau WebP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file maksimal adalah 2MB.');
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        const formData = new FormData();
        formData.append('photo', file);

        setIsUploadingPhoto(true);
        router.post('/settings/profile/photo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadingPhoto(false);
                toast.success('Foto profil berhasil diperbarui.');
            },
            onError: (err) => {
                setIsUploadingPhoto(false);
                setPreviewUrl(null);
                const msg = Object.values(err)[0] || 'Gagal mengupload foto profil.';
                toast.error(msg as string);
            },
        });
    };

    const handleDeletePhoto = () => {
        if (!confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) return;

        setIsUploadingPhoto(true);
        router.delete('/settings/profile/photo', {
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadingPhoto(false);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                toast.success('Foto profil berhasil dihapus.');
            },
            onError: () => {
                setIsUploadingPhoto(false);
                toast.error('Gagal menghapus foto profil.');
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile berhasil diperbarui.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menyimpan data profil.';
                toast.error(msg as string);
            },
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const roleInfo = {
        owner: {
            label: 'Owner (Pemilik Toko)',
            badge: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
            icon: ShieldCheck,
        },
        admin: {
            label: 'Admin (Operasional Toko)',
            badge: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
            icon: Shield,
        },
        cashier: {
            label: 'Kasir',
            badge: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
            icon: ShieldAlert,
        },
    }[user.role as 'owner' | 'admin' | 'cashier'] || {
        label: user.role,
        badge: 'bg-neutral-100 text-neutral-700 border-neutral-200',
        icon: Shield,
    };

    return (
        <div className="space-y-8">
            <Head title="Profile Saya" />

            <div>
                <h1 className="text-[24px] font-bold text-[#0F172A] leading-tight">
                    Profile Saya
                </h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Kelola informasi akun dan identitas pribadi Anda di WarunkPakEdy
                </p>
            </div>

            {/* Profile Photo Section */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group">
                        <Avatar className="size-24 sm:size-28 border-2 border-[#E2E8F0] shadow-sm">
                            <AvatarImage
                                src={previewUrl || user.avatar}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-xl font-bold bg-[#ECFDF5] text-[#047857]">
                                {getInitials(user.name || '')}
                            </AvatarFallback>
                        </Avatar>
                        {isUploadingPhoto && (
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white">
                                <Loader2 className="size-6 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                            Foto Profile
                        </h2>
                        <p className="text-xs text-[#64748B] max-w-md">
                            Gunakan foto yang jelas berformat JPG, PNG, atau WebP dengan ukuran maksimal 2MB.
                        </p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isUploadingPhoto}
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-1.5 text-xs h-9"
                            >
                                <Camera className="size-3.5" />
                                {user.avatar || previewUrl ? 'Ganti Foto' : 'Upload Foto'}
                            </Button>

                            {(user.avatar || previewUrl) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isUploadingPhoto}
                                    onClick={handleDeletePhoto}
                                    className="gap-1.5 text-xs h-9 text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                                >
                                    <Trash2 className="size-3.5" />
                                    Hapus Foto
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nama */}
                    <div className="space-y-1.5">
                        <Label htmlFor="profile-name" className="text-sm font-semibold text-[#0F172A]">
                            Nama Lengkap <span className="text-[#DC2626]">*</span>
                        </Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                            <Input
                                id="profile-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap Anda"
                                className="pl-9 h-10"
                                required
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-[#DC2626]">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="profile-email" className="text-sm font-semibold text-[#0F172A]">
                            Alamat Email <span className="text-[#DC2626]">*</span>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                            <Input
                                id="profile-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@contoh.com"
                                className="pl-9 h-10"
                                required
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-[#DC2626]">{errors.email}</p>
                        )}
                    </div>

                    {/* No. HP / WhatsApp */}
                    <div className="space-y-1.5">
                        <Label htmlFor="profile-phone" className="text-sm font-semibold text-[#0F172A]">
                            Nomor WhatsApp / HP
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                            <Input
                                id="profile-phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="pl-9 h-10"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-[#DC2626]">{errors.phone}</p>
                        )}
                    </div>

                    {/* Role (Non-editable) */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-[#0F172A]">
                            Role / Peran Sistem
                        </Label>
                        <div className="h-10 px-3 py-2 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <roleInfo.icon className="size-4 text-[#64748B]" />
                                <span className="text-sm font-medium text-[#0F172A]">
                                    {roleInfo.label}
                                </span>
                            </div>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${roleInfo.badge}`}>
                                Tetap
                            </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8]">
                            Role diatur oleh administrator toko dan tidak dapat diubah dari profile pribadi.
                        </p>
                    </div>

                    {/* Status Akun (Non-editable) */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-[#0F172A]">
                            Status Akun
                        </Label>
                        <div className="h-10 px-3 py-2 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                                <span className="text-sm font-semibold text-[#15803D]">
                                    {user.is_active !== false ? 'Aktif' : 'Non-Aktif'}
                                </span>
                            </div>
                            <span className="text-[11px] text-[#64748B]">
                                Terverifikasi
                            </span>
                        </div>
                    </div>

                    {/* Tanggal Bergabung (Non-editable) */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-[#0F172A]">
                            Tanggal Bergabung
                        </Label>
                        <div className="h-10 px-3 py-2 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2 text-sm text-[#0F172A]">
                            <Calendar className="size-4 text-[#94A3B8]" />
                            <span>{formatDate(user.created_at)}</span>
                        </div>
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg text-xs text-[#92400E] flex items-center justify-between">
                        <span>Alamat email Anda belum diverifikasi.</span>
                        <Link
                            href={send()}
                            as="button"
                            className="font-bold underline ml-2 hover:text-[#78350F]"
                        >
                            Kirim Ulang Verifikasi
                        </Link>
                    </div>
                )}

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                    {recentlySuccessful && (
                        <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                            <CheckCircle2 className="size-4" />
                            Tersimpan
                        </span>
                    )}
                    <Button
                        type="submit"
                        disabled={processing || isUploadingPhoto}
                        className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold px-5 h-10 gap-1.5"
                    >
                        {processing && <Loader2 className="size-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                </div>
            </form>

            {/* Account Delete section if applicable */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                <DeleteUser />
            </div>
        </div>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan',
            href: '/settings',
        },
        {
            title: 'Profile Saya',
            href: '/settings/profile',
        },
    ],
};
