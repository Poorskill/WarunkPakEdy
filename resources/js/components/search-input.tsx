import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    placeholder = 'Cari...',
    className = '',
}: SearchInputProps) {
    return (
        <div className={`relative flex items-center ${className}`}>
            <Search className="absolute left-3 size-4 text-[#94A3B8] pointer-events-none" />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-9 pr-8 h-9 text-sm rounded-lg border-[#CBD5E1] focus:border-[#047857] focus:ring-1 focus:ring-[#047857]"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-2.5 text-[#94A3B8] hover:text-[#0F172A]"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}
