# 🎨 FIRMA MOBILE - B&W DESIGN SYSTEM GUIDE

**Last Updated:** 2025-11-19
**Status:** ✅ Core Screens Complete - Modern B&W Design Live!

---

## 🌟 DESIGN PHILOSOPHY

### Black & White Only
- **NO gradients, NO colors, NO distractions**
- Pure B&W for professional, timeless aesthetic
- High contrast for accessibility (WCAG AAA)
- Clean, minimalist, modern

### Key Principles
1. **Simplicity** - Remove unnecessary visual noise
2. **Clarity** - Every element has purpose
3. **Hierarchy** - Clear visual importance through B&W scale
4. **Consistency** - Reusable design tokens throughout

---

## 📦 DESIGN SYSTEM STRUCTURE

File: `apps/firma-mobile/src/theme/design-system.ts`

### 1. **Colors (B&W Palette)**

```typescript
Colors = {
  black: '#000000',
  white: '#FFFFFF',

  // Grayscale 50-900
  gray: {
    50: '#FAFAFA',   // Lightest bg
    100: '#F5F5F5',  // Card backgrounds
    200: '#E5E5E5',  // Borders light
    300: '#D4D4D4',  // Dividers
    400: '#A3A3A3',  // Disabled text
    500: '#737373',  // Secondary text
    600: '#525252',  // Body text
    700: '#404040',  // Headings
    800: '#262626',  // Strong emphasis
    900: '#171717',  // Near black
  },

  // Semantic usage
  text: {
    primary: '#000000',     // Main content
    secondary: '#525252',   // Supporting text
    tertiary: '#737373',    // Less important
    disabled: '#A3A3A3',    // Inactive
    inverted: '#FFFFFF',    // On black bg
  },

  border: {
    light: '#E5E5E5',
    medium: '#D4D4D4',
    dark: '#A3A3A3',
  },
}
```

### 2. **Typography**

```typescript
Typography = {
  size: {
    xs: 12,      // Captions, labels
    sm: 14,      // Body small
    base: 16,    // Body default
    lg: 18,      // Body large
    xl: 20,      // Small headings
    '2xl': 24,   // Headings
    '3xl': 28,   // Large headings
    '4xl': 32,   // Hero text
    '5xl': 36,   // Extra large
  },

  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
}
```

### 3. **Spacing Scale**

```typescript
Spacing = {
  xs: 4,       // Tight
  sm: 8,       // Small
  md: 12,      // Medium
  base: 16,    // Default
  lg: 20,      // Large
  xl: 24,      // Extra large
  '2xl': 32,   // 2x
  '3xl': 40,   // 3x
  '4xl': 48,   // 4x
  '5xl': 64,   // 5x
}
```

### 4. **Border Radius**

```typescript
Radius = {
  none: 0,
  sm: 4,
  base: 8,     // Default cards
  md: 12,      // Larger cards
  lg: 16,      // Modals
  xl: 20,      // Special elements
  full: 9999,  // Pills/circles
}
```

### 5. **Shadows (B&W Optimized)**

```typescript
Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
}
```

### 6. **Icon Sizes**

```typescript
IconSize = {
  xs: 16,
  sm: 20,
  base: 24,    // Default
  md: 28,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 56,
  '4xl': 64,
}
```

---

## 🚀 USAGE EXAMPLES

### Import Design System

```typescript
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  IconSize
} from '../theme/design-system';
```

### Example: Modern Card

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },

  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.gray[500],
    fontWeight: Typography.weight.medium,
  },
});
```

### Example: Primary Button

```typescript
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Sign In</Text>
  <Ionicons name="arrow-forward" size={IconSize.sm} color={Colors.white} />
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.black,
    borderRadius: Radius.base,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.base,
  },

  buttonText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
```

### Example: Input with Icon

```typescript
<View style={styles.inputContainer}>
  <Ionicons
    name="mail-outline"
    size={IconSize.base}
    color={Colors.gray[400]}
  />
  <TextInput
    style={styles.input}
    placeholder="Email"
    placeholderTextColor={Colors.gray[400]}
  />
