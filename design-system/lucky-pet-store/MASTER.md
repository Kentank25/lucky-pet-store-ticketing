# Lucky Pet Store — Design System Master (`Modern Warm Pet-Care`)

## 1. Visual Direction & Typography

- **Aesthetic**: Modern Warm Pet-Care — clean, calm, high-contrast surfaces with 1px borders (`border-border-subtle`), no heavy aurora gradients or excessive 24px blur.
- **Heading / UI Font**: `Plus Jakarta Sans` (`font-heading`, applied to `h1`–`h6`).
- **Body Font**: `Nunito Sans` (`font-sans`, applied to `body`).
- **Tabular Numbers**: Use `tabular-nums` on all queue numbers, timestamps, and dashboard counters.
- **Reduced Motion**: `src/index.css` includes `@media (prefers-reduced-motion: reduce)` disabling non-essential animations and transitions.

---

## 2. Color Tokens (CSS Custom Properties & Tailwind)

### Service Color Rules
- **Klinik (Primary)**: Caring Teal `#0D9488` (hover `#0F766E`, soft `#F0FDFA`, dark `#14B8A6`)
- **Grooming (Secondary)**: Warm Orange `#EA580C` (hover `#C2410C`, soft `#FFF7ED`, dark `#FB923C`)
- **Danger / Destructive**: `#DC2626` (hover `#B91C1C`, soft `#FEF2F2`, dark `#F87171`)

### Canvas, Surface & Text Tokens

| Semantic Token | Tailwind Class | Light Mode (`:root`) | Dark Mode (`.dark`) |
| :--- | :--- | :--- | :--- |
| `--color-bg-canvas` | `bg-bg-canvas` | `#F8FAF9` | `#0B1120` |
| `--color-bg-surface` | `bg-bg-surface` | `#FFFFFF` | `#111827` |
| `--color-bg-subtle` | `bg-bg-subtle` | `#F1F5F4` | `#1E293B` |
| `--color-bg-muted` | `bg-bg-muted` | `#E2E8F0` | `#334155` |
| `--color-text-main` | `text-text-main` | `#0F172A` | `#F8FAFC` |
| `--color-text-secondary` | `text-text-secondary` | `#475569` | `#CBD5E1` |
| `--color-text-muted` | `text-text-muted` | `#64748B` | `#94A3B8` |
| `--color-text-inverted` | `text-text-inverted` | `#FFFFFF` | `#FFFFFF` |
| `--color-border-subtle` | `border-border-subtle` | `#E2E8F0` | `#1F2937` |
| `--color-border-main` | `border-border-main` | `#CBD5E1` | `#334155` |
| `--color-primary` | `primary` | `#0D9488` | `#14B8A6` |
| `--color-primary-hover` | `primary-hover` | `#0F766E` | `#0D9488` |
| `--color-primary-soft` | `primary-soft` | `#F0FDFA` | `rgba(20, 184, 166, 0.14)` |
| `--color-grooming` | `grooming` | `#EA580C` | `#FB923C` |
| `--color-grooming-hover` | `grooming-hover` | `#C2410C` | `#F97316` |
| `--color-grooming-soft` | `grooming-soft` | `#FFF7ED` | `rgba(251, 146, 60, 0.14)` |
| `--color-secondary` | `secondary` | `#EA580C` | `#FB923C` |
| `--color-danger` | `danger` | `#DC2626` | `#F87171` |
| `--color-danger-hover` | `danger-hover` | `#B91C1C` | `#EF4444` |
| `--color-danger-soft` | `danger-soft` | `#FEF2F2` | `rgba(248, 113, 113, 0.14)` |

---

## 3. UI Primitive Components (`src/components/ui/`)

### `Button` (`src/components/ui/Button.jsx`)
- **Export**: `default`
- **Props**:
  ```jsx
  {
    variant = "primary", // "primary" | "secondary" | "ghost" | "danger" | "grooming" | "klinik"
    size = "md",         // "sm" | "md" | "lg"
    loading = false,     // boolean (renders SVG spinner, sets disabled + aria-busy)
    disabled = false,    // boolean
    type = "button",     // "button" | "submit" | "reset"
    className = "",
    children,
    ...props
  }
  ```
- **Behavior**: Enforces `cursor-pointer`, `min-h-10` (`sm`/`md`) or `min-h-11` (`lg`), `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary`, and `disabled:opacity-50 disabled:cursor-not-allowed`.

### `Card` (`src/components/ui/Card.jsx`)
- **Export**: `default`
- **Props**:
  ```jsx
  {
    padding = "md",      // "none" | "sm" | "md" | "lg"
    elevated = false,    // boolean (shadow-md vs shadow-sm)
    className = "",
    children,
    ...props
  }
  ```
- **Standard Surface**: `rounded-2xl border border-border-subtle bg-bg-surface shadow-sm`.

### `Badge` (`src/components/ui/Badge.jsx`)
- **Export**: `default`
- **Props**:
  ```jsx
  {
    variant = "neutral", // "neutral" | "pending" | "waiting" | "active" | "payment" | "completed" | "cancelled" | "grooming" | "klinik"
    dot = false,         // boolean (renders status indicator dot)
    className = "",
    children,
    ...props
  }
  ```
- **Styling**: `text-xs font-semibold whitespace-nowrap rounded-full border px-2.5 py-1`.

#### Ticket Status & Service Badge Mapping

| Ticket Status / Service | `Badge` Variant | Visual Color |
| :--- | :--- | :--- |
| `PENDING` | `pending` | Amber (`amber-50` / `amber-800`) |
| `WAITING` | `waiting` | Sky (`sky-50` / `sky-800`) |
| `aktif` | `active` | Caring Teal (`teal-50` / `teal-800`) |
| `PAYMENT` | `payment` | Purple (`purple-50` / `purple-800`) |
| `COMPLETED` | `completed` | Emerald (`emerald-50` / `emerald-800`) |
| `CANCELLED` | `cancelled` | Red (`red-50` / `red-800`) |
| `Grooming` | `grooming` | Warm Orange (`orange-50` / `orange-800`) |
| `Klinik` | `klinik` | Caring Teal (`teal-50` / `teal-800`) |

### `EmptyState` (`src/components/ui/EmptyState.jsx`)
- **Export**: `default`
- **Props**:
  ```jsx
  {
    icon: Icon,          // Heroicons component (e.g., InboxIcon)
    title,               // string
    description,         // string (optional)
    action,              // ReactNode (optional)
    className = ""
  }
  ```

---

## 4. `ui-ux-pro-max` Accessibility & Quality Checklist

- [x] **Color Contrast >= 4.5:1**: All text, badges, and buttons meet WCAG AA 4.5:1 contrast in both light and dark themes.
- [x] **Interactive Affordance**: Every clickable button and toggle includes `cursor-pointer` and minimum `40px` (`min-h-10`) or `44px` (`min-h-11`) touch target.
- [x] **Keyboard Focus**: All interactive controls use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary` (never `outline-none` without a visible focus ring).
- [x] **Accessible Modals**: `ConfirmationModal` and `CancellationModal` use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, and `Escape` key dismissal.
- [x] **Numeric Alignment**: Queue numbers, counts, and times use `tabular-nums`.
- [x] **Icons**: Use `@heroicons/react` SVG icons exclusively in UI chrome (`aria-hidden="true"` when decorative); no emoji icons.
- [x] **Reduced Motion**: Respect `@media (prefers-reduced-motion: reduce)` and `motion-safe:` utilities.
