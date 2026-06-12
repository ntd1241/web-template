# Specific Design System Reference
> Tài liệu này được sinh ra từ Figma design tokens + HTML screens thực tế.  
> Tất cả giá trị màu, font, spacing lấy trực tiếp từ `design-token.json` và markup đã export.
> Đây là case study tham khảo, không phải brand identity của template. Khi áp dụng vào code, hãy đổi tên token/component sang dạng generic và chỉ giữ lại pattern phù hợp cho admin app Việt Nam.

---

## Nguồn quan sát

Tài liệu này tổng hợp từ các export Figma/PXCode sau. Khi cần dựng lại UI, ưu tiên quy tắc trong design system này; dùng các folder bên dưới như bằng chứng về layout/component thực tế.

| Nguồn | Màn hình / pattern chính | Pattern rút trích |
|---|---|---|
| `601af811-5def-4bd0-b8d3-8429dece65a7` | Public plot detail | guest header, hero card, public info cards, map/gallery cards |
| `4ee83876-9f4a-4669-b54e-520754709ebf` | Logged-in farming log empty state | tab nav, user chip, segment control, empty state |
| `21601045-4bec-431b-a983-9bb48622636b` | Employee list + permission modal | admin shell, HTML table, pagination, avatar/entity cell, permission modal, toggle/select |
| `f79657d4-7568-4d11-b498-29bfa36ce7f0` | Employee list variant | dark icon rail, sidebar active state, grid-table variant |
| `3216027b-6677-4366-b4bc-8927dd8e7da1` | QR production plot management | QR media table, checkbox column, many row actions, pagination with ellipsis |
| `8572a37a-a5fd-409c-aa73-586e5d6b1494` | Lot management | filter side panel, skeleton loading table, admin page title/actions |
| `dcf92319-fda7-49ab-88ec-ff62c84d4c20` | Sales order list + detail modal | breadcrumb topbar, grid table, large form modal, orange bottom summary panel |

---

## Mục lục

