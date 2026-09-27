import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 group-data-[collapsible=icon]:size-8 items-center justify-center rounded-xl overflow-hidden shrink-0">
                <AppLogoIcon className="size-12 group-data-[collapsible=icon]:size-8 rounded-xl object-contain" />
            </div>
            <div className="ml-3 grid flex-1 text-left">
                <span className="truncate text-base font-bold tracking-tight text-[#0F172A] leading-tight">
                    WarunkPakEdy
                </span>
                <span className="truncate text-xs font-medium text-[#64748B] leading-tight">
                    Kasir & Warung POS
                </span>
            </div>
        </>
    );
}
