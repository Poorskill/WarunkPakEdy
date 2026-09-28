import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    RotateCcw,
    CreditCard,
    QrCode,
    Banknote,
    Wallet,
    Printer,
    CheckCircle2,
    X,
    User,
    ShoppingBag,
    ShoppingCart,
    Star,
    Gift,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/status-badge';
import Logo from '@/components/logo';
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
    selling_price: string;
    stock: string;
    minimum_stock: string;
    unit: string;
    image_url?: string | null;
    category: Category | null;
}

interface MemberData {
    id: number;
    name: string;
    phone: string | null;
    formatted_phone?: string;
    is_member: boolean;
    loyalty_points: number;
    member_discount_percent: number;
}

interface PosProps {
    products?: Product[];
    categories?: Category[];
    customers?: MemberData[];
    loyaltySettings?: {
        rateAmount: number;
        redeemRate: number;
        defaultDiscountPercent: number;
    };
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface ReceiptItem {
    name: string;
    sku: string;
    unit: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface ReceiptData {
    store_name?: string;
    store_phone?: string;
    store_address?: string;
    receipt_footer?: string;
    invoice_number: string;
    date: string;
    cashier: string;
    customer: string;
    customer_phone?: string | null;
    is_member?: boolean;
    points_earned?: number;
    points_redeemed?: number;
    point_discount?: number;
    member_discount?: number;
    loyalty_balance?: number;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    amount_paid: number;
    change: number;
    payment_method: string;
    items: ReceiptItem[];
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function getXsrfToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function PosIndex({
    products = [],
    categories = [],
    customers = [],
}: PosProps) {
    const page = usePage<{ flash?: { success?: string; error?: string; receipt?: ReceiptData } }>();

    // Catalog state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<string>('0');
    const [tax, setTax] = useState<string>('0');

    // Member & Loyalty state
    const [memberPhoneInput, setMemberPhoneInput] = useState('');
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
    const [isSearchingMember, setIsSearchingMember] = useState(false);
    const [memberNotFound, setMemberNotFound] = useState(false);

    // Quick Register Member modal state
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // Point Redemption & Member Discount state
    const [applyMemberDiscount, setApplyMemberDiscount] = useState(true);
    const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

    // Payment Modal state
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer' | 'ewallet'>('cash');
    const [amountPaid, setAmountPaid] = useState<string>('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Receipt Modal state
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);

    // Financial calculations
    const subtotal = cart.reduce((acc, item) => {
        return acc + item.quantity * Number(item.product.selling_price || 0);
    }, 0);

    // Member discount calculation (default 5%)
    const memberDiscountPercent = selectedMember ? Number(selectedMember.member_discount_percent ?? 5) : 0;
    const memberDiscountAmount = (selectedMember && applyMemberDiscount)
        ? Math.round(subtotal * (memberDiscountPercent / 100))
        : 0;

    // Point redeem calculation (1 point = Rp 100)
    const maxPointsRedeemable = selectedMember
        ? Math.min(selectedMember.loyalty_points || 0, Math.floor(Math.max(0, subtotal - memberDiscountAmount) / 100))
        : 0;
    const validatedPointsToRedeem = Math.min(pointsToRedeem, maxPointsRedeemable);
    const pointDiscountAmount = validatedPointsToRedeem * 100;

    const manualDiscountAmount = Number(discount) || 0;
    const totalDiscountAmount = memberDiscountAmount + pointDiscountAmount + manualDiscountAmount;
    const taxAmount = Number(tax) || 0;
    const totalAmount = Math.max(0, subtotal - totalDiscountAmount + taxAmount);
    const numericAmountPaid = Number(amountPaid) || 0;
    const changeAmount = Math.max(0, numericAmountPaid - totalAmount);

    // Estimated points earned on checkout (Rp 10.000 = 1 point)
    const potentialPointsEarned = (selectedMember && totalAmount > 0)
        ? Math.floor(totalAmount / 10000)
        : 0;

    const openPaymentModal = useCallback(() => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong.');
            return;
        }
        setAmountPaid(totalAmount.toString());
        setIsPaymentOpen(true);
    }, [cart.length, totalAmount]);

    // Check if receipt returned in flash session
    useEffect(() => {
        if (page.props.flash?.receipt) {
            setReceipt(page.props.flash.receipt);
            setIsPaymentOpen(false);
            setCart([]);
            setDiscount('0');
            setTax('0');
            setSelectedMember(null);
            setMemberPhoneInput('');
            setPointsToRedeem(0);
            setAmountPaid('');
            setReferenceNumber('');
            setMemberNotFound(false);
        }
    }, [page.props.flash?.receipt]);

    // Keyboard Shortcuts (F9 for payment, Esc to close modals)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F9') {
                e.preventDefault();
                if (cart.length > 0 && !isPaymentOpen && !receipt) {
                    openPaymentModal();
                }
            } else if (e.key === 'Escape') {
                if (isPaymentOpen) {
                    setIsPaymentOpen(false);
                } else if (receipt) {
                    setReceipt(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.length, isPaymentOpen, receipt, openPaymentModal]);

    // Filter products
    const filteredProducts = (products || []).filter((p) => {
        const matchesCategory =
            selectedCategory === 'all' || p.category_id === selectedCategory;

        const q = search.toLowerCase().trim();
        const matchesSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.barcode && p.barcode.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
    });

    // Barcode scanner auto-add (exact match)
    useEffect(() => {
        const query = search.trim();
        if (!query) return;

        const exactProduct = products.find(
            (p) =>
                (p.barcode && p.barcode.toLowerCase() === query.toLowerCase()) ||
                p.sku.toLowerCase() === query.toLowerCase()
        );

        if (exactProduct && exactProduct.stock && Number(exactProduct.stock) > 0) {
            addToCart(exactProduct);
            setSearch('');
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
    }, [search, products]);

    // Search member by phone number
    const handleSearchMember = async (overridePhone?: string) => {
        const phone = (overridePhone !== undefined ? overridePhone : memberPhoneInput).trim();
        if (!phone) {
            setSelectedMember(null);
            setMemberNotFound(false);
            return;
        }

        setIsSearchingMember(true);
        setMemberNotFound(false);

        try {
            const res = await fetch(`/pos/member/search?phone=${encodeURIComponent(phone)}`);
            const data = await res.json();

            if (data.found && data.customer) {
                setSelectedMember(data.customer);
                setMemberNotFound(false);
                setPointsToRedeem(0);
                toast.success(`Member ditemukan: ${data.customer.name}`);
            } else {
                setSelectedMember(null);
                setMemberNotFound(true);
            }
        } catch {
            toast.error('Gagal mencari data member.');
        } finally {
            setIsSearchingMember(false);
        }
    };

    // Fast-register a member from POS modal
    const handleRegisterMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim() || !newMemberPhone.trim()) {
            toast.error('Nama dan Nomor HP member wajib diisi.');
            return;
        }

        setIsRegistering(true);

        try {
            const res = await fetch('/pos/member/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name: newMemberName,
                    phone: newMemberPhone,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Member baru berhasil didaftarkan!');
                setSelectedMember(data.customer);
                setMemberPhoneInput(data.customer.phone || newMemberPhone);
                setIsRegisterModalOpen(false);
                setMemberNotFound(false);
                setNewMemberName('');
                setNewMemberPhone('');
            } else {
                const msg = data.message || Object.values(data.errors || {})[0] || 'Gagal mendaftar member.';
                toast.error(msg as string);
            }
        } catch {
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setIsRegistering(false);
        }
    };

