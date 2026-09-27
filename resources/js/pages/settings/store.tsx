import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Store, Save, Printer, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { toast } from 'sonner';

interface StoreSettingsProps {
    settings: {
        store_name: string;
        store_phone: string;
        store_address: string;
        receipt_footer: string;
    };
}

export default function StoreSetting({ settings }: StoreSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        store_name: settings.store_name || 'WarunkPakEdy',
        store_phone: settings.store_phone || '0812-3456-7890',
        store_address: settings.store_address || 'Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217',
        receipt_footer: settings.receipt_footer || 'Terima kasih atas kunjungan Anda!',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/store', {
            onSuccess: () => {
                toast.success('Pengaturan toko dan struk berhasil diperbarui.');
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Gagal menyimpan pengaturan.';
                toast.error(msg as string);
            },
        });
    };

    return (
        <>
            <Head title="Pengaturan Toko & Struk" />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div>
                    <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                        Pengaturan Toko & Kasir
                    </h1>
                    <p className="text-sm text-[#64748B]">
                        Atur identitas warung, informasi kontak, dan tampilan kop nota struk belanja
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Form Left (7 cols) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 space-y-4">
                            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                                <Store className="size-5 text-[#047857]" />
                                <h2 className="text-base font-semibold text-[#0F172A]">
                                    Identitas Toko & Kontak
                                </h2>
                            </div>

                            <div>
                                <Label htmlFor="store-name">Nama Warung / Toko *</Label>
                                <Input
                                    id="store-name"
                                    value={data.store_name}
                                    onChange={(e) => setData('store_name', e.target.value)}
                                    placeholder="Contoh: WarunkPakEdy"
                                    className="mt-1 font-semibold"
                                    required
                                />
                                {errors.store_name && (
                                    <p className="text-xs text-[#DC2626] mt-1">{errors.store_name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="store-phone">Nomor Telepon / WhatsApp</Label>
                                <Input
                                    id="store-phone"
                                    value={data.store_phone}
                                    onChange={(e) => setData('store_phone', e.target.value)}
                                    placeholder="Contoh: 0812-3456-7890"
                                    className="mt-1"
                                />
                                {errors.store_phone && (
                                    <p className="text-xs text-[#DC2626] mt-1">{errors.store_phone}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="store-address">Alamat Lengkap Toko</Label>
                                <Input
                                    id="store-address"
                                    value={data.store_address}
                                    onChange={(e) => setData('store_address', e.target.value)}
                                    placeholder="Contoh: Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217"
                                    className="mt-1"
                                />
                                {errors.store_address && (
                                    <p className="text-xs text-[#DC2626] mt-1">{errors.store_address}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="receipt-footer">Pesan Kaki Struk (Receipt Footer)</Label>
                                <Input
                                    id="receipt-footer"
                                    value={data.receipt_footer}
                                    onChange={(e) => setData('receipt_footer', e.target.value)}
                                    placeholder="Contoh: Terima kasih telah berbelanja di WarunkPakEdy!"
                                    className="mt-1"
                                />
                                <p className="text-[11px] text-[#94A3B8] mt-1">
                                    Pesan ini akan dicetak di baris paling bawah setiap nota pembelian.
                                </p>
                                {errors.receipt_footer && (
                                    <p className="text-xs text-[#DC2626] mt-1">{errors.receipt_footer}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                            >
                                <Save className="size-4 mr-1.5" />
                                {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </Button>
                        </div>
                    </form>

                    {/* Live Preview Right (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] px-1">
                            <Printer className="size-4 text-[#047857]" />
                            <span>Pratinjau Struk Termal (Live Preview)</span>
                        </div>

                        <div className="border border-dashed border-[#CBD5E1] bg-white rounded-lg p-5 text-xs text-[#0F172A] font-mono leading-relaxed space-y-3 shadow-xs">
                            <div className="text-center space-y-1">
                                <Logo className="size-12 rounded mx-auto mb-1" />
                                <h3 className="font-bold text-sm uppercase tracking-wide">
                                    {data.store_name || 'NAMA TOKO'}
                                </h3>
                                <p className="text-[11px] text-[#64748B]">
                                    {data.store_phone || '08xxxxxxxxxx'}
                                </p>
                                <p className="text-[10px] text-[#94A3B8]">
                                    {data.store_address || 'Alamat Toko Belum Diatur'}
                                </p>
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span>No: INV-20260926-0001</span>
                                    <span>26 Sep 2026, 14:30</span>
                                </div>
                                <div className="flex justify-between text-[#64748B]">
                                    <span>Kasir: Budi Kasir</span>
                                    <span>Pelanggan: Umum</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1.5">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <p className="font-medium text-[#0F172A]">Beras Ramos 5kg</p>
                                        <p className="text-[10px] text-[#64748B]">1 karung x Rp 74.000</p>
                                    </div>
                                    <span className="font-semibold text-right">Rp 74.000</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <p className="font-medium text-[#0F172A]">Minyak Bimoli 1L</p>
                                        <p className="text-[10px] text-[#64748B]">2 pouch x Rp 19.500</p>
                                    </div>
                                    <span className="font-semibold text-right">Rp 39.000</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>Rp 113.000</span>
                                </div>
                                <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-[#E2E8F0]">
                                    <span>TOTAL:</span>
                                    <span>Rp 113.000</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span>Bayar (TUNAI):</span>
                                    <span>Rp 120.000</span>
                                </div>
                                <div className="flex justify-between font-bold text-[#15803D]">
                                    <span>Kembali:</span>
                                    <span>Rp 7.000</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-[#CBD5E1] pt-3 text-center text-[10px] text-[#64748B] space-y-1">
                                <p className="font-medium">{data.receipt_footer || 'Terima kasih atas kunjungan Anda!'}</p>
                                <p className="text-[#94A3B8]">Barang yang dibeli tidak dapat ditukar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

StoreSetting.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sistem', href: '#' },
        { title: 'Pengaturan Toko', href: '/settings/store' },
    ],
};
