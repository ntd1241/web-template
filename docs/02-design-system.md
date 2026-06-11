# Design System — Ứng dụng Quản lý Web Admin (Thị trường Việt Nam)

> Tài liệu này định nghĩa các tiêu chuẩn thiết kế cho hệ thống web admin hướng đến người dùng doanh nghiệp Việt Nam. Ưu tiên: mật độ thông tin cao, thao tác nhanh, học nhanh, ít nhầm lẫn.

---

## Mục lục

1. [Triết lý thiết kế](#1-triết-lý-thiết-kế)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Density](#4-spacing--density)
5. [Layout & Page Structure](#5-layout--page-structure)
6. [Data Table](#6-data-table)
7. [Form & Input](#7-form--input)
8. [Table Form (Inline Editable)](#8-table-form-inline-editable)
9. [Buttons & Actions](#9-buttons--actions)
10. [Pagination](#10-pagination)
11. [Navigation](#11-navigation)
12. [Feedback & Status](#12-feedback--status)
13. [Modal & Dialog](#13-modal--dialog)
14. [Icons](#14-icons)
15. [States & Interactions](#15-states--interactions)
16. [Accessibility & Keyboard](#16-accessibility--keyboard)

---

## 1. Triết lý thiết kế

### 1.1 Nguyên tắc cốt lõi

**Hiệu quả trên thẩm mỹ**
Người dùng doanh nghiệp sử dụng hệ thống 6–8 giờ/ngày. Mục tiêu là giảm số thao tác, giảm mỏi mắt, tăng tốc độ xử lý công việc — không phải tạo ấn tượng thị giác.

**Thông tin rõ ràng ngay lập tức**
Dữ liệu phải đọc được không cần hover hay click thêm. Trạng thái, giá trị, cảnh báo — hiển thị trực tiếp trên giao diện chứ không ẩn trong tooltip hay menu con.

**Mật độ thông tin cao, không rối**
Cân bằng giữa "nhiều thông tin" và "dễ quét". Dùng khoảng trắng có chủ đích, không dùng khoảng trắng để "trông sang trọng".

**Hành vi nhất quán, có thể đoán trước**
Cùng một loại action phải có cùng vị trí, màu sắc, icon trên toàn hệ thống. Người dùng không cần suy nghĩ lại khi chuyển trang.

**Màu sắc truyền thông tin**
Màu không chỉ là trang trí — mỗi màu có nghĩa cố định (xanh = hành động chính, đỏ = nguy hiểm/xóa, cam = cảnh báo, xám = vô hiệu hóa).

### 1.2 Hành vi người dùng điển hình ở VN

- Thích thấy tất cả thông tin trên một màn hình, ít cuộn trang
- Quen với phần mềm desktop (Excel, Word) — chấp nhận UI dense
- Sử dụng chủ yếu trên màn hình 15"–24", độ phân giải 1366×768 đến 1920×1080
- Thao tác bàn phím nhiều (Tab, Enter, F2, Escape) khi nhập liệu hàng loạt
- Hay dùng chuột phải (right-click context menu)
- Ít dùng dark mode

---

## 2. Color System

### 2.1 Brand Colors

```
Primary Blue     #1677FF   — Hành động chính, link, trạng thái active
Primary Hover    #0958D9   — Hover state của primary
Primary Light    #E6F4FF   — Background highlight, tag, badge nhẹ
Primary Border   #91CAFF   — Border của input focus, selected row
```

### 2.2 Semantic Colors

```
Success Green    #52C41A   — Trạng thái thành công, đã duyệt, đã thanh toán
Success Light    #F6FFED   — Background của success state
Success Border   #B7EB8F

Warning Orange   #FA8C16   — Cảnh báo, đang xử lý, chờ duyệt
Warning Light    #FFF7E6
Warning Border   #FFD591

Danger Red       #FF4D4F   — Lỗi, xóa, hủy, vượt hạn mức
Danger Light     #FFF2F0
Danger Border    #FFA39E

Info Cyan        #1677FF   — Thông tin bổ sung (dùng chung primary)
```

### 2.3 Neutral Colors (Bộ màu nền & text)

```
— Text chính        #141414   (gần đen, không đen tuyệt đối)
— Text phụ          #595959   (gray-7)
— Text placeholder  #BFBFBF   (gray-5)
— Text disabled     #BFBFBF

— Border mạnh       #D9D9D9   (gray-5) — border input, table cell
— Border nhẹ        #F0F0F0   (gray-3) — divider, row separator
— Background trang  #F5F5F5   (gray-2) — màu nền layout
— Background card   #FFFFFF
— Background header bảng  #FAFAFA
— Background row hover    #F5F5F5
— Background row selected #E6F4FF
```

### 2.4 Quy tắc sử dụng màu

| Ngữ cảnh | Màu |
|---|---|
| Button chính (Lưu, Thêm mới, Tìm kiếm) | `#1677FF` — text trắng |
| Button nguy hiểm (Xóa, Hủy đơn) | `#FF4D4F` — text trắng |
| Button thứ cấp (Xuất Excel, In) | Border `#D9D9D9` — text `#141414` |
| Button ghost (Hủy bỏ trong form) | Transparent — text `#595959` |
| Link / text action trong bảng | `#1677FF`, không underline |
| Tag trạng thái Hoạt động | Nền `#F6FFED`, text `#389E0D`, border `#B7EB8F` |
| Tag trạng thái Chờ duyệt | Nền `#FFF7E6`, text `#D46B08`, border `#FFD591` |
| Tag trạng thái Đã hủy | Nền `#F5F5F5`, text `#8C8C8C`, border `#D9D9D9` |
| Tag trạng thái Lỗi/Nợ | Nền `#FFF2F0`, text `#CF1322`, border `#FFA39E` |
| Dòng highlight cảnh báo | Nền `#FFFBE6` |
| Dòng highlight lỗi | Nền `#FFF2F0` |

---

## 3. Typography

### 3.1 Font

```
Font chính: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif
            (System UI — không cần load font web, render nhanh)

Fallback VN: Nếu cần hỗ trợ dấu tiếng Việt sắc nét → "Be Vietnam Pro", sans-serif
```

### 3.2 Scale

| Token | Size | Line Height | Weight | Dùng cho |
|---|---|---|---|---|
| `text-xs` | 11px | 16px | 400 | Label phụ, metadata, timestamp |
| `text-sm` | 12px | 18px | 400 | Nội dung bảng, form label phụ |
| `text-base` | 13px | 20px | 400 | **Text mặc định toàn hệ thống** |
| `text-md` | 14px | 22px | 400 | Text có độ ưu tiên cao trong bảng |
| `text-title` | 16px | 24px | 600 | Tiêu đề trang, tiêu đề section |
| `text-heading` | 20px | 28px | 600 | Hiếm dùng — chỉ cho modal lớn |

> **Lưu ý:** Text mặc định 13px — nhỏ hơn web thông thường nhưng phù hợp với mật độ thông tin cao. Không nhỏ hơn 12px cho nội dung bảng.

### 3.3 Quy tắc Text

- **Tên, mã, số quan trọng:** `font-weight: 500` hoặc `600` để nổi bật trong bảng
- **Số tiền, số lượng:** `font-variant-numeric: tabular-nums` — căn đều cột số
- **Cắt text dài:** `text-overflow: ellipsis` với tooltip khi hover
- **Không dùng italic** trong nội dung dữ liệu
- **Uppercase:** Chỉ dùng cho label danh mục nhỏ, KHÔNG dùng cho nút hay heading lớn

---

## 4. Spacing & Density

### 4.1 Base Unit

```
Base: 4px
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

### 4.2 Component Density

**Table Row Height**
```
Compact mode:  36px  (nhập liệu nhiều, màn hình nhỏ)
Default mode:  40px  (chuẩn cho admin VN)
Comfortable:   48px  (khi có avatar, nhiều dòng text)
```

**Cell Padding**
```
Ngang:  16px (cột dữ liệu) / 12px (cột số, checkbox)
Dọc:    tính từ row height — tự động căn giữa
```

**Form Field**
```
Input height:     32px  (compact) / 36px (default)
Label margin:     0 0 4px  (label phía trên)
Field gap:        16px  (khoảng cách giữa các field)
Section gap:      24px  (khoảng cách giữa các nhóm field)
```

**Button**
```
Height:     32px (default) / 24px (small) / 40px (large — hiếm dùng)
Padding:    0 15px (default) / 0 11px (small)
Gap icon:   6px
```

**Card / Panel Padding**
```
Nội dung card:    16px (compact) / 24px (thoáng)
Card header:      12px 16px
```

### 4.3 Breakpoints

```
Min support:   1280px  (không hỗ trợ dưới mức này cho admin)
Target:        1366px – 1920px
Sidebar thu:   < 1440px → sidebar collapsed mặc định
```

---

## 5. Layout & Page Structure

### 5.1 Khung chính

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)  │          MAIN AREA                  │
│                   │  ┌───────────────────────────────┐  │
│  [Logo]           │  │  Page Header (48px)           │  │
│                   │  │  Breadcrumb + Page Title + Actions│
│  [Menu Item]      │  ├───────────────────────────────┤  │
│  [Menu Item] ◀    │  │                               │  │
│    [Sub Item]     │  │  Page Content                 │  │
│    [Sub Item]     │  │  (flex: 1, overflow: hidden)  │  │
│  [Menu Item]      │  │                               │  │
│                   │  └───────────────────────────────┘  │
│  [User Info]      │                                      │
└─────────────────────────────────────────────────────────┘
```

**Sidebar:** `width: 240px`, collapsed: `64px` (chỉ icon)
**Main Area:** `flex: 1`, chiếm toàn bộ chiều cao viewport
**Không có footer toàn cục** — pagination nằm trong từng trang content

### 5.2 Page Header

```
height: 48px
padding: 0 24px
border-bottom: 1px solid #F0F0F0
background: #FFFFFF

Bố cục:
[Breadcrumb / Page Title]          [Action Buttons Group]
```

- **Breadcrumb:** `Home > Danh mục > Sản phẩm` — text-sm, text phụ
- **Page Title:** 16px, font-weight 600, hiển thị rõ trang đang ở đâu
- **Action Buttons:** Nhóm ở góc phải, thứ tự: Secondary Actions | Primary Action

### 5.3 Content Area — Layout Chuẩn cho List Page

```
┌──────────────────────────────────────────────────────┐
│ Page Header: Tiêu đề + nút [+ Thêm mới]              │  48px
├──────────────────────────────────────────────────────┤
│ Toolbar: [🔍 Tìm kiếm] [Filter] [Trạng thái ▼]      │  52px
│          Bên phải: [📥 Nhập Excel] [📤 Xuất Excel]   │
├──────────────────────────────────────────────────────┤
│ Bulk Action Bar (ẩn/hiện khi chọn dòng):             │  40px (conditional)
│ Đã chọn 5 dòng | [Xóa] [Xuất] [Đổi trạng thái]      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  TABLE (flex: 1, overflow-y: auto)                   │  ← SCROLL Ở ĐÂY
│  thead sticky top-0                                  │
│  tbody overflow-y: auto                              │
│                                                      │
├──────────────────────────────────────────────────────┤
│ PAGINATION: Hiển thị 1-20 / 347 kết quả  [< 1 2 3 >]│  48px
└──────────────────────────────────────────────────────┘
```

**CSS cốt lõi cho layout này:**
```css
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;           /* hoặc calc(100vh - height-of-navbar) */
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  gap: 0;
}

.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  background: #fff;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;        /* CHỈ tbody area scroll */
}

.table-wrapper table {
  width: 100%;
  border-collapse: collapse;
}

.table-wrapper thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #FAFAFA;
}

.pagination-bar {
  flex-shrink: 0;          /* Không bị co lại */
  height: 48px;
  border-top: 1px solid #F0F0F0;
  padding: 0 16px;
}
```

### 5.4 Content Area — Layout cho Detail/Form Page

```
┌──────────────────────────────────────────────────────┐
│ Page Header: [← Quay lại]  Tiêu đề  [Lưu] [Hủy]    │  48px
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────┐  ┌───────────────────────┐  │
│  │  Main Form Panel    │  │  Side Panel           │  │
│  │  (flex: 1)          │  │  (width: 300-360px)   │  │
│  │                     │  │  Trạng thái, ghi chú  │  │
│  │  Thông tin chính    │  │  Lịch sử thay đổi     │  │
│  │                     │  │                       │  │
│  └─────────────────────┘  └───────────────────────┘  │
│                                                      │
│  [Table Form — Danh sách sản phẩm trong đơn hàng]   │
│                                                      │
│  [Footer Form: Tổng tiền, Chiết khấu, Thanh toán]   │
└──────────────────────────────────────────────────────┘
```

---

## 6. Data Table

### 6.1 Cấu trúc Table

```
┌─[ ]─┬──────────────────┬────────────┬────────────┬──────────┬──────────┐
│  ☐  │ Tên sản phẩm     │ Mã SP      │ Đơn giá    │ Tồn kho  │ Thao tác │
├─────┼──────────────────┼────────────┼────────────┼──────────┼──────────┤
│  ☐  │ Áo thun basic    │ SP0001     │ 150,000    │ 245      │ Sửa Xóa  │
│  ☐  │ Quần jean slim   │ SP0002     │ 380,000    │ 0        │ Sửa Xóa  │  ← row màu khác khi out-of-stock
├─────┼──────────────────┼────────────┼────────────┼──────────┼──────────┤
│     │                  │            │            │          │          │
```

### 6.2 Table Header

```css
thead th {
  background: #FAFAFA;
  border-bottom: 2px solid #D9D9D9;   /* Đường phân cách header rõ hơn */
  border-right: 1px solid #F0F0F0;
  padding: 0 16px;
  height: 40px;
  font-size: 13px;
  font-weight: 600;
  color: #595959;
  white-space: nowrap;
  user-select: none;
}
```

- **Cột số/tiền:** căn phải, header cũng căn phải
- **Cột checkbox:** `width: 40px`, căn giữa
- **Cột thao tác:** cố định bên phải (`position: sticky; right: 0`)
- **Sortable column:** hiển thị icon ↕ mờ, khi active hiển thị ↑ hoặc ↓ rõ

### 6.3 Table Body Row

```css
tbody tr {
  height: 40px;
  border-bottom: 1px solid #F0F0F0;
  transition: background 0.1s;
}

tbody tr:hover {
  background: #F5F5F5;
}

tbody tr.selected {
  background: #E6F4FF;
}

tbody tr.row-warning {
  background: #FFFBE6;
}

tbody tr.row-danger {
  background: #FFF2F0;
}

tbody td {
  padding: 0 16px;
  font-size: 13px;
  color: #141414;
  border-right: 1px solid #F0F0F0;
}
```

### 6.4 Các loại nội dung trong Cell

| Loại | Hiển thị |
|---|---|
| Text thông thường | Căn trái, cắt ellipsis nếu dài |
| Mã (code, ID) | `font-family: monospace`, màu `#595959` |
| Số tiền | Căn phải, format `1,234,567` (dấu phẩy phân cách nghìn) |
| Số lượng | Căn phải |
| Ngày tháng | `dd/MM/yyyy` — format quen thuộc VN |
| Ngày giờ | `dd/MM/yyyy HH:mm` |
| Trạng thái | Tag/Badge có màu |
| Link action | Text màu `#1677FF`, không underline, hover underline |
| Boolean | Icon ✓ (xanh) hoặc — (xám), không dùng chữ "True/False" |
| Rỗng/Null | Hiển thị `—` (em dash), màu `#BFBFBF` |

### 6.5 Cột Thao tác (Action Column)

```
Mặc định (hiển thị thường xuyên):
[Sửa]  [Xóa]

Khi nhiều action (> 3):
[Sửa]  [•••]  ← dropdown menu khi click
         ├── Xem chi tiết
         ├── Nhân bản
         ├── Xuất PDF
         └── ──────────
             Xóa          ← action nguy hiểm cách biệt bằng divider
```

**Quy tắc action column:**
- `position: sticky; right: 0; background: inherit` — luôn hiển thị khi scroll ngang
- Width cố định, không co giãn
- Chỉ hiển thị icon + text, không icon đơn thuần (tránh người dùng không hiểu)
- Xóa phải có confirm dialog — không xóa trực tiếp

### 6.6 Trạng thái bảng rỗng

```
┌──────────────────────────────────────────────┐
│                                              │
│          [Icon dữ liệu trống]                │
│       Không có dữ liệu                       │
│   Thử thay đổi bộ lọc hoặc tìm kiếm         │
│                                              │
│        [+ Thêm mới]                          │  ← CTA nếu có quyền
│                                              │
└──────────────────────────────────────────────┘
```

### 6.7 Cột cố định (Frozen Columns)

Khi table có nhiều cột, cột đầu (tên/mã) và cột cuối (thao tác) phải cố định:

```css
/* Cột trái cố định */
th.frozen-left, td.frozen-left {
  position: sticky;
  left: 0;
  z-index: 1;
  background: inherit;
  box-shadow: 2px 0 4px rgba(0,0,0,0.08);
}

/* Cột phải cố định */
th.frozen-right, td.frozen-right {
  position: sticky;
  right: 0;
  z-index: 1;
  background: inherit;
  box-shadow: -2px 0 4px rgba(0,0,0,0.08);
}
```

---

## 7. Form & Input

### 7.1 Cấu trúc Form Field

```
Label *                        ← * đỏ cho trường bắt buộc
┌────────────────────────────┐
│ Nhập nội dung...           │
└────────────────────────────┘
✗ Thông báo lỗi              ← text-sm, màu #FF4D4F, có icon ✗
```

### 7.2 Input States

```css
/* Default */
input {
  height: 32px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  padding: 0 11px;
  font-size: 13px;
  color: #141414;
  background: #FFFFFF;
}

/* Focus */
input:focus {
  border-color: #1677FF;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.12);
  outline: none;
}

/* Error */
input.error {
  border-color: #FF4D4F;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.12);
}

/* Disabled */
input:disabled {
  background: #F5F5F5;
  color: #BFBFBF;
  cursor: not-allowed;
}

/* Read-only (hiển thị dữ liệu không sửa được) */
input.readonly {
  background: #FAFAFA;
  border-color: #D9D9D9;
  cursor: default;
}
```

### 7.3 Các loại Input

**Text Input**
Dùng cho: tên, mô tả, địa chỉ

**Number Input**
```
Căn phải nội dung
Có nút tăng/giảm (spinner) cho số lượng nhỏ
Format tự động dấu phẩy cho số tiền (onBlur)
```

**Select / Dropdown**
```
Height: 32px
Caret icon bên phải
Hỗ trợ search khi > 10 options
Hỗ trợ multi-select với tag hiển thị bên trong input
Option list: max-height 300px, overflow-y scroll
Phân nhóm options nếu cần (optgroup với divider)
```

**Date Picker**
```
Format hiển thị: dd/MM/yyyy (chuẩn VN)
Mở calendar popup khi click
Có nút "Hôm nay"
Range picker: [Từ ngày ____] → [Đến ngày ____] trên cùng 1 dòng
```

**Textarea**
```
Min height: 80px
Resize: vertical only
Có counter ký tự nếu có giới hạn: [0/500]
```

**Checkbox & Radio**
```
Size: 16x16px
Căn giữa theo chiều cao label
Label click được (toàn bộ vùng)
Indeterminate state cho "chọn tất cả" một phần
```

**Search Input**
```
Icon kính lúp bên trái (16px)
Nút clear (✕) xuất hiện khi có text
Debounce 300ms trước khi search
Height: 32px
```

### 7.4 Form Layout — 2 cột chuẩn

```
┌─────────────────────┐  ┌─────────────────────┐
│ Tên khách hàng *    │  │ Mã khách hàng        │
│ [__________________]│  │ [KH-AUTO-GENERATED__]│
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Số điện thoại *     │  │ Email                │
│ [__________________]│  │ [__________________] │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────────────────────────────────┐
│ Địa chỉ                                         │
│ [______________________________________________] │
└─────────────────────────────────────────────────┘
```

**Quy tắc layout form:**
- 2 cột: `gap: 16px`, mỗi cột `flex: 1`
- Trường spanning full width: địa chỉ, ghi chú, mô tả dài
- Label phía trên input (không dùng inline label)
- Nhóm các field liên quan vào `Section` với tiêu đề section
- Section padding: `16px`, dùng `Card` hoặc `border-radius` bọc ngoài

### 7.5 Form Validation

```
Validate khi:
- onBlur (rời khỏi field)  — hiển thị lỗi tức thì
- onSubmit               — validate toàn bộ, scroll đến lỗi đầu tiên

Không validate:
- onKeyUp — quá nhiều (người dùng đang gõ)

Error message:
- Ngắn gọn, nói rõ vấn đề: "Số điện thoại không hợp lệ" (không phải "Invalid")
- Tiếng Việt hoàn toàn
- Vị trí: dưới input, font-size 12px, màu #FF4D4F
```

---

## 8. Table Form (Inline Editable)

Dùng cho: Danh sách sản phẩm trong đơn hàng, chi tiết phiếu nhập xuất, bảng công nợ có thể chỉnh sửa trực tiếp.

### 8.1 Cấu trúc

```
┌───┬──────────────────┬────────────────┬──────────┬──────────┬────────┬────┐
│ # │ Tên sản phẩm *   │ Đơn vị         │ Số lượng │ Đơn giá  │ T.Tiền │    │
├───┼──────────────────┼────────────────┼──────────┼──────────┼────────┼────┤
│ 1 │[Áo thun basic___]│[Cái          ▼]│[  24    ]│[150,000 ]│3,600,000│[✕]│
│ 2 │[Quần jean_______]│[Cái          ▼]│[  10    ]│[380,000 ]│3,800,000│[✕]│
│ * │                  │                │          │          │        │    │
├───┴──────────────────┴────────────────┴──────────┴──────────┼────────┤    │
│                          [+ Thêm dòng] [📋 Nhập từ Excel]  │TỔNG:   │    │
│                                                             │7,400,000│    │
└─────────────────────────────────────────────────────────────┴────────┴────┘
```

### 8.2 Quy tắc Table Form

**Trạng thái cell:**
- Mặc định: hiển thị như text, border nhẹ `#F0F0F0`
- Khi click vào cell: trở thành input, focus ngay
- Tab: di chuyển sang cell tiếp theo theo thứ tự logic
- Enter: xuống dòng mới
- Escape: hủy edit, trở về giá trị cũ

**Cột tính toán:**
- Cột "Thành tiền" = Số lượng × Đơn giá: background `#FAFAFA`, không edit được
- Tự động cập nhật khi thay đổi Số lượng hoặc Đơn giá

**Validation inline:**
- Highlight cell đỏ nếu có lỗi
- Tooltip lỗi khi hover
- Không block việc di chuyển sang cell khác (non-blocking validation)

**Dòng "Thêm mới":**
- Dòng cuối có ký hiệu `*` hoặc nút `+ Thêm dòng` rõ ràng
- Click vào dòng trống → focus vào cột đầu tiên
- Hoặc có nút riêng `+ Thêm dòng` phía dưới bảng

**Xóa dòng:**
- Nút `✕` cột cuối, hover mới hiện đỏ
- Có confirm nếu dòng đã có dữ liệu

**Cột số:**
- Number input, căn phải
- Không cho nhập âm nếu không phù hợp ngữ cảnh
- Format số tự động khi blur

---

## 9. Buttons & Actions

### 9.1 Phân cấp Button

```
Primary    — Hành động chính của trang/form (Lưu, Thêm mới, Tìm kiếm)
Secondary  — Hành động phụ (Xuất Excel, In, Nhập từ file)
Danger     — Hành động hủy không thể hoàn tác (Xóa, Hủy đơn hàng)
Ghost      — Hành động thứ yếu (Hủy bỏ trong modal, Quay lại)
Link       — Navigation hoặc action trong văn bản/bảng
```

### 9.2 Styling

```
PRIMARY
background: #1677FF
color: #FFFFFF
border: 1px solid #1677FF
hover: background #0958D9
active: background #003EB3

SECONDARY
background: #FFFFFF
color: #141414
border: 1px solid #D9D9D9
hover: border-color #1677FF, color #1677FF

DANGER
background: #FF4D4F
color: #FFFFFF
border: 1px solid #FF4D4F
hover: background #D9363E

GHOST
background: transparent
color: #595959
border: 1px solid #D9D9D9
hover: background #F5F5F5

DISABLED (mọi loại)
opacity: 0.5
cursor: not-allowed
pointer-events: none
```

### 9.3 Button với Icon

```
[📥 Nhập Excel]    ← icon trái, text rõ, không icon đơn thuần
[+ Thêm mới]       ← icon + cho action tạo mới
[🖨 In]            ← icon phù hợp với action
[✕ Xóa]           ← icon cảnh báo cho action nguy hiểm
```

**Không dùng icon-only button** nếu không có tooltip giải thích. Người dùng VN cần thấy text.

### 9.4 Button Group (Toolbar)

```
Nhóm action liên quan đặt cạnh nhau, cách nhóm khác bằng divider hoặc khoảng gap:

[+ Thêm mới]  [📥 Nhập Excel]  |  [📤 Xuất Excel]  [🖨 In]
     Primary      Secondary    Divider  Secondary     Secondary
```

### 9.5 Confirm trước Action nguy hiểm

```
┌──────────────────────────────────┐
│  ⚠ Xác nhận xóa                 │
│                                  │
│  Bạn có chắc muốn xóa           │
│  "Áo thun basic SP0001"?        │
│  Hành động này không thể hoàn   │
│  tác.                            │
│                                  │
│           [Hủy]  [Xóa]          │
└──────────────────────────────────┘
```

- Nút xác nhận phải là button Danger (đỏ), rõ nghĩa ("Xóa" không phải "OK")
- Nút hủy là Ghost hoặc Secondary
- Mô tả rõ object đang bị tác động (tên sản phẩm, mã đơn hàng, v.v.)

---

## 10. Pagination

### 10.1 Layout

```
Tổng: 347 kết quả             [<] [1] [2] [3] ... [18] [>]    Hiển thị: [20 ▼] / trang
```

### 10.2 Thành phần

- **Tổng số kết quả:** Bên trái, text-sm, màu phụ. Ví dụ: `Hiển thị 21 - 40 / 347 kết quả`
- **Page buttons:** Số trang, tối đa hiển thị 7 số, dùng `...` khi nhiều
- **Prev / Next:** Icon `‹` `›`, disabled khi ở đầu/cuối
- **Page size selector:** Dropdown chọn số dòng/trang `[20 ▼]`, vị trí phải

```
Các lựa chọn page size:  10 / 20 / 50 / 100
Mặc định:               20
```

### 10.3 Styling

```css
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-top: 1px solid #F0F0F0;
  background: #FFFFFF;
  flex-shrink: 0;   /* QUAN TRỌNG: không co lại */
}

.page-btn {
  min-width: 32px;
  height: 32px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

.page-btn.active {
  background: #1677FF;
  border-color: #1677FF;
  color: #fff;
}

.page-btn:hover:not(.active):not(:disabled) {
  border-color: #1677FF;
  color: #1677FF;
}
```

---

## 11. Navigation

### 11.1 Sidebar Menu

**Cấu trúc:**
```
[Logo / Tên hệ thống]         (height: 56px)
─────────────────────
[🏠] Tổng quan                ← item 1 cấp
[📦] Kho hàng           ›     ← có sub-menu
     └─ Danh sách hàng hóa   ← sub-item
     └─ Phiếu nhập kho
     └─ Phiếu xuất kho
[👥] Khách hàng          ›
[📋] Đơn hàng
[💰] Tài chính           ›
[📊] Báo cáo             ›
─────────────────────
[⚙️] Cài đặt
[👤] Tài khoản
```

**Styling sidebar item:**
```css
.menu-item {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #595959;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.menu-item:hover {
  background: rgba(22, 119, 255, 0.06);
  color: #1677FF;
}

.menu-item.active {
  background: #E6F4FF;
  color: #1677FF;
  font-weight: 500;
}

/* Icon */
.menu-item .icon {
  width: 16px;
  color: inherit;
  flex-shrink: 0;
}

/* Sub-item */
.sub-menu-item {
  height: 36px;
  padding-left: 42px;  /* indent */
  font-size: 13px;
}
```

**Quy tắc:**
- Highlight menu item active của trang hiện tại (không chỉ group cha)
- Sub-menu tự mở khi navigate đến trang con
- Collapsed sidebar: hiện tooltip với tên khi hover icon
- Tối đa 2 cấp menu. Tránh 3 cấp — quá phức tạp

### 11.2 Breadcrumb

```
Tổng quan  /  Kho hàng  /  Danh sách hàng hóa
   Link         Link            Text (trang hiện tại)
```

- Font-size: 13px
- Phân cách: `/` màu xám nhạt
- Cấp cuối: text thường, không phải link
- Hiển thị đủ path, không rút ngắn

### 11.3 Tab Navigation (nội bộ trang)

Dùng khi trang có nhiều section lớn:

```
[Thông tin chung]  [Lịch sử mua hàng]  [Công nợ]  [Ghi chú]
─────────────────
```

- Underline style (không dùng box/pill) cho admin app
- Tab active: border-bottom `2px solid #1677FF`, text `#1677FF`
- Tab inactive: text `#595959`, hover text `#1677FF`

---

## 12. Feedback & Status

### 12.1 Tag / Badge trạng thái

Dùng để hiển thị trạng thái trong bảng và form:

```html
<!-- Cấu trúc -->
<span class="tag tag--success">Hoạt động</span>
<span class="tag tag--warning">Chờ duyệt</span>
<span class="tag tag--danger">Đã hủy</span>
<span class="tag tag--default">Nháp</span>
```

```css
.tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid;
  white-space: nowrap;
}

.tag--success  { background: #F6FFED; color: #389E0D; border-color: #B7EB8F; }
.tag--warning  { background: #FFF7E6; color: #D46B08; border-color: #FFD591; }
.tag--danger   { background: #FFF2F0; color: #CF1322; border-color: #FFA39E; }
.tag--info     { background: #E6F4FF; color: #0958D9; border-color: #91CAFF; }
.tag--default  { background: #F5F5F5; color: #8C8C8C; border-color: #D9D9D9; }
```

**Không dùng màu tự do** — chỉ dùng 5 loại tag trên với nghĩa cố định.

### 12.2 Toast Notification

```
┌─────────────────────────────────────────┐
│  ✓  Lưu thành công                   ✕ │
└─────────────────────────────────────────┘
```

- Vị trí: top-right, cách viền 16px
- Tự động đóng sau 3 giây (thành công) / 5 giây (lỗi)
- Có nút đóng thủ công
- Stack tối đa 3 thông báo

```
Success toast: #F6FFED, border-left 4px solid #52C41A
Error toast:   #FFF2F0, border-left 4px solid #FF4D4F
Warning toast: #FFF7E6, border-left 4px solid #FA8C16
Info toast:    #E6F4FF, border-left 4px solid #1677FF
```

### 12.3 Alert Banner (trong trang)

Dùng khi có thông báo quan trọng cho toàn trang (hết hạn, cảnh báo hệ thống):

```
┌─────────────────────────────────────────────────────────┐
│  ⚠  Phiên bản dùng thử sẽ hết hạn vào 30/12/2024.     │
│     Vui lòng liên hệ để gia hạn.           [Liên hệ]  │
└─────────────────────────────────────────────────────────┘
```

Nằm ngay dưới Page Header, trên content area.

### 12.4 Loading States

**Table loading:**
```
Hiển thị skeleton rows (không spinner trên toàn bảng)
3-5 skeleton rows với animation shimmer
```

**Button loading:**
```
[⟳ Đang lưu...]  ← spinner icon thay thế icon cũ, text thay đổi, disabled
```

**Page loading:**
```
Progress bar mảnh (4px) chạy ngang top của content area
Không dùng overlay toàn trang
```

**Empty State** (đã đề cập ở mục 6.6)

---

## 13. Modal & Dialog

### 13.1 Phân loại

| Loại | Width | Dùng cho |
|---|---|---|
| Small | 400px | Confirm xóa, thông báo đơn giản |
| Default | 560px | Form thêm/sửa đơn giản (< 8 field) |
| Large | 800px | Form phức tạp, có table form bên trong |
| Full | 90vw | Preview tài liệu, form rất phức tạp |

### 13.2 Cấu trúc Modal

```
┌────────────────────────────────────────┐
│  Tiêu đề Modal                      ✕  │  ← Header: 52px
├────────────────────────────────────────┤
│                                        │
│  Nội dung form                         │  ← Body: overflow-y auto
│                                        │     max-height: 70vh
│                                        │
├────────────────────────────────────────┤
│              [Hủy]  [Lưu]             │  ← Footer: 52px, actions
└────────────────────────────────────────┘
```

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.45);
}

.modal {
  background: #FFFFFF;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08);
}

.modal-header {
  height: 52px;
  padding: 0 24px;
  border-bottom: 1px solid #F0F0F0;
  font-size: 16px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: 70vh;
}

.modal-footer {
  height: 52px;
  padding: 0 24px;
  border-top: 1px solid #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
```

**Quy tắc:**
- Đóng bằng: nút ✕, nút Hủy, hoặc click nền overlay
- **Không đóng** khi nhấn Escape giữa chừng form (để tránh mất dữ liệu) — hiện confirm trước
- Không lồng modal trong modal — dùng drawer hoặc trang mới thay thế
- Scroll bên trong body, không phải cả modal

---

## 14. Icons

### 14.1 Thư viện icon

Ưu tiên sử dụng **Lucide Icons** hoặc **Ant Design Icons** — nhất quán toàn hệ thống.

### 14.2 Kích thước

```
16px — Icon trong button, trong cell bảng, inline text
20px — Icon trong menu sidebar
24px — Icon trạng thái trong empty state
32px+ — Icon minh họa lớn
```

### 14.3 Icon chuẩn hóa theo chức năng

| Chức năng | Icon |
|---|---|
| Thêm mới | `plus`, `plus-circle` |
| Sửa / Chỉnh sửa | `pencil`, `edit` |
| Xóa | `trash-2` |
| Xem chi tiết | `eye` |
| Tìm kiếm | `search` |
| Lọc | `filter` |
| Xuất Excel | `file-down`, `download` |
| Nhập file | `file-up`, `upload` |
| In | `printer` |
| Làm mới | `refresh-cw` |
| Cài đặt | `settings` |
| Người dùng | `user` |
| Thông báo | `bell` |
| Đóng / Hủy | `x` |
| Xác nhận | `check` |
| Cảnh báo | `alert-triangle` |
| Thông tin | `info` |
| Menu | `menu`, `more-horizontal` (•••) |
| Mũi tên | `chevron-right`, `chevron-down` |
| Calendar | `calendar` |
| Tiền tệ | `banknote`, `credit-card` |

---

## 15. States & Interactions

### 15.1 Hover Effects

```
Row table:     background #F5F5F5, transition 0.1s — KHÔNG animation phức tạp
Button:        màu tối hơn 10-15%, transition 0.15s
Menu item:     background tô nhẹ, transition 0.15s
Link/action:   underline xuất hiện
```

### 15.2 Keyboard Navigation

Đây là tính năng quan trọng — người dùng nhập liệu nhiều dùng bàn phím:

| Phím | Hành vi |
|---|---|
| `Tab` | Di chuyển sang field/cell tiếp theo |
| `Shift + Tab` | Di chuyển ngược |
| `Enter` | Confirm/Submit, hoặc xuống dòng mới trong table form |
| `Escape` | Hủy edit, đóng dropdown/modal |
| `F2` | Bắt đầu edit cell (quy ước Excel quen thuộc) |
| `Delete` | Xóa nội dung cell đang focus |
| `↑ ↓` | Di chuyển giữa các dòng bảng (khi không edit) |
| `Space` | Toggle checkbox |
| `Ctrl + S` | Lưu form |
| `Ctrl + Z` | Undo (nếu có) |

### 15.3 Scroll Behavior

- **Horizontal scroll bảng:** Không giấu scrollbar — người dùng cần biết có thêm cột
- **Vertical scroll body bảng:** Hiện scrollbar khi hover vào vùng bảng
- **Sticky header:** Luôn hiển thị khi scroll dọc
- **Back to top:** Không cần cho admin — layout không scroll trang

### 15.4 Drag & Drop (khi có)

- **Reorder rows:** Handle icon `⋮⋮` bên trái, cursor `grab`
- Visual cue rõ khi drag: shadow, placeholder line
- Animate về vị trí mới mượt mà

### 15.5 Right-click Context Menu

Người dùng VN quen right-click từ Excel/phần mềm desktop:

```
Khi right-click vào row bảng:
┌───────────────────┐
│ 👁 Xem chi tiết  │
│ ✏ Sửa            │
│ 📋 Nhân bản      │
├───────────────────┤
│ 🗑 Xóa           │
└───────────────────┘
```

---

## 16. Accessibility & Keyboard

### 16.1 Focus Visible

```css
/* Tất cả element tương tác phải có focus ring rõ */
*:focus-visible {
  outline: 2px solid #1677FF;
  outline-offset: 2px;
}
```

### 16.2 Color Contrast

- Text chính `#141414` trên nền trắng: ratio 18.5:1 ✓
- Text phụ `#595959` trên nền trắng: ratio 7:1 ✓
- Text trắng trên Primary `#1677FF`: ratio 4.5:1 ✓
- Không truyền tải thông tin chỉ bằng màu sắc — luôn kèm icon hoặc text

### 16.3 Touch Targets

- Minimum tap target: 32×32px dù element nhỏ hơn (padding tăng)
- Khoảng cách giữa các target: tối thiểu 4px

### 16.4 Loading & Error

- Thông báo loading cho screen reader: `aria-live="polite"`
- Error message link tới field: `aria-describedby`
- Form có `role="form"`, bảng có `role="grid"` khi editable

---

## Appendix: Checklist thiết kế trang mới

Trước khi hoàn thiện một trang, kiểm tra:

**Layout**
- [ ] Header cố định, không scroll theo content
- [ ] Table body scroll độc lập với trang
- [ ] Pagination cố định ở cuối, không bị đẩy xuống
- [ ] Responsive hoạt động đúng từ 1280px+

**Table**
- [ ] Cột thao tác sticky bên phải
- [ ] Cột quan trọng sticky bên trái (nếu nhiều cột)
- [ ] Empty state có hướng dẫn rõ
- [ ] Loading state dùng skeleton
- [ ] Khi chọn dòng → bulk action bar xuất hiện

**Form**
- [ ] Validation tiếng Việt, thông báo đủ nghĩa
- [ ] Tab order đúng logic (trái → phải, trên → dưới)
- [ ] Disabled field có visual khác biệt rõ
- [ ] Required fields đánh dấu `*`

**Actions**
- [ ] Mỗi trang chỉ có một Primary Button
- [ ] Action nguy hiểm có confirm dialog
- [ ] Button loading state khi submit
- [ ] Thành công/thất bại đều có toast feedback

**Tổng quát**
- [ ] Màu sắc nhất quán với color system
- [ ] Icon dùng đúng bộ, đúng chức năng
- [ ] Font size không nhỏ hơn 12px
- [ ] Không có chuỗi hardcode — dùng label/text đã định nghĩa
