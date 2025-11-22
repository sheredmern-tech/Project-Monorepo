# 🌍 i18next Setup Documentation

Comprehensive internationalization (i18n) setup using **i18next** for Next.js 16+ App Router.

## 📦 Installed Packages

```bash
npm install i18next react-i18next i18next-resources-to-backend i18next-browser-languagedetector js-cookie @types/js-cookie
```

## 📁 Project Structure

```
apps/web/
├── public/
│   └── locales/
│       ├── id/                      # Indonesian translations
│       │   ├── common.json
│       │   └── dokumen.json
│       └── en/                      # English translations
│           ├── common.json
│           └── dokumen.json
├── src/
│   ├── lib/
│   │   └── i18n/
│   │       ├── settings.ts          # i18n configuration
│   │       ├── client.ts            # Client-side i18n instance
│   │       └── use-language.ts      # Language hook
│   └── components/
│       └── shared/
│           ├── language-switcher.tsx # Language switcher component
│           └── i18n-demo.tsx         # Usage examples
```

## ⚙️ Configuration Files

### 1. Settings (`lib/i18n/settings.ts`)

```typescript
export const fallbackLng = 'id'; // Default: Indonesian
export const languages = ['id', 'en'] as const;
export const cookieName = 'i18next';
```

### 2. Client Instance (`lib/i18n/client.ts`)

Auto-initializes i18next with:
- Language detection from cookie/localStorage
- Dynamic translation loading
- Browser language detection

### 3. Language Hook (`lib/i18n/use-language.ts`)

Provides:
- Current language state
- Change language function
- Available languages list

## 🎯 Usage Examples

### 1. Using in Client Components

```typescript
'use client';

import { useTranslation } from '@/lib/i18n/client';
import { useLanguage } from '@/lib/i18n/use-language';

export function MyComponent() {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage, 'common');

  return (
    <div>
      <h1>{t('app.welcome')}</h1>
      <button>{t('app.save')}</button>
    </div>
  );
}
```

### 2. Using Multiple Namespaces

```typescript
'use client';

import { useTranslation } from '@/lib/i18n/client';
import { useLanguage } from '@/lib/i18n/use-language';

export function DocumentPage() {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage, 'common');
  const { t: tDoc } = useTranslation(currentLanguage, 'dokumen');

  return (
    <div>
      <h1>{tDoc('title')}</h1>
      <button>{tDoc('uploadDocument')}</button>
      <button>{t('app.cancel')}</button>
    </div>
  );
}
```

### 3. Interpolation (Variables)

```typescript
// Translation file: { "greeting": "Hello, {{name}}!" }
t('greeting', { name: 'John' }) // → "Hello, John!"

// Translation file: { "min": "{{field}} must be at least {{count}} characters" }
t('validation.min', { field: 'Password', count: 8 })
// → "Password must be at least 8 characters"
```

### 4. Pluralization

```typescript
// Translation file:
{
  "items": "{{count}} item",
  "items_other": "{{count}} items"
}

t('items', { count: 1 })  // → "1 item"
t('items', { count: 5 })  // → "5 items"
```

## 🔀 Language Switcher Component

Already integrated in **Header** component:

```typescript
import { LanguageSwitcher } from '@/components/shared/language-switcher';

<LanguageSwitcher />  // Default
<LanguageSwitcher variant="outline" showLabel />  // With label
```

## 📝 Translation Files Structure

### Common (`common.json`)

General-purpose translations used across the app:
- App-wide actions (save, cancel, delete, etc.)
- Navigation items
- Table headers
- Validation messages
- Success/error messages
- Time-related translations

### Module-Specific (e.g., `dokumen.json`)

Feature-specific translations:
- Module title
- Module-specific actions
- Folder operations
- Bulk operations
- Statistics
- Keyboard shortcuts
- Filters and sorting
- Category labels

## 🌐 Supported Languages

| Code | Language | Flag |
|------|----------|------|
| `id` | Bahasa Indonesia | 🇮🇩 |
| `en` | English | 🇺🇸 |

## 🔧 How to Add New Language

1. **Create translation files:**
   ```
   public/locales/fr/common.json
   public/locales/fr/dokumen.json
   ```

2. **Update settings.ts:**
   ```typescript
   export const languages = ['id', 'en', 'fr'] as const;
   ```

3. **Update LanguageSwitcher component:**
   ```typescript
   const languageNames = {
     id: 'Bahasa Indonesia',
     en: 'English',
     fr: 'Français',
   };

   const languageFlags = {
     id: '🇮🇩',
     en: '🇺🇸',
     fr: '🇫🇷',
   };
   ```

## 📚 How to Add New Namespace

1. **Create translation files:**
   ```
   public/locales/id/auth.json
   public/locales/en/auth.json
   ```

2. **Use in component:**
   ```typescript
   const { t: tAuth } = useTranslation(currentLanguage, 'auth');
   ```

## 🎨 Best Practices

### 1. **Namespace Organization**
- `common`: General UI elements, actions, navigation
- `[module]`: Module-specific translations
- `auth`: Authentication-related
- `errors`: Error messages
- `validation`: Form validation messages

### 2. **Key Naming**
```json
{
  "module": {
    "action": "Text",
    "category": {
      "subcategory": "Text"
    }
  }
}
```

### 3. **Avoid Hardcoded Strings**
❌ Bad:
```typescript
<button>Save</button>
```

✅ Good:
```typescript
<button>{t('app.save')}</button>
```

### 4. **Use Namespaces Wisely**
- Keep `common.json` for shared translations
- Create module-specific files for feature translations
- Don't duplicate translations across namespaces

## 🚀 Features Implemented

- ✅ Client-side i18n with automatic language detection
- ✅ Cookie-based language persistence
- ✅ Dynamic translation loading
- ✅ Language switcher component with flags
- ✅ Interpolation support
- ✅ Multiple namespaces support
- ✅ Indonesian & English translations
- ✅ Integrated in Header component

## 🔍 Testing i18n

1. **Open the app**
2. **Click language switcher** (globe icon in header)
3. **Select language** (Indonesian / English)
4. **Page reloads** with selected language
5. **Check cookie** `i18next` is set correctly

## 📊 Translation Coverage

### Common Module: **100+ keys**
- App actions
- Navigation
- Table
- Validation
- Messages
- Time

### Dokumen Module: **60+ keys**
- Document management
- Folder operations
- Bulk operations
- Statistics
- Keyboard shortcuts
- Filters

## 🎯 Next Steps

1. **Add more modules:**
   - `auth.json` (Login/Register)
   - `perkara.json` (Cases)
   - `klien.json` (Clients)
   - `sidang.json` (Court Schedule)

2. **Server-side support** (optional):
   - Create `lib/i18n/server.ts` for Server Components
   - Use middleware for language routing

3. **Add more languages:**
   - Arabic (RTL support)
   - Chinese
   - Japanese

## 📖 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Next.js i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

**Created:** {{date}}
**Author:** System Setup
**Version:** 1.0.0