    const addToCart = (product: Product) => {
        const maxStock = Number(product.stock);

        if (maxStock <= 0) {
            toast.error(`Stok ${product.name} habis.`);
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);

            if (existing) {
                if (existing.quantity >= maxStock) {
                    toast.error(`Maksimal stok tersedia adalah ${maxStock} ${product.unit}.`);
                    return prev;
                }
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.product.id === productId) {
                        const newQty = item.quantity + delta;
                        const maxStock = Number(item.product.stock);

                        if (newQty > maxStock) {
                            toast.error(`Maksimal stok tersedia adalah ${maxStock} ${item.product.unit}.`);
                            return item;
                        }

                        if (newQty <= 0) {
                            return null;
                        }

                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscount('0');
        setTax('0');
        setPointsToRedeem(0);
    };

    const handleQuickCash = (amount: number) => {
        setAmountPaid(amount.toString());
    };

    const handleCheckoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === 'cash' && numericAmountPaid < totalAmount) {
            toast.error('Jumlah uang yang dibayarkan kurang.');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            customer_id: selectedMember ? selectedMember.id : null,
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
            discount: manualDiscountAmount,
            apply_member_discount: applyMemberDiscount,
            points_to_redeem: validatedPointsToRedeem,
            tax: taxAmount,
            payment_method: paymentMethod,
            amount_paid: paymentMethod === 'cash' ? numericAmountPaid : totalAmount,
            reference_number: referenceNumber || null,
        };

