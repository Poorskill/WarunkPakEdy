import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
    className?: string;
}

export function Pagination({ links, from, to, total, className = '' }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-sm text-[#64748B] ${className}`}>
            {total !== undefined && from !== undefined && to !== undefined && (
                <div>
                    Menampilkan <span className="font-semibold text-[#0F172A]">{from}</span> sampai{' '}
                    <span className="font-semibold text-[#0F172A]">{to}</span> dari{' '}
                    <span className="font-semibold text-[#0F172A]">{total}</span> data
                </div>
            )}
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isPrev = link.label.includes('&laquo;') || link.label.toLowerCase().includes('previous');
                    const isNext = link.label.includes('&raquo;') || link.label.toLowerCase().includes('next');

                    if (!link.url) {
                        return (
                            <span
                                key={i}
                                className="px-3 py-1.5 text-xs text-[#CBD5E1] rounded border border-[#E2E8F0] cursor-not-allowed select-none"
                            >
                                {isPrev ? <ChevronLeft className="size-3.5 inline" /> : isNext ? <ChevronRight className="size-3.5 inline" /> : link.label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            preserveState
                            preserveScroll
                            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                link.active
                                    ? 'bg-[#047857] text-white border-[#047857]'
                                    : 'text-[#0F172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                            }`}
                        >
                            {isPrev ? <ChevronLeft className="size-3.5 inline" /> : isNext ? <ChevronRight className="size-3.5 inline" /> : link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