</View>

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.white,
  },

  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.black,
    marginLeft: Spacing.sm,
  },
});
```

---

## ✅ UPDATED SCREENS

### 1. **LoginScreen** ⚡

**Before:** Blue gradients, emoji logo, colored buttons
**After:** Black logo with briefcase icon, B&W inputs with icons, modern aesthetic

**Features:**
- Black briefcase icon logo (Ionicons)
- Input fields with mail & lock icons
- Black button with arrow
- Security badge footer
- Professional typography
- High contrast

**File:** `apps/firma-mobile/src/screens/LoginScreen.tsx`

---

### 2. **CaseListScreen** ⚡

**Before:** Colored phase badges, emoji icons, blue accents
**After:** B&W status badges, Ionicons everywhere, clean cards

**Features:**
- Header with folder icon
- B&W phase badges with borders
- Modern progress circles (not bars)
- Offline badge with cloud icon
- Subtle card shadows
- Empty state with folder icon
- Error state with alert icon

**File:** `apps/firma-mobile/src/screens/CaseListScreen.tsx`

---

## 📋 REMAINING SCREENS TO UPDATE

### Priority Order:

#### 1. **MyHomeScreen** (High Priority)
**Changes Needed:**
- Replace emoji service icons → Ionicons
- Update card styles to B&W
- Modern progress indicators
- Update all colors to design system

**Icons to Replace:**
- 🔥 → `flame-outline` or `flash-outline`
- 📋 → `document-text-outline`
- 📅 → `calendar-outline`
- 📍 → `location-outline`

#### 2. **CreateCaseScreen** (Medium Priority)
**Changes Needed:**
- Service cards with Ionicons instead of emojis
- B&W selection states
- Modern input fields
- Black CTA buttons

**Service Icons:**
- 🏡 → `home-outline`
- 🏢 → `business-outline`
- ⚖️ → `scale-outline`
- 📋 → `clipboard-outline`
- 📜 → `document-outline`

#### 3. **CaseDetailScreen** (Medium Priority)
**Changes Needed:**
- Document list with file icons
- Status badges B&W
- Timeline with checkmark icons
- Action buttons modernized

**Icons:**
- ✓ → `checkmark-circle-outline`
- ⚠️ → `alert-circle-outline`
- 📄 → `document-text-outline`

#### 4. **Bottom Navigation** (Low Priority)
Update tab bar icons from emojis to Ionicons:
- Home: `home-outline`
- Cases: `folder-open-outline`
- Create: `add-circle-outline`
- Inbox: `notifications-outline`
- Profile: `person-outline`

---

## 🎯 IONICONS REFERENCE

### Common Icons Used

| Purpose | Icon Name | Usage |
|---------|-----------|-------|
| **Auth** | | |
| Email | `mail-outline` | Login inputs |
| Password | `lock-closed-outline` | Login inputs |
| Security | `shield-checkmark-outline` | Security badges |
| **Cases** | | |
| Folder | `folder-open-outline` | Case lists |
| Document | `document-text-outline` | Documents |
| Briefcase | `briefcase-outline` | Logo, work |
| **Actions** | | |
| Forward | `arrow-forward` | Buttons, navigation |
| Add | `add-circle-outline` | Create actions |
| Edit | `create-outline` | Edit actions |
| Delete | `trash-outline` | Delete actions |
| **Status** | | |
| Check | `checkmark-circle-outline` | Success, complete |
| Alert | `alert-circle-outline` | Errors, warnings |
| Info | `information-circle-outline` | Info messages |
| **Network** | | |
| Online | `cloud-done-outline` | Online mode |
| Offline | `cloud-offline-outline` | Offline mode |
| Sync | `sync-outline` | Syncing |
| **Time** | | |
| Calendar | `calendar-outline` | Dates, meetings |
| Clock | `time-outline` | Deadlines |
| **Location** | | |
| Map | `location-outline` | Addresses |

### How to Use Ionicons

```typescript
import { Ionicons } from '@expo/vector-icons';

// Basic usage
<Ionicons name="home-outline" size={24} color="#000" />

// With design system
<Ionicons
  name="folder-open-outline"
  size={IconSize.lg}
  color={Colors.black}
/>

// In buttons
<TouchableOpacity>
  <Ionicons name="add-circle" size={IconSize.xl} color={Colors.white} />
</TouchableOpacity>
```

---

## 🔧 MIGRATION GUIDE

### Step-by-Step for Each Screen:

#### 1. Import Design System & Ionicons
```typescript
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  IconSize
} from '../theme/design-system';
```

#### 2. Replace Hardcoded Colors
```typescript
// Before
backgroundColor: '#3b82f6',
color: '#111827',

// After
backgroundColor: Colors.black,
color: Colors.text.primary,
```

#### 3. Replace Hardcoded Spacing
```typescript
// Before
padding: 20,
marginBottom: 16,

// After
padding: Spacing.lg,
marginBottom: Spacing.base,
```

#### 4. Replace Emojis with Ionicons
```typescript
// Before
<Text style={styles.icon}>📋</Text>

// After
<Ionicons
  name="document-text-outline"
  size={IconSize.lg}
  color={Colors.black}
