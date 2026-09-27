<?php

namespace App\Helpers;

class PhoneHelper
{
    /**
     * Normalize a phone number to standard Indonesian format: e.g. 081234567890
     */
    public static function normalize(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        // Remove all non-digit characters
        $clean = preg_replace('/[^0-9]/', '', $phone);

        if (! $clean) {
            return null;
        }

        // If starts with 628..., convert to 08...
        if (str_starts_with($clean, '628')) {
            $clean = '0'.substr($clean, 2);
        } elseif (str_starts_with($clean, '8')) {
            $clean = '0'.$clean;
        }

        return $clean;
    }

    /**
     * Format for clean Indonesian display: e.g. 0812-3456-7890
     */
    public static function format(?string $phone): string
    {
        $normalized = self::normalize($phone);

        if (! $normalized) {
            return '-';
        }

        $len = strlen($normalized);

        if ($len >= 10 && $len <= 13) {
            $p1 = substr($normalized, 0, 4);
            $p2 = substr($normalized, 4, 4);
            $p3 = substr($normalized, 8);

            return "{$p1}-{$p2}-{$p3}";
        }

        return $normalized;
    }

    /**
     * Generate variations for search query to match both 08xxx, +628xxx, 628xxx, dashed
     *
     * @return array<int, string>
     */
    public static function searchVariations(string $input): array
    {
        $clean = preg_replace('/[^0-9]/', '', $input);
        if (! $clean) {
            return [$input];
        }

        $norm = self::normalize($clean);
        $variations = [$input, $clean];

        if ($norm) {
            $variations[] = $norm;
            if (str_starts_with($norm, '08')) {
                $variations[] = '62'.substr($norm, 1);
                $variations[] = '+62'.substr($norm, 1);
                $variations[] = self::format($norm);
            }
        }

        return array_values(array_unique(array_filter($variations)));
    }
}
