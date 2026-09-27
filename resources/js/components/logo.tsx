import type { ImgHTMLAttributes } from 'react';
import logoImage from '../../images/73076d13-baf0-4125-8c28-995223479bc7.png';

export interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    className?: string;
}

export default function Logo({
    className = 'size-8',
    alt = 'WarunkPakEdy Logo',
    ...props
}: LogoProps) {
    return (
        <img
            src={logoImage}
            alt={alt}
            className={`object-contain rounded-md shrink-0 ${className}`}
            {...props}
        />
    );
}

export { logoImage };