/>
```

#### 5. Update Shadows
```typescript
// Before
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,

// After
...Shadows.base,
```

#### 6. Update Typography
```typescript
// Before
fontSize: 16,
fontWeight: '600',
color: '#374151',

// After
fontSize: Typography.size.base,
fontWeight: Typography.weight.semibold,
color: Colors.gray[700],
```

---

## 🎨 DESIGN TOKENS REFERENCE

### Quick Copy-Paste Styles

#### Modern Card
```typescript
{
  backgroundColor: Colors.white,
  borderRadius: Radius.base,
  padding: Spacing.base,
  borderWidth: 1,
  borderColor: Colors.border.light,
  ...Shadows.sm,
}
```

#### Primary Button (Black)
```typescript
{
  backgroundColor: Colors.black,
  borderRadius: Radius.base,
  paddingVertical: Spacing.base,
  paddingHorizontal: Spacing.lg,
  ...Shadows.base,
}
```

#### Secondary Button (White with Border)
```typescript
{
  backgroundColor: Colors.white,
  borderWidth: 1.5,
  borderColor: Colors.black,
  borderRadius: Radius.base,
  paddingVertical: Spacing.base,
  paddingHorizontal: Spacing.lg,
}
```

#### Input Field
```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1.5,
  borderColor: Colors.gray[200],
  borderRadius: Radius.base,
  paddingHorizontal: Spacing.base,
  backgroundColor: Colors.white,
}
```

#### Badge
```typescript
{
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
  borderRadius: Radius.full,
  backgroundColor: Colors.gray[100],
  borderWidth: 1,
  borderColor: Colors.gray[300],
}
```

#### Heading Text
```typescript
{
  fontSize: Typography.size['3xl'],
  fontWeight: Typography.weight.bold,
  color: Colors.black,
  marginBottom: Spacing.xs,
  letterSpacing: -0.5,
}
```

#### Body Text
```typescript
{
  fontSize: Typography.size.base,
  fontWeight: Typography.weight.medium,
  color: Colors.gray[600],
  lineHeight: Typography.size.base * 1.5,
}
```

---

## 📊 PROGRESS TRACKER

| Screen | Status | Completion |
|--------|--------|------------|
| **LoginScreen** | ✅ Complete | 100% |
| **CaseListScreen** | ✅ Complete | 100% |
| MyHomeScreen | ⏳ In Progress | 30% |
| CreateCaseScreen | ❌ Pending | 0% |
| CaseDetailScreen | ❌ Pending | 0% |
| InboxScreen | ❌ Pending | 0% |
| UploadScreen | ❌ Pending | 0% |
| Phase2UploadScreen | ❌ Pending | 0% |
| Bottom Tabs | ❌ Pending | 0% |

**Overall Design Migration:** 🟡 **22% Complete**

---

## 🚀 NEXT STEPS

1. **Complete MyHomeScreen** (30 mins)
   - Replace emoji icons with Ionicons
   - Apply B&W color system
   - Update all spacing/typography

2. **Update CreateCaseScreen** (45 mins)
   - Service cards with modern icons
   - B&W selection states
   - Modern form inputs

3. **Update CaseDetailScreen** (30 mins)
   - Document list with icons
   - Status timeline
   - Action buttons

4. **Update Bottom Navigation** (15 mins)
   - Replace tab icons
   - B&W active/inactive states

5. **Polish & Test** (1 hour)
   - Ensure consistency across all screens
   - Test on iOS & Android
   - Fix any visual bugs

---

## 💡 DESIGN TIPS

### Do's ✅
- Use B&W colors only
- Use Ionicons for all icons
- Apply design tokens consistently
- Add subtle borders to elements
- Use proper spacing scale
- Keep shadows minimal and subtle

### Don'ts ❌
- Don't add colors or gradients
- Don't use emojis (use Ionicons)
- Don't hardcode spacing values
- Don't use heavy shadows
- Don't mix different border styles
- Don't forget hover/press states

---

## 📚 RESOURCES

- **Ionicons Browser:** https://ionic.io/ionicons
- **Design System File:** `apps/firma-mobile/src/theme/design-system.ts`
- **Example Screens:**
  - `apps/firma-mobile/src/screens/LoginScreen.tsx`
  - `apps/firma-mobile/src/screens/CaseListScreen.tsx`

---

**Questions or Need Help?**

Refer to the completed screens (LoginScreen, CaseListScreen) for examples. The design system is fully documented with TypeScript types for autocomplete support!

🎨 **FIRMA MOBILE** - Clean. Minimal. Professional. B&W.
