import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    LayoutGrid,
    Package,
    PackageSearch,
    Receipt,
    RotateCcw,
    Settings,
    ShoppingCart,
    Store,
    Truck,
    TrendingUp,
    Users,
    UserCircle,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain, type NavGroup } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';

const baseNavGroups: NavGroup[] = [
    {
        label: 'Utama',
        items: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Kasir', href: '/pos', icon: ShoppingCart },
        ],
    },
    {
        label: 'Toko',
        items: [
            { title: 'Produk', href: '/products', icon: Package },
            { title: 'Kategori', href: '/categories', icon: Store },
            { title: 'Stok', href: '/inventory', icon: Warehouse },
            { title: 'Pembelian', href: '/purchases', icon: Truck },
            { title: 'Supplier', href: '/suppliers', icon: Store },
            { title: 'Pelanggan', href: '/customers', icon: UserCircle },
        ],
    },
    {
        label: 'Transaksi',
        items: [
            { title: 'Penjualan', href: '/sales', icon: Receipt },
            { title: 'Retur', href: '/returns', icon: RotateCcw },
        ],
    },
    {
        label: 'Laporan',
        items: [
            { title: 'Laporan Penjualan', href: '/reports/sales', icon: BarChart3 },
            { title: 'Laporan Stok', href: '/reports/stock', icon: PackageSearch },
            { title: 'Laporan Keuntungan', href: '/reports/profit', icon: TrendingUp },
        ],
    },
    {
        label: 'Sistem',
        items: [
            { title: 'Pengguna', href: '/users', icon: Users },
            { title: 'Pengaturan', href: '/settings/store', icon: Settings },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role || 'owner';

    // Role-based navigation filtering according to DESIGN.md Section 43
    const filteredGroups: NavGroup[] = baseNavGroups
        .map((group) => {
            if (group.label === 'Sistem') {
                if (role === 'owner') return group;
                if (role === 'admin') {
                    return {
                        ...group,
                        items: group.items.filter((item) => item.href !== '/users'),
                    };
                }
                return null;
            }

            if (group.label === 'Laporan') {
                if (role === 'cashier') return null;
                return group;
            }

            if (group.label === 'Toko') {
                if (role === 'cashier') {
                    return {
                        ...group,
                        items: group.items.filter((item) => item.href === '/customers'),
                    };
                }
                return group;
            }

            return group;
        })
        .filter(Boolean) as NavGroup[];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-16 py-2">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                <NavMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
