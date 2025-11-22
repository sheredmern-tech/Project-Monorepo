// ============================================================================
// FILE: components/shared/language-switcher.tsx
// Language switcher component with dropdown
// ============================================================================
'use client';

import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/i18n/use-language';
import { cn } from '@/lib/utils';

const languageNames = {
  id: 'Bahasa Indonesia',
  en: 'English',
} as const;

const languageFlags = {
  id: '🇮🇩',
  en: '🇺🇸',
} as const;

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'ghost',
  showLabel = false,
  className,
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={cn('gap-2', className)}>
          <Languages className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {languageNames[currentLanguage]}
            </span>
          )}
          <span className="text-base">{languageFlags[currentLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => changeLanguage(lang)}
            className="gap-3 cursor-pointer"
          >
            <span className="text-base w-6">{languageFlags[lang]}</span>
            <span className="flex-1">{languageNames[lang]}</span>
            {currentLanguage === lang && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