        router.post('/pos/checkout', payload, {
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Terjadi kesalahan saat checkout.';
                toast.error(msg as string);
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleNewTransaction = () => {
        setReceipt(null);
        setCart([]);
        setDiscount('0');
        setTax('0');
        setSelectedMember(null);
        setMemberPhoneInput('');
        setPointsToRedeem(0);
        setAmountPaid('');
        setReferenceNumber('');
        setMemberNotFound(false);
    };

    return (
        <>
            <Head title="Kasir POS Modern — WarunkPakEdy" />

            <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC]">
                {/* LEFT: Product Catalog Section (65%) */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-[#E2E8F0] overflow-hidden">
                    {/* Search & Barcode Header */}
                    <div className="p-4 bg-white border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                            <Input
                                ref={searchInputRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama barang, SKU, atau scan barcode..."
                                className="pl-9 bg-[#F8FAFC] border-[#E2E8F0] text-sm h-10 w-full"
                                autoFocus
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#0F172A]"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Category quick filter chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                            <Button
                                type="button"
                                size="sm"
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('all')}
                                className={
                                    selectedCategory === 'all'
                                        ? 'bg-[#047857] hover:bg-[#065F46] text-white shrink-0'
                                        : 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] shrink-0'
                                }
                            >
                                Semua
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    type="button"
                                    size="sm"
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={
                                        selectedCategory === cat.id
                                            ? 'bg-[#047857] hover:bg-[#065F46] text-white shrink-0'
                                            : 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] shrink-0'
                                    }
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <ShoppingBag className="size-12 text-[#94A3B8] mb-3" />
                                <h3 className="text-base font-semibold text-[#0F172A]">
                                    Produk Tidak Ditemukan
                                </h3>
                                <p className="text-xs text-[#64748B] mt-1 max-w-sm">
                                    Tidak ada produk yang cocok dengan pencarian &quot;{search}&quot;. Cek barcode atau coba kata kunci lain.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredProducts.map((product) => {
                                    const stockNum = Number(product.stock);
                                    const isOutOfStock = stockNum <= 0;
                                    const isLowStock =
                                        stockNum > 0 && stockNum <= Number(product.minimum_stock);

                                    return (
                                        <button
                                            key={product.id}
                                            type="button"
                                            disabled={isOutOfStock}
                                            onClick={() => addToCart(product)}
                                            className={`flex flex-col text-left p-3 rounded-lg border bg-white transition-all select-none group relative overflow-hidden ${
                                                isOutOfStock
                                                    ? 'opacity-60 bg-neutral-50 border-neutral-200 cursor-not-allowed'
                                                    : 'border-[#E2E8F0] hover:border-[#047857] hover:shadow-sm active:scale-[0.98]'
                                            }`}
                                        >
                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between gap-1 mb-2">
                                                <span className="text-[10px] font-mono text-[#64748B] truncate">
                                                    {product.sku}
                                                </span>
                                                {isOutOfStock ? (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                                                        Habis
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                                                        Sisa {stockNum}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-medium text-[#16A34A]">
                                                        Stok {stockNum} {product.unit}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product Title & Image */}
                                            <div className="flex gap-2.5">
                                                {product.image_url && (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="size-11 rounded-md object-cover border border-[#E2E8F0] shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-semibold text-[#0F172A] line-clamp-2 leading-snug group-hover:text-[#047857]">
                                                        {product.name}
                                                    </h4>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="mt-auto pt-2">
                                                <p
                                                    className="text-sm font-bold text-[#047857]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {formatRupiah(Number(product.selling_price))}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Cart & Checkout Section (35%, min-w 380px) */}
                <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col bg-white shrink-0 h-full border-t lg:border-t-0 shadow-xs">
                    {/* Cart Header: Minimarket Member System */}
                    <div className="p-3.5 border-b border-[#E2E8F0] bg-white space-y-2.5 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                                <User className="size-3.5 text-[#047857]" />
                                <span>Member / Pelanggan</span>
                            </div>
                            {cart.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCart}
                                    className="h-6 px-2 text-[11px] text-[#DC2626] hover:bg-[#FEF2F2]"
                                    title="Kosongkan Keranjang"
                                >
                                    <RotateCcw className="size-3 mr-1" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {selectedMember ? (
                            <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-3 text-xs space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 font-bold text-[#047857]">
                                            <CheckCircle2 className="size-3.5" />
                                            <span>Member Terdaftar</span>
                                        </div>
                                        <p className="font-bold text-sm text-[#0F172A] mt-0.5">{selectedMember.name}</p>
                                        <p className="text-[11px] text-[#065F46] font-mono">{selectedMember.formatted_phone || selectedMember.phone}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMember(null);
                                            setMemberPhoneInput('');
                                            setPointsToRedeem(0);
                                        }}
                                        className="h-7 px-2.5 text-[11px] bg-white border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5]"
                                    >
                                        Ganti
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-[#A7F3D0]/60 text-[11px]">
                                    <span className="font-semibold text-[#047857] flex items-center gap-1">
                                        <Star className="size-3.5 fill-[#EAB308] text-[#EAB308]" />
                                        Saldo: <strong className="text-[#0F172A]">{(selectedMember.loyalty_points || 0).toLocaleString('id-ID')} Pt</strong>
                                    </span>
                                    <span className="text-[#065F46] bg-white px-2 py-0.5 rounded border border-[#A7F3D0] font-medium flex items-center gap-1">
                                        <Gift className="size-3 text-[#047857]" />
                                        Diskon {selectedMember.member_discount_percent ?? 5}%
                                    </span>
                                </div>

                                {/* Redeem Points Section */}
                                {(selectedMember.loyalty_points || 0) > 0 && subtotal > 0 && (
                                    <div className="pt-2 border-t border-[#A7F3D0]/60 space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-[#065F46] font-medium">Tukar Point (1 pt = Rp 100):</span>
                                            {validatedPointsToRedeem > 0 && (
                                                <span className="font-bold text-[#15803D]">
                                                    -{formatRupiah(pointDiscountAmount)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max={maxPointsRedeemable}
                                                value={pointsToRedeem || ''}
                                                onChange={(e) => {
                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                    setPointsToRedeem(Math.min(val, maxPointsRedeemable));
                                                }}
                                                placeholder="Jml point..."
                                                className="h-7 text-xs bg-white border-[#A7F3D0] w-28"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setPointsToRedeem(pointsToRedeem === maxPointsRedeemable ? 0 : maxPointsRedeemable);
                                                }}
                                                className="h-7 px-2 text-[10px] text-[#047857] hover:bg-[#D1FAE5]"
                                            >
                                                {pointsToRedeem > 0 ? 'Batal' : 'Gunakan Maks'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative flex items-center">
                                    <Input
                                        value={memberPhoneInput}
                                        onChange={(e) => {
                                            setMemberPhoneInput(e.target.value);
                                            if (memberNotFound) setMemberNotFound(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchMember();
                                            }
                                        }}
                                        placeholder="Ketik No. HP Member (08xxxxxxxxxx)..."
                                        className="pr-16 text-xs h-9 font-mono"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={isSearchingMember || !memberPhoneInput.trim()}
                                        onClick={() => handleSearchMember()}
                                        className="absolute right-1 h-7 px-2.5 bg-[#047857] hover:bg-[#065F46] text-white text-xs gap-1"
                                    >
                                        {isSearchingMember ? (
                                            <Loader2 className="size-3 animate-spin" />
                                        ) : (
                                            <Search className="size-3" />
                                        )}
                                        <span>Cari</span>
                                    </Button>
                                </div>

                                {memberNotFound && (
                                    <div className="p-2.5 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] text-xs text-[#92400E] flex flex-col gap-1.5">
                                        <p className="font-medium">Nomor HP belum terdaftar sebagai member.</p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => {
                                                    setNewMemberPhone(memberPhoneInput);
                                                    setIsRegisterModalOpen(true);
                                                }}
                                                className="h-7 px-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold"
                                            >
                                                + Daftarkan Member
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMemberPhoneInput('');
                                                    setMemberNotFound(false);
                                                }}
                                                className="text-[11px] underline text-[#92400E] hover:text-[#78350F]"
                                            >
                                                Lewati
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#F1F5F9] min-h-48">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <ShoppingCart className="size-12 text-[#CBD5E1] mb-2" />
                                <p className="text-sm font-semibold text-[#64748B]">
                                    Keranjang Kosong
                                </p>
                                <p className="text-xs text-[#94A3B8] mt-1">
                                    Klik produk di sebelah kiri atau scan barcode untuk menambahkan ke kasir
                                </p>
                            </div>
                        ) : (
                            cart.map(({ product, quantity }) => {
                                const price = Number(product.selling_price);
                                const itemSubtotal = quantity * price;

                                return (
                                    <div key={product.id} className="py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-[#0F172A] truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-[11px] text-[#64748B] mt-0.5">
                                                    {formatRupiah(price)} / {product.unit}
                                                </p>
                                            </div>
                                            <p
                                                className="text-xs font-bold text-[#0F172A] shrink-0"
                                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {formatRupiah(itemSubtotal)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden bg-[#F8FAFC]">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(product.id, -1)}
                                                    className="size-7 flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span
                                                    className="w-10 text-center text-xs font-bold text-[#0F172A]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(product.id, 1)}
                                                    className="size-7 flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(product.id)}
                                                className="text-[#94A3B8] hover:text-[#DC2626] p-1"
                                                title="Hapus item"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Cart Footer & Checkout */}
                    <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-3 shrink-0">
                        <div className="space-y-1.5 text-xs text-[#64748B]">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-[#0F172A]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {formatRupiah(subtotal)}
                                </span>
                            </div>

                            {selectedMember && memberDiscountAmount > 0 && (
                                <div className="flex justify-between text-[#047857]">
                                    <span className="flex items-center gap-1">
                                        <Gift className="size-3" />
                                        Diskon Member ({memberDiscountPercent}%)
                                    </span>
                                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        -{formatRupiah(memberDiscountAmount)}
                                    </span>
                                </div>
                            )}

                            {selectedMember && pointDiscountAmount > 0 && (
                                <div className="flex justify-between text-[#D97706]">
                                    <span className="flex items-center gap-1">
                                        <Star className="size-3" />
                                        Tukar Point ({validatedPointsToRedeem} pt)
                                    </span>
                                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        -{formatRupiah(pointDiscountAmount)}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span>Diskon Tambahan (Rp)</span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-28 h-7 text-right text-xs bg-white"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Pajak (Rp)</span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={tax}
                                    onChange={(e) => setTax(e.target.value)}
                                    className="w-28 h-7 text-right text-xs bg-white"
                                />
                            </div>

                            {selectedMember && potentialPointsEarned > 0 && (
                                <div className="flex justify-between text-[#16A34A] bg-[#DCFCE7] p-1.5 rounded font-semibold text-[11px]">
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="size-3" />
                                        Point Diperoleh:
                                    </span>
                                    <span>+{potentialPointsEarned} Point</span>
                                </div>
                            )}
                        </div>

                        {/* Grand Total Display */}
                        <div className="pt-2 border-t border-[#E2E8F0] flex items-baseline justify-between">
                            <span className="text-sm font-bold text-[#0F172A]">Total Bayar</span>
                            <span
                                className="text-2xl font-extrabold text-[#047857]"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {formatRupiah(totalAmount)}
                            </span>
                        </div>

                        {/* Payment CTA Button */}
                        <Button
                            type="button"
                            disabled={cart.length === 0}
                            onClick={openPaymentModal}
                            className="w-full h-12 bg-[#047857] hover:bg-[#065F46] text-white font-bold text-base shadow-sm"
                        >
                            Bayar (F9)
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Register Member Modal */}
            <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-[#0F172A]">
                            Daftarkan Member Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#64748B]">
                            Pendaftaran cepat member WarunkPakEdy saat transaksi di kasir.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRegisterMember} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-member-name" className="text-xs font-semibold text-[#0F172A]">
                                Nama Lengkap Member <span className="text-[#DC2626]">*</span>
                            </Label>
                            <Input
                                id="new-member-name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Contoh: Baruna Dwi Cahya"
                                className="h-9 text-xs"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="new-member-phone" className="text-xs font-semibold text-[#0F172A]">
                                Nomor HP Member <span className="text-[#DC2626]">*</span>
                            </Label>
                            <Input
                                id="new-member-phone"
                                value={newMemberPhone}
                                onChange={(e) => setNewMemberPhone(e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="h-9 text-xs font-mono"
                                required
                            />
                            <p className="text-[10px] text-[#64748B]">
                                Nomor HP adalah identitas utama saat pelanggan berbelanja berikutnya.
                            </p>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRegisterModalOpen(false)}
                                className="h-9 text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isRegistering || !newMemberName.trim() || !newMemberPhone.trim()}
                                className="h-9 text-xs bg-[#047857] hover:bg-[#065F46] text-white font-semibold gap-1.5"
                            >
                                {isRegistering && <Loader2 className="size-3.5 animate-spin" />}
                                Simpan Member
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#0F172A]">
                            Pembayaran Kasir
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
                        {/* Member Banner in Payment Modal */}
                        {selectedMember && (
                            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs space-y-1 text-[#065F46]">
                                <div className="flex justify-between font-bold">
                                    <span>Member: {selectedMember.name}</span>
                                    <span className="font-mono">{selectedMember.formatted_phone || selectedMember.phone}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span>Saldo Point Saat Ini:</span>
                                    <span className="font-semibold text-[#0F172A]">{(selectedMember.loyalty_points || 0).toLocaleString('id-ID')} Pt</span>
                                </div>
                                {potentialPointsEarned > 0 && (
                                    <div className="flex justify-between text-[11px] text-[#16A34A] font-semibold">
                                        <span>Point Diperoleh Transaksi Ini:</span>
                                        <span>+{potentialPointsEarned} Pt</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Total Highlight */}
                        <div className="rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] p-4 text-center">
                            <p className="text-xs font-semibold text-[#047857] uppercase tracking-wider">
                                Total yang Harus Dibayar
                            </p>
                            <p
                                className="text-3xl font-extrabold text-[#047857] mt-1"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {formatRupiah(totalAmount)}
                            </p>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-[#0F172A]">
                                Metode Pembayaran
                            </Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'cash', label: 'Tunai', icon: Banknote },
                                    { id: 'qris', label: 'QRIS', icon: QrCode },
                                    { id: 'transfer', label: 'Transfer', icon: CreditCard },
                                    { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
                                ].map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = paymentMethod === method.id;

                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id as any)}
                                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                                                isSelected
                                                    ? 'border-[#047857] bg-[#ECFDF5] text-[#047857]'
                                                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                                            }`}
                                        >
                                            <Icon className="size-4 mb-1" />
                                            <span>{method.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cash specific: Input Amount & Quick Denominations */}
                        {paymentMethod === 'cash' ? (
                            <div className="space-y-2">
                                <Label htmlFor="amount-paid" className="text-xs font-semibold text-[#0F172A]">
                                    Uang Diterima (Rp)
                                </Label>
                                <Input
                                    id="amount-paid"
                                    type="number"
                                    min={totalAmount}
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    placeholder="Masukkan nominal uang tunai..."
                                    className="h-10 text-base font-bold text-[#0F172A]"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                    autoFocus
                                    required
                                />

                                {/* Quick Denomination Chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleQuickCash(totalAmount)}
                                        className="text-xs h-7 px-2.5 bg-white border-[#E2E8F0] font-semibold text-[#047857]"
                                    >
                                        Uang Pas
                                    </Button>
                                    {[10000, 20000, 50000, 100000, 200000].map((amt) => (
                                        <Button
                                            key={amt}
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleQuickCash(amt)}
                                            className="text-xs h-7 px-2 bg-white border-[#E2E8F0] text-[#64748B]"
                                        >
                                            {formatRupiah(amt)}
                                        </Button>
                                    ))}
                                </div>

                                {/* Change amount display */}
                                {numericAmountPaid >= totalAmount && (
                                    <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex justify-between items-center mt-2">
                                        <span className="text-xs font-medium text-[#64748B]">Kembalian:</span>
                                        <span
                                            className="text-lg font-extrabold text-[#15803D]"
                                            style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            {formatRupiah(changeAmount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label htmlFor="ref-number" className="text-xs font-semibold text-[#0F172A]">
                                    Nomor Referensi Transaksi (Opsional)
                                </Label>
                                <Input
                                    id="ref-number"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder="Contoh: REF-123456789"
                                    className="h-9 text-xs"
                                />
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPaymentOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#047857] hover:bg-[#065F46] text-white font-bold"
                            >
                                {isSubmitting ? 'Memproses...' : 'Konfirmasi & Selesai'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Receipt Modal (Thermal Style) */}
            <Dialog open={!!receipt} onOpenChange={(open) => !open && handleNewTransaction()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#15803D]">
                            <CheckCircle2 className="size-5 text-[#16A34A]" />
                            Transaksi Berhasil
                        </DialogTitle>
                    </DialogHeader>

                    {receipt && (
                        <div className="space-y-4 pt-1">
                            {/* Member Reward Highlight */}
                            {receipt.is_member && (
                                <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs space-y-1.5 text-[#065F46]">
                                    <div className="flex justify-between items-center font-bold text-sm text-[#047857]">
                                        <span className="flex items-center gap-1.5">
                                            <Star className="size-4 fill-[#EAB308] text-[#EAB308]" />
                                            Member: {receipt.customer}
                                        </span>
                                        <span className="font-mono text-xs text-[#065F46]">{receipt.customer_phone}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span>Point Diperoleh:</span>
                                        <span className="font-bold text-[#16A34A]">+{receipt.points_earned || 0} Point</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-[#A7F3D0] font-semibold text-xs text-[#0F172A]">
                                        <span>Total Saldo Point:</span>
                                        <span className="font-extrabold text-[#047857]">{(receipt.loyalty_balance ?? 0).toLocaleString('id-ID')} Point</span>
                                    </div>
                                </div>
                            )}

                            {/* Printable Thermal Receipt Card */}
                            <div
                                id="printable-receipt"
                                className="border border-dashed border-[#CBD5E1] bg-white rounded-lg p-5 text-xs text-[#0F172A] font-mono leading-relaxed space-y-3"
                            >
                                <div className="text-center space-y-1">
                                    <Logo className="size-12 rounded mx-auto mb-1" />
                                    <h3 className="font-bold text-sm uppercase">
                                        {receipt.store_name || 'WARUNK PAK EDY'}
                                    </h3>
                                    <p className="text-[11px] text-[#64748B]">
                                        {receipt.store_phone || 'Kasir & Manajemen Retail'}
                                    </p>
                                    <p className="text-[10px] text-[#94A3B8]">
                                        {receipt.store_address || 'Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217'}
                                    </p>
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>No: {receipt.invoice_number}</span>
                                        <span>{receipt.date}</span>
                                    </div>
                                    <div className="flex justify-between text-[#64748B]">
                                        <span>Kasir: {receipt.cashier}</span>
                                        <span>Pelanggan: {receipt.customer}</span>
                                    </div>
                                    {receipt.customer_phone && (
                                        <div className="flex justify-between text-[#64748B]">
                                            <span>No. HP:</span>
                                            <span>{receipt.customer_phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1.5">
                                    {(receipt.items || []).map((item, i) => (
                                        <div key={i} className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <p className="font-medium text-[#0F172A]">{item.name}</p>
                                                <p className="text-[10px] text-[#64748B]">
                                                    {item.quantity} {item.unit} x {formatRupiah(item.unit_price)}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-right whitespace-nowrap">
                                                {formatRupiah(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {receipt.is_member && (
                                    <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px] text-[#047857]">
                                        <div className="flex justify-between font-bold">
                                            <span>MEMBER: {receipt.customer}</span>
                                            <span>{receipt.customer_phone || ''}</span>
                                        </div>
                                        {receipt.member_discount && receipt.member_discount > 0 && (
                                            <div className="flex justify-between text-[10px]">
                                                <span>Diskon Member:</span>
                                                <span>-{formatRupiah(receipt.member_discount)}</span>
                                            </div>
                                        )}
                                        {receipt.point_discount && receipt.point_discount > 0 && (
                                            <div className="flex justify-between text-[10px]">
                                                <span>Diskon Tukar Point:</span>
                                                <span>-{formatRupiah(receipt.point_discount)}</span>
                                            </div>
                                        )}
                                        {receipt.points_earned && receipt.points_earned > 0 && (
                                            <div className="flex justify-between text-[#15803D] font-semibold text-[10px]">
                                                <span>Point Diperoleh:</span>
                                                <span>+{receipt.points_earned} Point</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold border-t border-dotted border-[#A7F3D0] pt-1 text-[11px]">
                                            <span>Saldo Point Akhir:</span>
                                            <span>{(receipt.loyalty_balance ?? 0).toLocaleString('id-ID')} Point</span>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-dashed border-[#CBD5E1] pt-2 space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatRupiah(receipt.subtotal)}</span>
                                    </div>
                                    {receipt.discount > 0 && (
                                        <div className="flex justify-between text-[#DC2626]">
                                            <span>Total Diskon:</span>
                                            <span>-{formatRupiah(receipt.discount)}</span>
                                        </div>
                                    )}
                                    {receipt.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span>Pajak:</span>
                                            <span>+{formatRupiah(receipt.tax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-[#E2E8F0]">
                                        <span>TOTAL:</span>
                                        <span>{formatRupiah(receipt.total)}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span>Bayar ({receipt.payment_method?.toUpperCase()}):</span>
                                        <span>{formatRupiah(receipt.amount_paid)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-[#15803D]">
                                        <span>Kembali:</span>
                                        <span>{formatRupiah(receipt.change)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-[#CBD5E1] pt-3 text-center text-[10px] text-[#64748B]">
                                    <p>{receipt.receipt_footer || 'Terima kasih atas kunjungan Anda!'}</p>
                                    <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
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
                                    Cetak Struk
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNewTransaction}
                                    className="bg-[#047857] hover:bg-[#065F46] text-white font-semibold"
                                >
                                    Transaksi Baru
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

PosIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kasir POS', href: '/pos' },
    ],
};