0. [Nguồn quan sát](#nguồn-quan-sát)
1. [Reference Identity](#1-reference-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Border Radius](#4-spacing--border-radius)
5. [Layout — Public (Guest)](#5-layout--public-guest)
6. [Layout — Admin (Logged-in)](#6-layout--admin-logged-in)
7. [Card Component](#7-card-component)
8. [Navigation — Tab Bar](#8-navigation--tab-bar)
9. [Buttons & Actions](#9-buttons--actions)
10. [Form Inputs](#10-form-inputs)
11. [Filter & Segment Control](#11-filter--segment-control)
12. [Info Row Pattern](#12-info-row-pattern)
13. [Status Tags & Badges](#13-status-tags--badges)
14. [Empty State](#14-empty-state)
15. [Admin Shell — Sidebar, Topbar, Breadcrumb](#15-admin-shell--sidebar-topbar-breadcrumb)
16. [Toolbar, Search & Filters](#16-toolbar-search--filters)
17. [Data Table](#17-data-table)
18. [Pagination](#18-pagination)
19. [Modal, Dialog & Bottom Sheet Panel](#19-modal-dialog--bottom-sheet-panel)
20. [Detail Form & Form Sections](#20-detail-form--form-sections)
21. [Checkbox, Toggle & Select Controls](#21-checkbox-toggle--select-controls)
22. [Avatar, Initials & Entity Cell](#22-avatar-initials--entity-cell)
23. [Loading, Empty, Error & Disabled States](#23-loading-empty-error--disabled-states)
24. [Responsive & Scroll Behavior](#24-responsive--scroll-behavior)
25. [Implementation Checklist for AI Agents](#25-implementation-checklist-for-ai-agents)
26. [CSS Variables & Tailwind Config](#26-css-variables--tailwind-config)

---

## 1. Reference Identity

**Reference source:** External Vietnamese admin product  
**Lĩnh vực:** Quản lý nông nghiệp — truy xuất nguồn gốc, nhật ký canh tác, kiểm nghiệm  
**Ngôn ngữ thiết kế:** Modern Card UI, thiên nhiên, minh bạch, dễ đọc trên thiết bị ngoài trời

**Màu thương hiệu chính:** `#009966` — Green Haze (xanh lá tươi, gợi nông nghiệp sạch)  
**Font chính:** Be Vietnam Pro  
**Font phụ:** Inter (dùng cho một số label bold)

---

## 2. Color System

### 2.1 Primitive Colors (từ token)

#### Spring Green — Primary Brand
```
--color-primary-darkest:   #007a55   /* Tropical Rain Forest — text on light bg */
--color-primary-dark:      #13773c   /* Jewel — heading dark */
--color-primary:           #009966   /* Green Haze — brand primary */
--color-primary-mid:       #168d47   /* spring green 32 */
--color-primary-bright:    #00bc7d   /* Jade — CTA button */
--color-primary-bright-90: #00bc7de6 /* Jade 90% — button bg */
--color-primary-vivid:     #00c950   /* Malachite — accent */
--color-primary-light:     #22c55e   /* Mountain Meadow */
--color-primary-tint:      #5ee9b5   /* Turquoise Blue — hero accent text */
--color-primary-border:    #a4f4cf   /* Magic Mint — border light */
--color-primary-soft:      #d1eddd   /* Swans Down — card border */
--color-primary-foam:      #d0fae5   /* Scandal — card border alt */
--color-primary-bg:        #ecfdf5   /* Foam — chip/badge bg */
--color-primary-bg-light:  #eff9f3   /* Narvik — card header divider */
--color-primary-bg-pale:   #f2faf2   /* Panache */
```

#### Azure / Blue — Secondary (thông tin canh tác, bản đồ)
```
--color-azure-darkest:     #0e3754   /* Downriver */
--color-azure-dark:        #165988   /* Chathams Blue — heading */
--color-azure-primary:     #1a69a1   /* Matisse — CTA button admin */
--color-azure-mid:         #4b95c9   /* Shakespeare */
--color-azure-text:        #62748e   /* Lynch — nav inactive, label phụ */
--color-azure-light:       #a5cae4   /* Regent St Blue — border */
--color-azure-border:      #d2e4f1   /* Link Water — card border */
--color-azure-bg:          #eff5fa   /* Black Squeeze — card bg, chip */
--color-azure-bg-pale:     #f0f7ff   /* Alice Blue */
```

#### Grey — Neutral
```
--color-grey-900:   #322e37   /* Baltic Sea — hero dark bg */
--color-grey-800:   #3f3c48   /* Ship Gray — text primary */
--color-grey-700:   #4b4a59   /* Trout */
--color-grey-600:   #58586a   /* Mid Gray — section title */
--color-grey-500:   #858595   /* Waterloo — text muted, label */
--color-grey-400:   #a3a4b0   /* Santas Gray */
--color-grey-300:   #c2c3ca   /* French Gray — border input */
--color-grey-200:   #d1d2d7   /* border soft */
--color-grey-100:   #e0e1e5   /* Iron — card border */
--color-grey-50:    #ebecee   /* Athens Gray */
--color-grey-bg:    #f4f4f6   /* page background */
--color-grey-surface: #fafafb /* card surface alt */
```

#### Orange / Amber — Vận hành, cảnh báo
```
--color-orange-dark:    #bb4d00   /* Rose of Sharon — heading */
--color-orange-mid:     #e17100   /* Mango Tango */
--color-orange-primary: #fe9a00   /* California */
--color-orange-light:   #ffcc80   /* Chardonnay — border */
--color-orange-bg:      #fef3c6   /* Beeswax — card border */
--color-orange-bg-pale: #fffbeb   /* Buttery White — card header */
```

#### Violet — Bản đồ / Vị trí
```
--color-violet-dark:    #7008e7   /* Electric Violet */
--color-violet-primary: #7f22fe   /* heading map */
--color-violet-light:   #8e51ff   /* Heliotrope */
--color-violet-bg:      #ede9fe   /* Titan White — card border */
--color-violet-bg-pale: #f5f3ff   /* card header */
```

#### Red — Lỗi / Nguy hiểm
```
--color-red-dark:    #ad3821   /* Roof Terracotta */
--color-red-primary: #c6313f   /* Brick Red */
--color-red-mid:     #e64a19   /* Cinnabar */
--color-red-light:   #ea616e   /* Mandy */
--color-red-bg:      #fef2f0   /* Provincial Pink */
```

### 2.2 Semantic Color Mapping

| Vai trò | Token | Giá trị |
|---|---|---|
| Brand primary | `--color-primary` | `#009966` |
| Text heading | `--color-grey-800` | `#3f3c48` |
| Text section title | `--color-grey-600` | `#58586a` |
| Text body | `--color-grey-800` | `#3f3c48` |
| Text muted / label | `--color-grey-500` | `#858595` |
| Text nav inactive | `--color-azure-text` | `#62748e` |
| Page background | `--color-grey-bg` | `#f4f4f6` |
| Surface (card) | `white` | `#ffffff` |
| Border default | `--color-grey-100` | `#e0e1e5` |
| Border input | `--color-grey-300` | `#c2c3ca` |
| CTA button (guest) | `--color-primary` | `#009966` |
| CTA button (admin) | `--color-azure-primary` | `#1a69a1` |
| CTA button (hero) | `--color-primary-bright` | `#00bc7d` |

### 2.3 Màu theo section/module

Mỗi section card dùng bộ màu riêng — **border card, header text, icon bg, heading color** đều từ cùng một palette:

| Section | Header text | Card border | Header divider | Icon bg |
|---|---|---|---|---|
| Thông tin canh tác | `#007a55` | `#d0fae5` | `#ecfdf5` | `#ecfdf5` |
| Quy trình canh tác | `#165988` | `#d2e4f1` | `#eff5fa` | `#1a69a1` (icon trắng) |
| Nông dân liên kết | `#13773c` | `#d1eddd` | `#eff9f3` | `#d1eddd` |
| Vận hành | `#bb4d00` | `#fef3c6` | `#fffbeb` | `#fef3c6` |
| Hình ảnh | `#1a69a1` | `#d2e4f1` | `#eff5fa` | — |
| Bản đồ / Vị trí | `#7f22fe` | `#ede9fe` | `#f5f3ff` | — |

---

## 3. Typography

### 3.1 Font Families

```css
--font-primary: 'Be Vietnam Pro', sans-serif;   /* Toàn bộ UI */
--font-secondary: 'Inter', sans-serif;           /* Một số label bold đặc biệt */
```

Google Fonts import:
```html
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
```

### 3.2 Font Size Scale (từ token)

| Token | px | Dùng cho |
|---|---|---|
| `font-size-0` | 9px | — (hiếm dùng) |
| `font-size-1` | 10px | Data label, badge text nhỏ |
| `font-size-2` | 10.5px | Button text, options, regular small |
| `font-size-3` | 11px | Link, label upper (uppercase) |
| `font-size-8` | 12.3px | **Input text, Label, section label** |
| `font-size-9` | 14px | **Cell text, Textarea, nav tab** |
| `font-size-10` | 15.8px | **Heading 1, Heading 3** |
| `font-size-11` | 21px | Heading lớn |
| `font-size-12` | 31.5px | Hero title |

> **Font size rất nhỏ** so với chuẩn web. Đây là thiết kế compact, phù hợp mật độ thông tin cao. Không scale lên tùy tiện.

### 3.3 Semantic Typography Styles

| Style | Font | Size | Weight | Line-height | Letter-spacing | Case |
|---|---|---|---|---|---|---|
| `Button` | Be Vietnam Pro | 10.5px | Medium (500) | 14px | 0 | none |
| `Button upper` | Be Vietnam Pro | 10.5px | SemiBold (600) | 14px | 0.26 | UPPERCASE |
| `Cell` | Be Vietnam Pro | 14px | Medium (500) | 21px | 0 | none |
| `Data` | Be Vietnam Pro | 10px | Bold (700) | 15px | 0 | none |
| `Data upper` | Be Vietnam Pro | 10px | Bold (700) | 15px | -0.5 | UPPERCASE |
| `Heading 1` | Be Vietnam Pro | 15.8px | Bold (700) | 19.7px | 0 | none |
| `Heading 3` | Be Vietnam Pro | 15.8px | Bold (700) | 19.7px | 0 | none |
| `Heading 3 upper` | Be Vietnam Pro | 10.5px | Bold (700) | 14px | 1.05 | UPPERCASE |
| `Input` | Be Vietnam Pro | 12.3px | Regular (400) | 17.5px | 0 | none |
| `Label` | Be Vietnam Pro | 12.3px | Regular (400) | 15.3px | 0 | none |
| `Label upper` | Be Vietnam Pro | 11px | Medium (500) | 17.9px | 0.28 | UPPERCASE |
| `Link` | Be Vietnam Pro | 11px | Medium (500) | 17.9px | 0 | none |
| `Options` | Be Vietnam Pro | 10.5px | Regular (400) | 12.8px | 0 | none |
| `Textarea` | Be Vietnam Pro | 14px | Regular (400) | 22.75px | 0 | none |

### 3.4 Ứng dụng trong code

```css
/* Heading section card */
.card-heading {
  font-family: var(--font-primary);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1.05px;
  text-transform: uppercase;
}

/* Nav tab label */
.nav-tab {
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 400;  /* inactive */
}
.nav-tab.active {
  font-weight: 500;
}

/* Label metadata (muted, uppercase) */
.info-label {
  font-family: var(--font-primary);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: #858595;
  letter-spacing: 0.28px;
}

/* Value text */
.info-value {
  font-family: var(--font-primary);
  font-size: 12.3px;
  font-weight: 500;
  color: #3f3c48;
}
```

---

## 4. Spacing & Border Radius

### 4.1 Spacing (từ Tailwind classes quan sát trong HTML)

```
gap-1    → 4px
gap-1.5  → 6px
gap-2    → 8px
gap-3    → 12px
gap-4    → 16px
gap-6    → 24px

p-4      → 16px   (card body padding)
p-5      → 20px   (card body padding lớn)
px-3     → 12px   (chip, tag)
px-4     → 16px   (button)
px-5     → 20px   (hero button)
py-1     → 4px    (chip)
py-2     → 8px    (button)
py-2.5   → 10px   (hero button)
py-3     → 12px   (nav tab)
py-3.5   → 14px   (card header)
py-4     → 16px   (topbar)
```

### 4.2 Border Radius

| Token | Giá trị | Dùng cho |
|---|---|---|
| `radius-sm` | 4px | Badge, tag nhỏ |
| `radius-md` | 7px | radius token từ Figma |
| `radius-lg` | 10.5px | radius token từ Figma (icon box, chip) |
| `radius-xl` | 16px | `rounded-2xl` — process card inner |
| `radius-2xl` | 21px | **Card chính** — đặc trưng của design này |
| `radius-full` | 9999px | Button guest (rounded-full), chip area badge |

> **21px là giá trị đặc trưng** — tất cả card chính đều dùng `border-radius: 21px`. Đây là "signature radius" của design system này.

### 4.3 Shadow

```css
/* Card shadow — rất nhẹ */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
/* Tailwind: shadow-sm */

/* Không dùng shadow nặng — thiết kế dùng border để phân tách */
```

---

## 5. Layout — Public (Guest)

Trang xem thông tin lô đất cho khách (chưa đăng nhập).

### 5.1 Header — Guest

```
┌────────────────────────────────────────────────────────────────┐
│  bg-white, border-b, sticky top-0, z-50                        │
│  max-width: 1512px, padding: 0 196px (lg)                      │
│                                                                │
│  [●Logo] Đặng Hồng Hải - Lô 3          [👤 Đăng nhập]         │
│                                     └── rounded-full, #009966 │
│  ───────────────────────────────────────────────────────────── │
│  [📍Thông tin] [🌱Canh tác] [🔬Kiểm nghiệm] [📦Vật tư] ...   │
│  ^^^^^^^^^^^^                                                  │
│  border-b-2 #009966 khi active                                 │
└────────────────────────────────────────────────────────────────┘
```

**Logo:** `w-7 h-7`, `border-radius: 50%`, `background: #009966`  
**Login button:** `rounded-full`, `bg: #009966`, `px-4 py-2`, icon + text

### 5.2 Content Grid — Guest

```
max-width: 1512px, padding: 0 196px (lg), py-8

grid-cols-12, gap-6

LEFT (col-span-8):          RIGHT (col-span-4):
┌──────────────────────┐   ┌─────────────────────┐
│ Hero Image Card      │   │ Thông tin canh tác   │
│ (h-380px)           │   │ (green border)       │
├──────────────────────┤   ├─────────────────────┤
│ Image Gallery Card   │   │ Quy trình canh tác   │
│                      │   │ (blue border)        │
├──────────────────────┤   ├─────────────────────┤
│ Map Card             │   │ Nông dân liên kết    │
│                      │   │ (green border alt)   │
└──────────────────────┘   ├─────────────────────┤
                           │ Vận hành             │
                           │ (amber border)       │
                           └─────────────────────┘
```

### 5.3 Hero Card

```css
.hero-card {
  position: relative;
  background: #322e37;
  border-radius: 21px;
  overflow: hidden;
  height: 380px;
  border: 1px solid #e0e1e5;
}

/* Gradient overlay từ dưới lên */
.hero-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.60), rgba(0,0,0,0.05));
}

/* Content ở góc dưới trái */
.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Location chip */
.hero-location {
  color: #5ee9b5;  /* Turquoise Blue */
  font-size: 14px;
  font-weight: 500;
}

/* Hero title */
.hero-title {
  color: white;
  font-size: 31.5px;  /* font-size-12 */
  font-weight: 700;
}

/* Area badge */
.hero-area-badge {
  background: #ecfdf5;
  border: 1px solid #a4f4cf;
  border-radius: 9999px;
  padding: 4px 12px;
  color: #007a55;
  font-size: 14px;
  font-weight: 500;
}

/* CTA button trong hero */
.hero-cta {
  background: rgba(0, 188, 125, 0.90);  /* Jade 90% */
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 212, 146, 0.40);
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
}
```

---

## 6. Layout — Admin (Logged-in)

Trang nhật ký canh tác sau khi đăng nhập.

### 6.1 Header — Admin

```
┌────────────────────────────────────────────────────────────────┐
│  bg-white, border-b                                            │
│  max-width: 1120px (4xl), padding: 0 24px                     │
│                                                                │
│  [●Logo] Đặng Hồng Hải - Lô 3     [👤 Thanh Hiếu ▾]          │
│                                 └── chip: bg #ecfdf5           │
│                                     border #a4f4cf, #007a55   │
│                                                                │
│  [Thông tin] [Canh tác] [Kiểm nghiệm] ... [Nhật ký*] [Đánh giá]│
│                                             ^^^^^^^^           │
│                                             active: border-b-2 │
└────────────────────────────────────────────────────────────────┘
```

**Logo box admin:** `w-7 h-7`, `border-radius: 8px` (rounded-lg — khác guest dùng circle)  
**User chip:** `bg: #ecfdf5`, `border: 1px solid #a4f4cf`, `border-radius: 8px`, text `#007a55`

### 6.2 Content Layout — Admin

```
bg: #f4f4f6, min-height: 100vh
max-width: 896px (4xl/md), py-8, px-16-24

┌────────────────────────────────────────────────────────────┐
│ Toolbar row                                                │
│ [Nhật ký canh tác · 0]  [Tất cả|Chuyên viên|Nông dân]    │
│                                         [+ Ghi nhật ký]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Content area (card hoặc empty state)                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.3 Toolbar pattern

```css
/* Title + count */
.toolbar-title {
  font-size: 14px;       /* Cell style */
  font-weight: 500;
  color: #58586a;        /* Mid Gray */
}
.toolbar-count {
  color: #858595;        /* Waterloo */
}

/* Primary action button */
.btn-admin-primary {
  background: #1a69a1;   /* Matisse — xanh dương */
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 10.5px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
```

---

## 7. Card Component

Card là component trung tâm của design system này.

### 7.1 Card cấu trúc chuẩn

```
┌─────────────────────────────────────────────┐
│  CARD HEADER (border-b, px-5 py-3.5)        │
│  [icon] TIÊU ĐỀ SECTION                     │  ← uppercase, colored
├─────────────────────────────────────────────┤
│                                             │
│  CARD BODY (p-4 hoặc p-5)                  │
│                                             │
└─────────────────────────────────────────────┘
border-radius: 21px
border: 1px solid [section-color-border]
background: white
box-shadow: shadow-sm
overflow: hidden
```

### 7.2 CSS Card base

```css
.card {
  background: #ffffff;
  border-radius: 21px;
  border: 1px solid;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid;
}

.card-header img,
.card-header svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.card-header h3 {
  font-family: var(--font-primary);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1.05px;
  text-transform: uppercase;
}

.card-body {
  padding: 20px;
}
.card-body-compact {
  padding: 16px;
}
```

### 7.3 Card Variants — theo section

```css
/* Farming Info — Spring Green */
.card--farming {
  border-color: #d0fae5;
}
.card--farming .card-header {
  border-color: #ecfdf5;
}
.card--farming .card-header h3 {
  color: #007a55;
}

/* Process / Gallery — Azure Blue */
.card--process {
  border-color: #d2e4f1;
}
.card--process .card-header {
  border-color: #eff5fa;
}
.card--process .card-header h3 {
  color: #165988;  /* hoặc #1a69a1 */
}

/* Linked farmers — Jewel Green */
.card--linked {
  border-color: #d1eddd;
}
.card--linked .card-header {
  border-color: #eff9f3;
}
.card--linked .card-header h3 {
  color: #13773c;
}

/* Production Zone — Amber/Orange */
.card--zone {
  border-color: #fef3c6;
}
.card--zone .card-header {
  border-color: #fffbeb;
}
.card--zone .card-header h3 {
  color: #bb4d00;
}

/* Map — Violet */
.card--map {
  border-color: #ede9fe;
}
.card--map .card-header {
  border-color: #f5f3ff;
}
.card--map .card-header h3 {
  color: #7f22fe;
}
```

### 7.4 Inner highlight box (trong card)

Dùng cho process card — box nổi bật bên trong card body:

```css
.card-inner-highlight {
  background: #eff5fa;          /* hoặc màu tương ứng section */
  border: 1px solid #d2e4f1;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-inner-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #1a69a1;          /* icon box tối màu hơn */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

---

## 8. Navigation — Tab Bar

### 8.1 Cấu trúc

```css
nav {
  display: flex;
  align-items: center;
  overflow-x: auto;
  /* ẩn scrollbar nhưng vẫn scroll được */
  scrollbar-width: none;
}
nav::-webkit-scrollbar { display: none; }
```

### 8.2 Tab item

```css
.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;           /* guest: padding-bottom để border hiển thị */
  border-bottom: 2px solid transparent;
  color: #62748e;             /* Lynch — inactive */
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.15s;
  margin-right: 24px;         /* gap giữa các tab */
}

.nav-tab:hover {
  color: #3f3c48;
}

/* Guest layout: active tab */
.nav-tab.active {
  color: #009966;             /* primary green */
  border-bottom-color: #009966;
  font-weight: 500;
}

/* Admin layout: active tab */
.nav-tab--admin.active {
  color: #009966;
  border-bottom-color: #009966;
  font-weight: 500;
  /* Không có border-bottom khi scroll, dùng -mb-[1px] để merge với header border */
}

/* Icon trong tab: 12-14px, màu inherit */
.nav-tab img,
.nav-tab svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
```

---

## 9. Buttons & Actions

### 9.1 Primary Button — Guest (Green, rounded-full)

```css
.btn-guest-primary {
  background: #009966;
  color: white;
  border-radius: 9999px;       /* rounded-full */
  padding: 8px 16px;
  font-size: 10.5px;
  font-weight: 500;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}
.btn-guest-primary:hover {
  background: rgba(0, 153, 102, 0.90);
}
```

### 9.2 Primary Button — Admin (Blue, rounded-lg)

```css
.btn-admin-primary {
  background: #1a69a1;         /* Matisse */
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 10.5px;
  font-weight: 500;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: background 0.15s;
}
.btn-admin-primary:hover {
  background: #155e80;
}
```

### 9.3 Hero CTA Button (Glass morphism)

```css
.btn-hero-cta {
  background: rgba(0, 188, 125, 0.90);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 212, 146, 0.40);
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}
.btn-hero-cta:hover {
  background: #00bc7d;
}
```

### 9.4 Link Button (text only)

```css
.btn-link {
  color: #009966;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.btn-link:hover {
  text-decoration: underline;
}
```

---

## 10. Form Inputs

Từ semantic style `Input` và `Textarea` trong token:

```css
.input {
  font-family: var(--font-primary);
  font-size: 12.3px;
  font-weight: 400;
  line-height: 17.5px;
  color: #3f3c48;
  background: white;
  border: 1px solid #c2c3ca;   /* French Gray */
  border-radius: 8px;
  padding: 6px 12px;
  height: 36px;
  width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  outline: none;
  border-color: #009966;
  box-shadow: 0 0 0 3px rgba(0, 153, 102, 0.12);
}

.input::placeholder {
  color: #858595;
}

.input:disabled {
  background: #f4f4f6;
  color: #a3a4b0;
  cursor: not-allowed;
}

.textarea {
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 22.75px;
  color: #3f3c48;
  background: white;
  border: 1px solid #c2c3ca;
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 80px;
  resize: vertical;
}

.form-label {
  font-family: var(--font-primary);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.28px;
  color: #858595;
  margin-bottom: 4px;
  display: block;
}
```

---

## 11. Filter & Segment Control

Dùng trong toolbar admin — segmented button group:

```
[Tất cả] | [👨‍🔬 Chuyên viên] | [🌾 Nông dân]
  active                inactive
```

```css
.segment-group {
  display: flex;
  align-items: center;
  border: 1px solid #c2c3ca;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.segment-btn {
  padding: 6px 12px;
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 400;
  color: #62748e;
  background: white;
  border: none;
  border-left: 1px solid #c2c3ca;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s;
}

.segment-btn:first-child {
  border-left: none;
}

.segment-btn:hover:not(.active) {
  background: #f4f4f6;
}

.segment-btn.active {
  background: #3f3c48;         /* Ship Gray — dark active state */
  color: white;
  font-weight: 500;
}
```

---

## 12. Info Row Pattern

Pattern dùng trong sidebar cards để hiển thị thông tin key-value:

```
[icon-box]  Label (uppercase, muted)
            Value (medium, dark)
```

```css
.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Icon box */
.info-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;           /* rounded-lg */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Alternating backgrounds: ecfdf5 và f4f4f6 */
.info-icon-box--green { background: #ecfdf5; }
.info-icon-box--grey  { background: #f4f4f6; }

.info-icon-box img,
.info-icon-box svg {
  width: 16px;
  height: 16px;
}

/* Text */
.info-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: #858595;
  letter-spacing: 0.28px;
  display: block;
  line-height: 1;
  margin-bottom: 2px;
}

.info-value {
  font-size: 12.3px;
  font-weight: 500;
  color: #3f3c48;
  display: block;
}
```

Tailwind class tương đương:
```html
<div class="flex items-center gap-3">
  <div class="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center flex-shrink-0">
    <img src="icon.svg" class="w-4 h-4" />
  </div>
  <div class="flex flex-col">
    <span class="text-[#858595] text-xs uppercase tracking-wide">Giống cây</span>
    <span class="text-[#3f3c48] text-sm font-medium">Dona</span>
  </div>
</div>
```

---

## 13. Status Tags & Badges

### 13.1 Area Badge (pill)

```css
.badge-area {
  background: #ecfdf5;
  border: 1px solid #a4f4cf;
  border-radius: 9999px;
  padding: 4px 12px;
  color: #007a55;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

### 13.2 User Chip (header admin)

```css
.user-chip {
  background: #ecfdf5;
  border: 1px solid #a4f4cf;
  border-radius: 8px;
  padding: 4px 8px;
  color: #007a55;
  font-size: 12.3px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.user-chip:hover {
  background: #d0fae5;
}
```

### 13.3 Status label trong card (label + value dạng inline)

```css
/* "Đang áp dụng" — small label over value */
.status-label {
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  color: #165988;
  display: block;
}

.status-value {
  font-size: 12.3px;
  font-weight: 500;
  color: #3f3c48;
}
```

---

## 14. Empty State

```css
.empty-state {
  background: white;
  border: 1px dashed #c2c3ca;  /* dashed — khác với card thường */
  border-radius: 16px;
  padding: 64px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.30;                /* mờ đi */
  margin-bottom: 16px;
}

.empty-state-text {
  color: #858595;
  font-size: 14px;
  margin-bottom: 12px;
}

.empty-state-cta {
  color: #009966;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
}
.empty-state-cta:hover {
  text-decoration: underline;
}
```

---

## 15. Admin Shell — Sidebar, Topbar, Breadcrumb

Các màn hình admin export dùng shell riêng, khác với header public/logged-in ở mục 5-6. Shell này phục vụ trang quản trị mật độ cao như Nhân sự, QR/tài liệu vận hành, Quản lý lô hàng, Đơn xuất.

### 15.1 Desktop shell chuẩn

```
┌──────────────┬─────────────────────────────────────────────┐
│ Icon rail    │ Topbar fixed / sticky                       │
│ 56px         │ height 56-64px                              │
├──────────────┤                                             │
│ Sidebar      │ Main content                                │
│ 240-280px    │ bg #f4f4f6, padding 20-24px                 │
│ white        │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

**Icon rail** xuất hiện ở màn hình tổ chức:

```css
.admin-icon-rail {
  width: 56px;
  background: #322e37;
  border-right: 1px solid #3f3c48;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.admin-icon-rail-item {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-icon-rail-item:hover,
.admin-icon-rail-item.active {
  background: rgba(255,255,255,0.10);
}
```

**Sidebar rộng**:

```css
.admin-sidebar {
  width: 240px;              /* 280px ở màn hình đơn xuất */
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.admin-sidebar-section-title {
  padding: 0 24px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #a3a4b0;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.admin-sidebar-item {
  min-height: 40px;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #58586a;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.admin-sidebar-item:hover {
  background: #f4f4f6;
}

.admin-sidebar-item.active {
  background: #ecfdf5;
  color: #009966;
  font-weight: 600;
  border-right: 4px solid #009966; /* chỉ dùng trong sidebar active item */
}
```

### 15.2 Topbar admin

```css
.admin-topbar {
  height: 56px;              /* 64px ở shell nhân sự */
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.breadcrumb-link { color: #3f3c48; font-weight: 600; }
.breadcrumb-separator { color: #a3a4b0; }
.breadcrumb-current { color: #009966; font-weight: 600; }
```

**User profile trong topbar** có 2 variant:

| Variant | Dùng ở | Style |
|---|---|---|
| Rounded pill | Đơn xuất | `border #e0e1e5`, `rounded-full`, avatar 28px, padding `4px 16px 4px 4px` |
| Compact user block | Nhân sự, lô hàng | avatar 32-36px, tên 14px semibold, org chip 10px uppercase |

### 15.3 Page container admin

```css
.admin-page {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #f4f4f6;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-page-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
```

Không dùng `max-width` trong admin list pages. Nội dung nên chiếm toàn bộ chiều ngang còn lại để bảng có đủ không gian.

---

## 16. Toolbar, Search & Filters

Toolbar trong reference UI thường nằm trong card/bảng, không tách thành section marketing. Toolbar phải giúp thao tác nhanh: tiêu đề, mô tả ngắn, search, filter, refresh, primary action.

### 16.1 List toolbar inside table card

```
┌─────────────────────────────────────────────────────────┐
│ Danh sách nhân viên                         [Search] [Filter] [+] │
│ Quản lý tài khoản truy cập hệ thống                       │
└─────────────────────────────────────────────────────────┘
```

```css
.table-toolbar {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #ffffff;
}

.table-toolbar-title {
  font-size: 18px;
  line-height: 28px;
  font-weight: 700;
  color: #111827;
}

.table-toolbar-description {
  margin-top: 4px;
  font-size: 14px;
  color: #858595;
}

.table-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

### 16.2 Search input

Search xuất hiện 3 kiểu nhưng thống nhất nền sáng, icon trái, rộng 256px.

```css
.search-field {
  position: relative;
  width: 256px;
}
.search-field input {
  width: 100%;
  height: 36px;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e0e1e5;
  border-radius: 8px;
  background: #fafafb;
  color: #3f3c48;
  font-size: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-field input:focus {
  outline: none;
  border-color: #2f8f3f;
  box-shadow: 0 0 0 2px rgba(47,143,63,0.20);
}
.search-field-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  opacity: 0.5;
}
```

### 16.3 Icon utility button

Dùng cho filter, refresh, options. Icon-only button phải có tooltip/aria-label khi implement.

```css
.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e1e5;
  border-radius: 8px;
  background: #ffffff;
  color: #58586a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.icon-btn:hover {
  background: #f4f4f6;
}
```

### 16.4 Left filter panel

Màn hình Quản lý lô hàng dùng filter panel cố định bên trái bảng.

```css
.filter-panel {
  width: 256px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.filter-panel-header {
  height: 57px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f3f4f6;
}

.filter-section {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.filter-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #858595;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 24px;
  font-size: 14px;
  color: #4b4a59;
  cursor: pointer;
}
.filter-option:hover { color: #3f3c48; }
.filter-option.checked { color: #3f3c48; font-weight: 500; }
```

**Quy tắc filter panel:**

- Header có title `Bộ lọc`, badge số filter đang active, link `Xóa hết` màu đỏ `#ea616e`.
- Section title uppercase 12px, có chevron collapse ở bên phải.
- Checkbox 16px, label 14px. Cho phép emoji trong label nếu domain cần phân loại nhanh như lô hàng.
- Nếu panel xuất hiện, table area phải là `flex-1 overflow-hidden`; scroll chỉ nằm trong table, không trong toàn trang.

---

## 17. Data Table

Reference UI có 2 loại bảng cần support:

1. **Semantic HTML table** cho dữ liệu có cột rõ, cần sticky header, scroll ngang.
2. **Grid table** dùng `grid-cols-12` cho list đơn giản hoặc background table trong modal/form.

Agent nên ưu tiên HTML `<table>` cho bảng thật. Dùng grid table khi export Figma đang dùng layout card/list hoặc khi row cần layout rất custom.

### 17.1 Table container

```css
.data-card {
  background: #ffffff;
  border: 1px solid #e0e1e5;
  border-radius: 12px;        /* admin table dùng 12px, public card dùng 21px */
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.data-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  text-align: left;
}
```

### 17.2 Header row

```css
.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f4f4f6;
  border-bottom: 1px solid #e0e1e5;
}

.data-table th {
  padding: 12px 16px;         /* 12px 24px ở bảng nhân viên rộng */
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #165988;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

.data-table th.text-right { text-align: right; }
.data-table th.text-center { text-align: center; }
```

**Header variant quan sát được:**

| Màn hình | Header bg | Text | Case |
|---|---|---|---|
| Nhân viên | `#f4f4f6` | `#165988`, 12px semibold | uppercase |
| Lô hàng | `#f4f4f6` | `#374151`, 14px semibold | none |
| QR | custom header bg gần `#f4f4f6` | `#3f3c48`, 14px semibold | none |

Khi cần đồng nhất template admin Việt Nam, ưu tiên variant Nhân viên cho admin identity: header xanh `#165988`, uppercase 12px cho bảng quản trị; dùng 14px none-case cho bảng nghiệp vụ nhiều cột.

### 17.3 Body rows

```css
.data-table tbody {
  background: #ffffff;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: rgba(249,250,251,0.80);
}

.data-table td {
  padding: 14px 16px;         /* row default 48px */
  font-size: 14px;
  color: #3f3c48;
  vertical-align: middle;
}

.data-table tr.compact td { padding-top: 12px; padding-bottom: 12px; }
.data-table tr.media-row td { padding-top: 12px; padding-bottom: 12px; }
```

**Chiều cao row:**

| Row type | Height | Dùng cho |
|---|---:|---|
| Compact | 44-48px | đơn xuất grid row, bảng text đơn giản |
| Default | 52px | bảng nhân viên có badge/action |
| Media | 72-88px | bảng QR có ảnh QR 64px |
| Skeleton | 48px | loading table, placeholder blocks 20px |

### 17.4 Column sizing

```html
<th class="w-1/3">Nhân viên</th>
<th class="w-1/4">Vai trò</th>
<th class="w-1/6 text-center">Trạng thái</th>
<th class="text-right"></th>
```

Quy tắc:

- Cột entity chính chiếm 30-40% chiều rộng.
- Cột role/tag 20-25%.
- Cột status 120-160px, căn giữa.
- Cột action 120-260px, căn phải.
- Bảng nhiều cột đặt `min-width: 800px`; bảng QR/action nhiều nút có thể `min-width: 1040px`.
- Cột số, tiền, lượt quét căn phải hoặc dùng inline flex icon + số nếu có icon.

### 17.5 Entity cell

```css
.entity-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.entity-title {
  font-size: 14px;
  font-weight: 600;
  color: #0e3754;
  line-height: 20px;
}
.entity-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #99a1af;
}
```

### 17.6 Row action behavior

```css
.row-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #d2e4f1;
  background: #eff5fa;
  color: #1a69a1;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.15s, opacity 0.15s;
}

tr .row-action.is-hover-only {
  opacity: 0;
}
tr:hover .row-action.is-hover-only {
  opacity: 1;
}
```

**Quy tắc:**

- Với action quan trọng như `Phân quyền`, có thể ẩn đến khi hover để giảm noise, nhưng vẫn phải accessible bằng keyboard (`tr:focus-within` hiện action).
- Với QR row có nhiều action (`Xem QR`, `Link`, `Mở`, `Tạo lại`, Delete), luôn hiển thị vì người dùng cần thao tác hàng loạt.
- Delete icon-only phải có `aria-label="Xóa"` và confirm nếu action phá hủy dữ liệu.

### 17.7 Status/badge trong table

```css
.table-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.table-badge--role {
  background: #eff5fa;
  color: #165988;
  border-color: #a5cae4;
}
.table-badge--success {
  background: #e6f4e7;
  color: #388e2f;
}
.table-badge--warning {
  background: #fffbeb;
  color: #bb4d00;
  border-color: #fee685;
}
.table-badge--danger {
  background: #fef2f0;
  color: #ad3821;
  border-color: #f8b8ab;
}
.table-badge--violet {
  background: #f5f3ff;
  color: #7008e7;
  border-color: #ddd6ff;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}
```

### 17.8 Grid table variant

Được dùng ở màn hình Đơn xuất export:

```css
.grid-table-header,
.grid-table-row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: center;
}

.grid-table-header {
  padding: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #858595;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.grid-table-row {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}
.grid-table-row:hover { background: #f9fafb; }
```

Column map ví dụ:

| Cột | Span |
|---|---:|
| Mã đơn / Khách hàng | 4 |
| Loại | 2 |
| Ngày đặt | 2 |
| Lô hàng | 2 |
| Trạng thái | 2 |

### 17.9 Table empty state

Khi bảng trống, không để body trắng hoàn toàn. Dùng empty state trong vùng table:

```css
.table-empty {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 48px 16px;
  color: #858595;
  text-align: center;
}
```

Copy nên theo ngữ cảnh: `Chưa có nhật ký nào`, `Chưa có QR nào`, `Không tìm thấy kết quả phù hợp`.

---

## 18. Pagination

Pagination luôn nằm trong footer của card/table, không nằm trôi nổi dưới trang.

### 18.1 Table footer pagination

```css
.pagination-footer {
  min-height: 64px;
  padding: 16px;
  border-top: 1px solid #e0e1e5;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #58586a;
  font-size: 14px;
}

.page-size-select {
  height: 32px;
  padding: 0 32px 0 12px;
  border: 1px solid #e0e1e5;
  border-radius: 8px;
  background: #ffffff;
  color: #3f3c48;
  font-size: 14px;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-button {
  min-width: 32px;
  height: 32px;
  border: 1px solid #e0e1e5;
  border-radius: 8px;
  background: #f4f4f6;
  color: #858595;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}

.page-button.active {
  background: #58586a;
  border-color: #58586a;
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.page-button:hover:not(.active):not(:disabled) {
  background: #ebecee;
}

.page-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

### 18.2 Content rules

- Page size text: `10 dòng`, `20 dòng`, `50 dòng`.
- Result count: `{n} kết quả`; nếu đang lọc, có thể dùng `Hiển thị 1-10 / 333 kết quả`.
- Page active màu xám đậm `#58586a`, không dùng brand green để tránh cạnh tranh với CTA.
- Prev/next icon 16px, button 32px.
- Nếu nhiều trang: hiển thị `1 2 ... 34`.

---

## 19. Modal, Dialog & Bottom Sheet Panel

Reference UI dùng modal cho phân quyền và form nghiệp vụ. Modal phải có header, body scroll, footer cố định.

### 19.1 Permission modal

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  padding: 16px;
  background: rgba(16,24,40,0.50);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-panel {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e1e5;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
```

### 19.2 Large form modal

Màn hình `Chi tiết Đơn xuất` dùng modal lớn:

```css
.modal-panel--large {
  max-width: 896px;          /* max-w-4xl */
  border-radius: 12px;
}

.modal-panel--large .modal-header,
.modal-panel--large .modal-footer {
  background: #f2faf2;
}

.modal-panel--large .modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
```

### 19.3 Bottom attached panel

Màn hình đơn xuất có panel lô hàng xuất nổi dưới modal, màu cam. Dùng cho summary/tính tiền có trọng tâm nghiệp vụ.

```css
.bottom-summary-panel {
  width: 100%;
  max-width: 896px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}

.summary-bar {
  background: #fe9a00;
  color: #ffffff;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.summary-bar:first-child { border-radius: 12px 12px 0 0; }
.summary-bar:last-child { border-radius: 0 0 12px 12px; }

.summary-search-row {
  background: #fffbeb;
  border-left: 1px solid #e0e1e5;
  border-right: 1px solid #e0e1e5;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-fields-row {
  background: #ffffff;
  border-left: 1px solid #e0e1e5;
  border-right: 1px solid #e0e1e5;
  padding: 16px 24px 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
```

**Quy tắc modal:**

- Header close button 32px, icon 16px, hover bg `#f4f4f6`.
- Body scroll bên trong modal, overlay không scroll trừ khi modal + panel vượt viewport.
- Footer action chính nằm bên phải. Với permission modal, summary `32 quyền đang bật` nằm trái.
- Không dùng modal lồng modal. Nếu cần chọn lô hàng phức tạp, dùng bottom panel hoặc route riêng.

---

## 20. Detail Form & Form Sections

Form nghiệp vụ trong reference UI dùng layout compact, label trên field, section chia bằng divider.

### 20.1 Form section

```css
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.form-section-accent {
  width: 4px;
  height: 16px;
  border-radius: 9999px;
  background: #009966;
}
.form-section-accent--violet { background: #8e51ff; }
.form-section-accent--orange { background: #fe9a00; }
.form-section-accent--green-bright { background: #00bc7d; }

.form-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #858595;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.form-divider {
  border: 0;
  border-top: 1px solid #f3f4f6;
}
```

### 20.2 Form grid

```css
.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.field-span-2 { grid-column: span 2 / span 2; }
.field-span-3 { grid-column: span 3 / span 3; }
```

### 20.3 Field label and input in modal forms

```css
.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #858595;
}

.required-mark {
  color: #ea616e;
}

.form-input,
.form-select-trigger {
  width: 100%;
  min-height: 40px;
  border: 1px solid #e0e1e5;
  border-radius: 6px;
  background: #f9fafb;
  padding: 10px 12px;
  color: #3f3c48;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.form-input:focus {
  background: #ffffff;
  border-color: #009966;
  box-shadow: 0 0 0 1px rgba(0,153,102,0.20);
}

.form-input::placeholder {
  color: #a3a4b0;
}

.form-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.form-select-trigger:hover {
  background: #f4f4f6;
}
```

### 20.4 Read-only calculation field

```css
.calculation-field {
  min-height: 40px;
  border: 1px solid #e0e1e5;
  border-radius: 6px;
  background: #f9fafb;
  padding: 10px 12px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
}

.calculation-field--orange {
  background: #fe9a00;
  border-color: #fe9a00;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
```

**Quy tắc form:**

- Label không uppercase trong form field thường, chỉ section title uppercase.
- Required mark là `*` đỏ sau label.
- Field mặc định có nền `#f9fafb` hoặc `#f4f4f6`; khi focus chuyển trắng.
- Placeholder màu `#a3a4b0`.
- Date/select trigger dùng icon phải 12-16px, opacity 50%.
- Dữ liệu tiền/số lượng căn phải, dùng `font-variant-numeric: tabular-nums`.

---

## 21. Checkbox, Toggle & Select Controls

### 21.1 Checkbox

```css
.checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #c2c3ca;
  color: #009966;
}
.checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,153,102,0.18);
}
.checkbox--blue {
  color: #1a69a1;
}
```

Checkbox trong filter có label 14px, gap 12px, cursor pointer trên cả label.

### 21.2 Toggle switch

Permission modal dùng switch 36x20px, thumb 16px.

```css
.toggle {
  width: 36px;
  height: 20px;
  border-radius: 9999px;
  background: #e5e7eb;
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
}

.toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18);
  transition: transform 0.15s;
}

.toggle.checked {
  background: #2b7fff;
}
.toggle.checked::after {
  transform: translateX(16px);
}
.toggle.disabled {
  opacity: 0.60;
  cursor: not-allowed;
}
```

### 21.3 Select

```css
.select {
  appearance: none;
  min-height: 32px;
  border: 1px solid #e0e1e5;
  border-radius: 8px;
  background: #ffffff;
  padding: 6px 32px 6px 12px;
  color: #4a5565;
  font-size: 12px;
  cursor: pointer;
}
.select:focus {
  outline: none;
  border-color: #1a69a1;
  box-shadow: 0 0 0 1px rgba(26,105,161,0.20);
}
```

For native select, wrap trong `.relative` và đặt chevron absolute right 8px, pointer-events none.

---

## 22. Avatar, Initials & Entity Cell

Reference UI dùng avatar chữ cái cho người dùng/nhân viên.

### 22.1 Avatar sizes

| Token | Size | Dùng cho |
|---|---:|---|
| `avatar-sm` | 28px | topbar pill |
| `avatar-md` | 36px | table row employee |
| `avatar-lg` | 40px | modal header |

```css
.avatar {
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 1px solid #e0e1e5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  flex-shrink: 0;
}
.avatar-sm { width: 28px; height: 28px; font-size: 12px; }
.avatar-md { width: 36px; height: 36px; font-size: 14px; }
.avatar-lg { width: 40px; height: 40px; font-size: 18px; }
```

### 22.2 Avatar color variants

```css
.avatar--slate {
  background: linear-gradient(135deg, #ecf0f1, #90a4ae);
  border-color: #b0bec5;
  color: #455a64;
}
.avatar--amber {
  background: linear-gradient(135deg, #fff3e0, #ffb74d);
  border-color: #ffcc80;
  color: #f57c00;
}
.avatar--red {
  background: linear-gradient(135deg, #fbe9e7, #ff8a65);
  border-color: #ffab91;
  color: #e64a19;
}
.avatar--green {
  background: linear-gradient(135deg, #e8f5e9, #81c784);
  border-color: #a5d6a7;
  color: #388e3c;
}
```

Không dùng ảnh random nếu không có avatar thật. Initial phải lấy chữ cái đầu của tên hiển thị, ví dụ `Thanh Hiếu` → `T`.

---

## 23. Loading, Empty, Error & Disabled States

### 23.1 Skeleton table

Màn hình lô hàng dùng skeleton row với block xám.

```css
.skeleton {
  height: 20px;
  border-radius: 4px;
  background: #e5e7eb;
  position: relative;
  overflow: hidden;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  animation: skeleton-shimmer 1.2s infinite;
}
@keyframes skeleton-shimmer {
  100% { transform: translateX(100%); }
}
```

Skeleton width nên mô phỏng dữ liệu:

- ID/name: 96px.
- Product: 80px.
- Quantity: 64px.
- Status/date: 80-96px.
- Action: 48px.

### 23.2 Empty states

Empty state public/admin nhỏ đã có ở mục 14. Với table, empty state nằm trong `table-scroll` hoặc card body.

Copy examples:

- `Chưa có nhật ký nào`
- `+ Ghi nhật ký đầu tiên`
- `Không tìm thấy kết quả`
- `Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm`

### 23.3 Error states

```css
.field-error .form-input,
.form-input.error {
  border-color: #ea616e;
  background: #fef2f0;
}

.field-error-text {
  margin-top: 4px;
  color: #ad3821;
  font-size: 12px;
  line-height: 16px;
}
```

### 23.4 Disabled states

```css
.is-disabled,
button:disabled,
input:disabled,
select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

input:disabled,
select:disabled {
  background: #f4f4f6;
  color: #a3a4b0;
}
```

Disabled không được chỉ đổi opacity nếu vẫn cần đọc dữ liệu quan trọng. Với read-only data, dùng `calculation-field` hoặc `readonly-field` thay vì disabled.

---

## 24. Responsive & Scroll Behavior

### 24.1 Breakpoints thực tế

| Surface | Min | Target | Behavior |
|---|---:|---:|---|
| Public guest | 375px | 1512px | mobile 1 cột, desktop 12 cột |
| Logged-in plot tabs | 375px | 896-1120px | nav scroll ngang |
| Admin shell | 1280px | 1366-1920px | desktop-first, sidebar fixed |
| Modal | 375px | 520/896px | full width minus 32px on mobile |

### 24.2 Public responsive

- Guest content desktop: `grid-cols-12`, left 8, right 4, gap 24px.
- Tablet/mobile: stack 1 cột, hero trước, info cards sau.
- Header tab nav luôn `overflow-x-auto`, ẩn scrollbar được.
- Hero height desktop 380px; mobile 280-320px.

### 24.3 Admin responsive

- Admin list pages không tối ưu dưới 1280px; nếu viewport nhỏ hơn, giữ sidebar và cho content/table scroll ngang.
- Bảng luôn có `min-width`, không ép chữ xuống dòng trong header.
- Chỉ table area scroll ngang/dọc, pagination footer không bị cuộn mất.
- Modal body scroll nội bộ với `max-height: 90vh`.

### 24.4 Scroll ownership

```
Admin Shell
└── main flex column overflow-hidden
    └── data-card flex column overflow-hidden
        ├── toolbar flex-shrink-0
        ├── table-scroll flex-1 overflow-auto
        └── pagination flex-shrink-0
```

Không đặt `overflow-y-auto` ở cả `main` và `table-scroll` cùng lúc cho một table page, vì sẽ tạo double scrollbar.

---

## 25. Implementation Checklist for AI Agents

Checklist này dùng trước khi agent khác dựng màn hình từ design system.

### 25.1 Foundation

- [ ] Import font `Be Vietnam Pro` và fallback `Inter`.
- [ ] Dùng page background `#f4f4f6`, surface `#ffffff`, text chính `#3f3c48`.
- [ ] Public cards dùng radius 21px; admin data cards/modal dùng radius 12px; inputs/buttons dùng 6-8px.
- [ ] Không tự phát minh palette mới. Chỉ dùng green/azure/amber/violet/red/neutral đã định nghĩa.

### 25.2 Layout

- [ ] Public guest: max-width 1512px, desktop padding ngang 196px, grid 12 cột.
- [ ] Logged-in detail: max-width khoảng 896-1120px, tab nav sticky/scroll ngang.
- [ ] Admin: sidebar 240-280px, topbar 56-64px, content padding 20-24px.
- [ ] Bảng nằm trong card flex column, table scroll riêng, pagination footer cố định.

### 25.3 Table

- [ ] Header sticky top 0, bg `#f4f4f6`.
- [ ] Table min-width tối thiểu 800px.
- [ ] Row hover `#f9fafb`/`gray-50`, divider `#f3f4f6`.
- [ ] Entity cell có avatar/thumbnail, title semibold, subtitle muted.
- [ ] Badge dùng đúng semantic variant, có dot khi là trạng thái hoạt động.
- [ ] Action column căn phải; action hover-only phải hiện khi `focus-within`.
- [ ] Pagination có page size, result count, prev/next, active page `#58586a`.

### 25.4 Forms & Modal

- [ ] Modal có overlay `rgba(16,24,40,0.50)`, panel radius 12px, body scroll.
- [ ] Form label 12px, margin-bottom 6px, required mark đỏ.
- [ ] Field height 40px trong modal form, 36px trong toolbar.
- [ ] Section title uppercase 12px với accent bar 4x16px.
- [ ] Footer action chính nằm bên phải, có cancel/close rõ nghĩa.

### 25.5 Interaction & Accessibility

- [ ] Mọi icon-only button có `aria-label` hoặc tooltip.
- [ ] Focus ring visible cho button/input/select/toggle/table action.
- [ ] Không truyền trạng thái chỉ bằng màu; badge cần text, trạng thái nên có dot/icon.
- [ ] Loading table dùng skeleton, không dùng spinner giữa vùng dữ liệu.
- [ ] Delete/destructive action có confirm.

---

## 26. CSS Variables & Tailwind Config

### 26.1 CSS Variables đầy đủ

```css
/* styles/theme.css */
:root {
  /* ── Brand Primary ────────────────────────── */
  --color-primary:           #009966;
  --color-primary-dark:      #007a55;
  --color-primary-darker:    #13773c;
  --color-primary-bright:    #00bc7d;
  --color-primary-tint:      #5ee9b5;
  --color-primary-border:    #a4f4cf;
  --color-primary-soft:      #d1eddd;
  --color-primary-foam:      #d0fae5;
  --color-primary-bg:        #ecfdf5;
  --color-primary-bg-light:  #eff9f3;
  --color-primary-bg-pale:   #f2faf2;

  /* ── Azure / Blue ─────────────────────────── */
  --color-azure-darkest:     #0e3754;
  --color-azure-dark:        #165988;
  --color-azure-primary:     #1a69a1;
  --color-azure-bright:      #2b7fff;
  --color-azure-text:        #62748e;
  --color-azure-muted:       #99a1af;
  --color-azure-light:       #a5cae4;
  --color-azure-border:      #d2e4f1;
  --color-azure-bg:          #eff5fa;

  /* ── Grey / Neutral ───────────────────────── */
  --color-grey-900:          #322e37;
  --color-grey-800:          #3f3c48;
  --color-grey-700:          #4b4a59;
  --color-grey-600:          #58586a;
  --color-grey-500:          #858595;
  --color-grey-400:          #a3a4b0;
  --color-grey-300:          #c2c3ca;
  --color-grey-200:          #d1d2d7;
  --color-grey-100:          #e0e1e5;
  --color-grey-50:           #ebecee;
  --color-text-primary:      #3f3c48;
  --color-text-section:      #58586a;
  --color-text-muted:        #858595;
  --color-text-nav:          #62748e;
  --color-border:            #e0e1e5;
  --color-border-subtle:     #f3f4f6;
  --color-border-input:      #c2c3ca;
  --color-bg-page:           #f4f4f6;
  --color-bg-surface:        #ffffff;
  --color-bg-surface-alt:    #fafafb;

  /* ── Orange / Amber ───────────────────────── */
  --color-amber-dark:        #bb4d00;
  --color-amber-primary:     #fe9a00;
  --color-amber-light:       #ffcc80;
  --color-amber-border:      #fef3c6;
  --color-amber-bg:          #fffbeb;

  /* ── Violet ───────────────────────────────── */
  --color-violet-primary:    #7f22fe;
  --color-violet-dark:       #7008e7;
  --color-violet-light:      #8e51ff;
  --color-violet-border:     #ede9fe;
  --color-violet-bg:         #f5f3ff;

  /* ── Red ──────────────────────────────────── */
  --color-red-primary:       #c6313f;
  --color-red-dark:          #ad3821;
  --color-red-light:         #f8b8ab;
  --color-red-bg:            #fef2f0;

  /* ── Status ───────────────────────────────── */
  --color-success-text:      #388e2f;
  --color-success-dot:       #66b75e;
  --color-success-bg:        #e6f4e7;
  --color-warning-text:      #bb4d00;
  --color-warning-bg:        #fffbeb;
  --color-info-text:         #165988;
  --color-info-bg:           #eff5fa;

  /* ── Typography ───────────────────────────── */
  --font-primary:   'Be Vietnam Pro', sans-serif;
  --font-secondary: 'Inter', sans-serif;

  /* ── Border Radius ────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-card: 21px;    /* ← Signature radius */
  --radius-admin-card: 12px;
  --radius-control: 8px;
  --radius-field: 6px;
  --radius-full: 9999px;

  /* ── Layout Sizes ─────────────────────────── */
  --admin-icon-rail-width: 56px;
  --admin-sidebar-width: 240px;
  --admin-sidebar-wide: 280px;
  --admin-topbar-height: 56px;
  --admin-topbar-tall: 64px;
  --table-row-compact: 48px;
  --table-row-default: 52px;
  --table-row-media: 80px;
  --control-height-sm: 32px;
  --control-height-md: 36px;
  --control-height-lg: 40px;
}
```

### 26.2 Tailwind Config

```javascript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', 'sans-serif'],
      },

      colors: {
        primary: {
          DEFAULT:  '#009966',
          dark:     '#007a55',
          darker:   '#13773c',
          bright:   '#00bc7d',
          tint:     '#5ee9b5',
          border:   '#a4f4cf',
          soft:     '#d1eddd',
          foam:     '#d0fae5',
          bg:       '#ecfdf5',
          'bg-light': '#eff9f3',
          'bg-pale': '#f2faf2',
        },
        azure: {
          darkest:  '#0e3754',
          dark:     '#165988',
          DEFAULT:  '#1a69a1',
          bright:   '#2b7fff',
          text:     '#62748e',
          muted:    '#99a1af',
          light:    '#a5cae4',
          border:   '#d2e4f1',
          bg:       '#eff5fa',
        },
        surface: '#ffffff',
        'page-bg': '#f4f4f6',
        'text-primary': '#3f3c48',
        'text-section': '#58586a',
        'text-muted':   '#858595',
        'text-nav':     '#62748e',
        'border-default': '#e0e1e5',
        'border-subtle':  '#f3f4f6',
        'border-input':   '#c2c3ca',
        amber: {
          dark:    '#bb4d00',
          DEFAULT: '#fe9a00',
          light:   '#ffcc80',
          border:  '#fef3c6',
          bg:      '#fffbeb',
        },
        violet: {
          dark:    '#7008e7',
          DEFAULT: '#7f22fe',
          light:   '#8e51ff',
          border:  '#ede9fe',
          bg:      '#f5f3ff',
        },
        red: {
          dark:    '#ad3821',
          DEFAULT: '#c6313f',
          light:   '#f8b8ab',
          bg:      '#fef2f0',
        },
        status: {
          success: { text: '#388e2f', dot: '#66b75e', bg: '#e6f4e7' },
          warning: { text: '#bb4d00', bg: '#fffbeb' },
          info:    { text: '#165988', bg: '#eff5fa' },
        },
      },

      borderRadius: {
        'card': '21px',       // ← Signature
        'admin-card': '12px',
        'inner': '16px',
        'field': '6px',
        'control': '8px',
        'DEFAULT': '8px',
      },

      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 25px 50px rgba(0,0,0,0.25)',
        control: '0 1px 2px rgba(0,0,0,0.04)',
      },

      fontSize: {
        'micro':  ['9px',    { lineHeight: '14px' }],
        'tiny':   ['10px',   { lineHeight: '15px' }],
        'xs':     ['10.5px', { lineHeight: '14px' }],
        'sm':     ['11px',   { lineHeight: '17.9px' }],
        'base':   ['12.3px', { lineHeight: '17.5px' }],
        'md':     ['14px',   { lineHeight: '21px' }],
        'lg':     ['15.8px', { lineHeight: '19.7px' }],
        'xl':     ['21px',   { lineHeight: '28px' }],
        '2xl':    ['31.5px', { lineHeight: '39.4px' }],
      },
    },
  },
}
```

### 26.3 Utility classes hay dùng

```css
/* Card section header text — dùng nhiều nơi */
.section-heading {
  @apply text-xs font-semibold uppercase tracking-widest;
}

/* Label uppercase muted */
.metadata-label {
  @apply text-[11px] font-medium uppercase text-text-muted;
  letter-spacing: 0.28px;
}

/* Info value */
.field-value {
  @apply text-base font-medium text-text-primary;
}
```
