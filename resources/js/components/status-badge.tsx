interface StatusBadgeProps {
    status: 'normal' | 'menipis' | 'habis' | 'active' | 'inactive';
    label?: string;
    className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
    const configs = {
        normal: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', defaultLabel: 'Normal' },
        menipis: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', defaultLabel: 'Menipis' },
        habis: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', defaultLabel: 'Habis' },
        active: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', defaultLabel: 'Aktif' },
        inactive: { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', defaultLabel: 'Nonaktif' },
    };

    const config = configs[status] || configs.normal;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${config.bg} ${config.text} ${className}`}
        >
            {label || config.defaultLabel}
        </span>
    );
}
