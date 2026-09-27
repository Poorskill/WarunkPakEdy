import type { ImgHTMLAttributes } from 'react';
import logoImage from '../../images/73076d13-baf0-4125-8c28-995223479bc7.png';

export default function AppLogoIcon({
    className = 'size-8',
    alt = 'WarunkPakEdy Logo',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
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
