import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import { ShieldCheck, Shield, ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <Head title="Masuk Akun Kasir & POS" />

            {/* Quick Demo Access Bar */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                        Akses Demo Instan
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                        Password: password
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <a
                        href="/demo-login/owner"
                        className="flex flex-col items-center justify-center p-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-center transition-all group"
                        title="Masuk sebagai Owner Pak Edy"
                    >
                        <ShieldCheck className="size-4 text-[#047857] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#047857] leading-tight">Owner</span>
                        <span className="text-[10px] text-[#065F46] font-mono leading-tight mt-0.5">Pak Edy</span>
                    </a>

                    <a
                        href="/demo-login/admin"
                        className="flex flex-col items-center justify-center p-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-center transition-all group"
                        title="Masuk sebagai Admin Toko Siti Admin"
                    >
                        <Shield className="size-4 text-[#2563EB] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#2563EB] leading-tight">Admin</span>
                        <span className="text-[10px] text-[#1D4ED8] font-mono leading-tight mt-0.5">Siti Admin</span>
                    </a>

                    <a
                        href="/demo-login/cashier"
                        className="flex flex-col items-center justify-center p-2 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] hover:bg-[#FDE68A] text-center transition-all group"
                        title="Masuk sebagai Kasir Budi Kasir"
                    >
                        <ShieldAlert className="size-4 text-[#D97706] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#D97706] leading-tight">Kasir</span>
                        <span className="text-[10px] text-[#B45309] font-mono leading-tight mt-0.5">Budi Kasir</span>
                    </a>
                </div>
            </div>

            <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#E2E8F0]" />
                <span className="absolute bg-background px-3 text-[11px] font-medium text-[#94A3B8] uppercase">
                    atau masuk manual
                </span>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="owner@warunkpakedy.test"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Kata Sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-[#047857] hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Kata sandi akun"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-xs font-normal text-[#64748B] cursor-pointer"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#047857] hover:bg-[#065F46] text-white font-semibold h-10 shadow-xs"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Masuk ke Sistem
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Masuk Akun WarunkPakEdy',
    description: 'Masukkan email dan kata sandi untuk mengakses sistem',
};
