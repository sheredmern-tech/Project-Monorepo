# Searchable Modal Selection Components

Modern UI pattern untuk memilih data dengan search functionality yang smooth dan elegant.

## 🎯 Konsep

User klik button → BOOM langsung muncul modal dengan list → Search & filter data real-time → Select item → Done!

## ✨ Features

- **Real-time Search**: Filter data on-the-fly
- **Smooth Animations**: Fade-in, zoom-in effects via Radix UI
- **Keyboard Navigation**: Full keyboard support
- **Avatar & Metadata**: Rich display dengan avatar, badges, dan info tambahan
- **TypeScript Generic**: Fully typed dan reusable
- **Accessible**: Built dengan Radix UI primitives

## 📦 Components

### 1. SearchableSelectModal (Base Component)

Generic base component yang bisa digunakan untuk semua tipe data.

```tsx
import { SearchableSelectModal } from "@/components/modals"

<SearchableSelectModal<MyDataType>
  items={data}
  open={open}
  onOpenChange={setOpen}
  onSelect={(item) => console.log(item)}
  title="Select Item"
  searchPlaceholder="Search..."
  emptyMessage="No items found"
  renderItem={(item) => <div>{item.name}</div>}
  getItemId={(item) => item.id}
  getItemSearchText={(item) => item.name}
/>
```

### 2. SelectKlienModal

Pre-configured modal untuk memilih klien.

```tsx
import { SelectKlienModal } from "@/components/modals"

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Pilih Klien</Button>

      <SelectKlienModal
        open={open}
        onOpenChange={setOpen}
        onSelect={(klien) => {
          console.log("Selected:", klien)
        }}
      />
    </>
  )
}
```

**Features:**
- Auto-fetch klien from API
- Search by: nama, email, telepon
- Display: avatar, nama, email, telepon, jenis_klien badge
- Loading state

### 3. SelectAdvokatModal

Pre-configured modal untuk assign advokat/user.

```tsx
import { SelectAdvokatModal } from "@/components/modals"

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Assign Advokat</Button>

      <SelectAdvokatModal
        open={open}
        onOpenChange={setOpen}
        onSelect={(user) => {
          console.log("Selected:", user)
        }}
        roleFilter="ADVOKAT" // Optional: filter by role
      />
    </>
  )
}
```

**Features:**
- Auto-fetch users from API
- Search by: nama, email
- Display: avatar (with image support), nama, email, role badge
- Filter by role (default: ADVOKAT only)
- Loading state

## 🎨 Custom Hooks

### useSelectKlienModal

Helper hook untuk manage modal state.

```tsx
import { useSelectKlienModal } from "@/components/modals"

function MyComponent() {
  const { open, setOpen, handleSelect } = useSelectKlienModal({
    onSelect: (klien) => {
      console.log("Selected:", klien)
    }
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Pilih Klien</Button>
      <SelectKlienModal
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
      />
    </>
  )
}
```

### useSelectAdvokatModal

Helper hook untuk manage modal state.

```tsx
import { useSelectAdvokatModal } from "@/components/modals"

function MyComponent() {
  const { open, setOpen, handleSelect } = useSelectAdvokatModal({
    onSelect: (user) => {
      console.log("Selected:", user)
    }
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Assign Advokat</Button>
      <SelectAdvokatModal
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
      />
    </>
  )
}
```

## 🚀 Use Cases di Firma App

1. **Select Klien** - Pilih klien saat buat perkara baru
2. **Assign Advokat** - Assign advokat ke tim perkara
3. **Template Dokumen** - Pilih template saat upload dokumen
4. **Select Status Case** - Update status perkara
5. **Pilih Perkara** - Link dokumen ke perkara
6. **Select Tim Member** - Tambah member ke tim

## 📖 Demo

Visit `/dashboard/demo-modals` untuk melihat live demo dan dokumentasi lengkap.

## 🎯 Why Better Than Dropdown?

| Dropdown Traditional | Searchable Modal |
|---------------------|------------------|
| Limited space | Full modal real estate |
| Minimal context | Rich metadata (avatar, badges, info) |
| Basic search | Powerful real-time filter |
| Small list | Handle hundreds of items |
| Click to expand | Click and BOOM! |

## 🔧 Technical Details

- **Base**: Radix UI Dialog + Command (cmdk)
- **Styling**: Tailwind CSS 4
- **State**: React hooks (useState, useMemo, useCallback)
- **Types**: Full TypeScript support with generics
- **Animation**: Smooth fade-in/zoom-in via data-state
- **A11y**: Full keyboard navigation & screen reader support

## 📝 Creating Custom Modals

To create your own searchable modal:

```tsx
import { SearchableSelectModal } from "@/components/modals"
import type { MyDataType } from "@/types"

export function SelectMyDataModal({ open, onOpenChange, onSelect }) {
  const [data, setData] = useState<MyDataType[]>([])

  return (
    <SearchableSelectModal<MyDataType>
      items={data}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      title="Select Your Data"
      searchPlaceholder="Search your data..."
      getItemId={(item) => item.id}
      getItemSearchText={(item) => item.searchableField}
      renderItem={(item) => (
        <div className="flex items-center gap-3">
          {/* Your custom item rendering */}
        </div>
      )}
    />
  )
}
```

## 🎨 Customization

All modals accept className prop for custom styling:

```tsx
<SelectKlienModal
  // ... other props
  className="max-w-4xl" // Custom width
/>
```

You can also customize via the `footer` prop:

```tsx
<SearchableSelectModal
  // ... other props
  footer={
    <div className="flex justify-between">
      <span>Custom footer content</span>
      <Button size="sm">Action</Button>
    </div>
  }
/>
```

---

Made with ❤️ for Firma App
