// ============================================================================
// FILE: components/shared/i18n-demo.tsx
// Demo component showing i18n usage examples
// ============================================================================
'use client';

import { useTranslation } from '@/lib/i18n/client';
import { useLanguage } from '@/lib/i18n/use-language';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function I18nDemo() {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage, 'common');
  const { t: tDokumen } = useTranslation(currentLanguage, 'dokumen');

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {t('app.welcome')} - i18n Demo
        </h2>
        <p className="text-muted-foreground">
          Current Language: <strong>{currentLanguage.toUpperCase()}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Common Translations:</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline">{t('app.save')}</Button>
          <Button variant="outline">{t('app.cancel')}</Button>
          <Button variant="outline">{t('app.delete')}</Button>
          <Button variant="outline">{t('app.edit')}</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Navigation Translations:</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-secondary rounded-md text-sm">
            {t('navigation.dashboard')}
          </span>
          <span className="px-3 py-1 bg-secondary rounded-md text-sm">
            {t('navigation.documents')}
          </span>
          <span className="px-3 py-1 bg-secondary rounded-md text-sm">
            {t('navigation.cases')}
          </span>
          <span className="px-3 py-1 bg-secondary rounded-md text-sm">
            {t('navigation.clients')}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Document Module Translations:</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md text-sm">
            {tDokumen('title')}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md text-sm">
            {tDokumen('uploadDocument')}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md text-sm">
            {tDokumen('folder.create')}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md text-sm">
            {tDokumen('bulk.move')}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Time Translations:</h3>
        <p className="text-sm">
          {t('time.today')}, {t('time.yesterday')}, {t('time.tomorrow')}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Validation Example:</h3>
        <p className="text-sm text-red-600">
          {t('validation.required', { field: 'Email' })}
        </p>
        <p className="text-sm text-red-600">
          {t('validation.min', { field: 'Password', count: 8 })}
        </p>
      </div>
    </Card>
  );
}
