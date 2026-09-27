import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Receipt,
    Eye,
    RotateCcw,
    Printer,
    CheckCircle2,
    Calendar,
    User,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/search-input';
import { Pagination, type PaginationLink } from '@/components/pagination';
import Logo from '@/components/logo';

interface Payment {
    id: number;
    payment_method: string;
    amount: string;
    reference_number: string | null;
}

interface SaleItem {
    id: number;
    product_name: string;
    sku: string;
    quantity: string;
    unit_price: string;
    subtotal: string;
}

interface Sale {
    id: number;
    invoice_number: string;
    sale_date: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    status: 'completed' | 'pending' | 'cancelled' | 'returned';
    notes: string | null;
    customer: { id: number; name: string } | null;
    user: { id: number; name: string };
    payments: Payment[];
    items: SaleItem[];
}

interface SalesProps {
    sales: {
        data: Sale[];
        links: PaginationLink[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
        status: string;
        payment_method: string;
        date: string;
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

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusBadge(status: 'completed' | 'pending' | 'cancelled' | 'returned'): {
    label: string;
    bg: string;
    text: string;
} {
    switch (status) {
        case 'completed':
            return { label: 'Lunas', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' };
        case 'pending':
            return { label: 'Pending', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' };
        case 'cancelled':
            return { label: 'Dibatalkan', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' };
        case 'returned':
            return { label: 'Diretur Penuh', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' };
        default:
            return { label: status, bg: 'bg-neutral-100', text: 'text-neutral-700' };
    }
}

function paymentMethodLabel(method: string): string {
    const map: Record<string, string> = {
        cash: 'Tunai',
        qris: 'QRIS',
        transfer: 'Transfer',
        ewallet: 'E-Wallet',
    };
    return map[method] || method.toUpperCase();
}

export default function SalesIndex({ sales, filters }: SalesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const [date, setDate] = useState(filters.date || '');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const applyFilters = (
        newSearch: string,
        newStatus: string,
        newMethod: string,
        newDate: string
    ) => {
        router.get(
            '/sales',
            {
                search: newSearch,
                status: newStatus === 'all' ? '' : newStatus,
                payment_method: newMethod === 'all' ? '' : newMethod,
                date: newDate,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        applyFilters(val, status, paymentMethod, date);
    };

    const handleStatusChange = (val: string) => {
        setStatus(val);
        applyFilters(search, val, paymentMethod, date);
    };

    const handlePaymentMethodChange = (val: string) => {
        setPaymentMethod(val);
        applyFilters(search, status, val, date);
    };

    const handleDateChange = (val: string) => {
        setDate(val);
        applyFilters(search, status, paymentMethod, val);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <>
            <Head title="Riwayat Transaksi Penjualan" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-bold leading-9 text-[#0F172A]">
                            Riwayat Penjualan
                        </h1>
                        <p className="text-sm text-[#64748B]">
                            Semua catatan transaksi kasir, detail faktur, dan bukti pembayaran
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-white">
                    {/* Filters */}
                    <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap gap-3 items-center justify-between">
                        <SearchInput
                            value={search}
                            onChange={handleSearch}
                            placeholder="Cari no. invoice atau pelanggan..."
                            className="w-full sm:max-w-xs"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-36 h-9 text-xs"
                            />

                            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                                <SelectTrigger className="w-36 h-9 text-xs">
                                    <SelectValue placeholder="Metode Bayar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Metode</SelectItem>
                                    <SelectItem value="cash">Tunai</SelectItem>
                                    <SelectItem value="qris">QRIS</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-36 h-9 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="completed">Lunas</SelectItem>
                                    <SelectItem value="returned">Diretur</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {sales.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Receipt className="size-10 text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium text-[#64748B]">
                                Belum ada riwayat penjualan
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Transaksi penjualan kasir akan otomatis tersimpan dan dapat dilacak di sini
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-[#E2E8F0] bg-[#F8FAFC]">
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            No. Invoice
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Tanggal & Waktu
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Kasir
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Pelanggan
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Metode
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Total Transaksi
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] w-28">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.data.map((sale) => {
                                        const badge = statusBadge(sale.status);
                                        const payment = sale.payments[0];

                                        return (
                                            <tr
                                                key={sale.id}
                                                className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                                    {sale.invoice_number}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                                                    {formatDate(sale.sale_date)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#0F172A]">
                                                    {sale.user?.name || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#64748B]">
                                                    {sale.customer?.name || 'Umum'}
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs">
                                                    <span className="px-2 py-0.5 rounded bg-[#F1F5F9] font-medium text-[#0F172A]">
                                                        {payment
                                                            ? paymentMethodLabel(payment.payment_method)
                                                            : '-'}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right text-sm font-bold text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {formatRupiah(Number(sale.total))}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedSale(sale)}
                                                            className="size-8 text-[#64748B] hover:text-[#047857]"
                                                            title="Lihat Struk"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        {sale.status === 'completed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                                className="size-8 text-[#64748B] hover:text-[#D97706]"
                                                                title="Retur Barang"
                                                            >
                                                                <Link href={`/returns/create?sale_id=${sale.id}`}>
                                                                    <RotateCcw className="size-4" />
                                                                </Link>
                                                            </Button>
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
                            links={sales.links}
                            from={sales.from}
                            to={sales.to}
                            total={sales.total}
                        />
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-[#0F172A]">
                            Rincian Struk Penjualan
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSale && (
                        <div className="space-y-4 pt-1">
                            <div
                                id="printable-receipt"
                                className="border border-dashed border-[#CBD5E1] bg-white rounded-lg p-5 text-xs text-[#0F172A] font-mono leading-relaxed space-y-3"
                            >
                                <div className="text-center space-y-1">
                                    <Logo className="size-12 rounded mx-auto mb-1" />
                                    <h3 className="font-bold text-sm">WARUNK PAK EDY</h3>
                                    <p className="text-[11px] text-[#64748B]">Kasir & Warung Retail</p>
                                    <p className="text-[10px] text-[#94A3B8]">Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217</p>
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>No: {selectedSale.invoice_number}</span>
                                        <span>{formatDate(selectedSale.sale_date)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#64748B]">
                                        <span>Kasir: {selectedSale.user?.name || '-'}</span>
                                        <span>Pelanggan: {selectedSale.customer?.name || 'Umum'}</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1.5">
                                    {selectedSale.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <p className="font-medium text-[#0F172A]">{item.product_name}</p>
                                                <p className="text-[10px] text-[#64748B]">
                                                    {item.quantity} x {formatRupiah(Number(item.unit_price))}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-right whitespace-nowrap">
                                                {formatRupiah(Number(item.subtotal))}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatRupiah(Number(selectedSale.subtotal))}</span>
                                    </div>
                                    {Number(selectedSale.discount) > 0 && (
                                        <div className="flex justify-between text-[#DC2626]">
                                            <span>Diskon:</span>
                                            <span>-{formatRupiah(Number(selectedSale.discount))}</span>
                                        </div>
                                    )}
                                    {Number(selectedSale.tax) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Pajak:</span>
                                            <span>+{formatRupiah(Number(selectedSale.tax))}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-[#E2E8F0]">
                                        <span>TOTAL:</span>
                                        <span>{formatRupiah(Number(selectedSale.total))}</span>
                                    </div>
                                    {selectedSale.payments[0] && (
                                        <>
                                            <div className="flex justify-between pt-1">
                                                <span>
                                                    Bayar ({paymentMethodLabel(selectedSale.payments[0].payment_method)}):
                                                </span>
                                                <span>{formatRupiah(Number(selectedSale.payments[0].amount))}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-[#15803D]">
                                                <span>Kembali:</span>
                                                <span>
                                                    {formatRupiah(
                                                        Math.max(
                                                            0,
                                                            Number(selectedSale.payments[0].amount) -
                                                                Number(selectedSale.total)
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-3 text-center text-[10px] text-[#64748B]">
                                    <p>Terima kasih atas kunjungan Anda!</p>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrintReceipt}
                                    className="gap-1.5"
                                >
                                    <Printer className="size-4" />
                                    Cetak Ulang
                                </Button>
                                {selectedSale.status === 'completed' && (
                                    <Button asChild className="bg-[#D97706] hover:bg-[#B45309] text-white">
                                        <Link href={`/returns/create?sale_id=${selectedSale.id}`}>
                                            <RotateCcw className="size-4 mr-1.5" />
                                            Retur Barang
                                        </Link>
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

SalesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Penjualan', href: '/sales' },
    ],
};
