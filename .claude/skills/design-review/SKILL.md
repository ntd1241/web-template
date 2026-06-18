---
name: design-review
description: 'Soát một thay đổi UI đã chạy được về ĐỘ NHẤT QUÁN với design system trước khi gọi "xong" — chạy checklist executable (token thay hex, nền field nhất quán, focus ring trên MỌI control, nhịp spacing, dialog scroll, đủ state loading/empty/error, responsive 1366/1920, copy tiếng Việt) rồi verify bằng browser. Dùng khi user nói "review design / review UI / soát giao diện / kiểm tra UI / design review / soát nhất quán / check lại giao diện trước khi merge", hoặc khi vừa build/sửa xong một trang/dialog/component và cần cổng chặn drift trước khi done. Codex chạy như self-check trước khi báo cáo; Claude (giám sát) chạy như cổng review trước khi cho merge. KHÔNG phải để sinh UI mới từ đầu, và KHÔNG dùng cho pha bố cục (đó là block-layout).'
---

# Design Review (cổng nhất quán design system)

## Tại sao tồn tại

Repo này có design system opinionated mạnh (tokens `--admin-*` trong `src/styles/globals.css`,
primitive ở `src/components/ui/*`, hướng dẫn ở `docs/02` + `docs/06` + `docs/components/*`). Bug UI
ở đây gần như **không bao giờ** là "không biết làm đẹp" — mà là **drift**: agent (Codex hoặc Claude)
không áp dụng nhất quán, và không có bước chặn trước khi "done". Skill này biến `docs/06 §3` từ prose
thành một **checklist executable + verify browser**, nhắm thẳng các lớp lỗi hay lặp.

Đây là pha **cuối** (polish/QA). Pha **đầu** (bố cục/greybox) là [`block-layout`](../block-layout/SKILL.md).
Không trùng nhau.

## Khi nào dùng

- Sau khi một thay đổi UI đã **chạy được về mặt chức năng**, ngay TRƯỚC khi nói "xong" / mở PR / merge.
- **Codex (implementer)**: tự chạy như self-check trước khi viết báo cáo → bớt vòng sửa qua lại.
- **Claude (giám sát)**: chạy như cổng review; bug = **BLOCKER** chặn merge, nit = ghi 1 dòng.
- Bỏ qua cho thay đổi không quan sát được trên browser (logic thuần, tooling, types).

## Nguyên tắc xuyên suốt: sửa ở GỐC, không vá ở page

Mọi finding phải fix ở **đúng tầng**: default component / CVA / token — KHÔNG copy class thô vào page.
Nếu một look chung phải lặp ở nhiều page → đó là dấu hiệu phải sửa `src/components/ui/*` hoặc
`globals.css`, không phải vá per-page (xem `docs/06 §0.1`). Một finding "đã fix" mà chỉ vá 1 page
trong khi gốc vẫn sai = chưa đạt.

## Checklist (chạy theo thứ tự; mỗi mục: kiểm tra → bằng chứng → hướng fix)

### A. Token & primitive (tĩnh — rg/đọc code)
- [ ] **Không hex mới**: `rg -n "#[0-9a-fA-F]{3,6}|bg-\[#|text-\[#" <files>` → rỗng (trừ gradient trang trí có chủ đích). Dùng token semantic (`bg-card`, `bg-muted`, `bg-field`, `border-border`, `text-foreground`, `text-muted-foreground`) hoặc `admin-*` (palette-only: status color / radii / dims).
- [ ] **Không primitive thô trong page**: `rg -n "<button|<input|<table|<thead|<tbody|<tr|<td|<th" <page>` → rỗng (file picker ẩn / chip-close có lý do thì ghi chú). `div`/`span` layout thì OK.
- [ ] **Base component chỉ ở `src/components/ui/`** — feature không tự dựng lại Button/Input/Table.
- [ ] Named export; `cn()` cho class điều kiện; no `any`; `import type` cho type; file < ~400 dòng.

### B. Field nhất quán (lỗi hay gặp #1 — verify browser)
- [ ] **Nền field đồng nhất**: mọi control nhập liệu (Input, Textarea, Select trigger, date input, combobox, nút dạng "input") cùng nền `bg-field` (xám nhẹ), trắng khi focus/mở. KHÔNG có ô nền trắng lẻ loi (vd Button `mode="input"` dùng làm date trigger có nền trắng → lệch).
  - Verify: `preview_inspect` từng control, so `backgroundColor`.
- [ ] **Focus ring trên MỌI control tương tác**, không chỉ input text. Select trigger, date field, combobox, button-as-trigger đều phải có ring khi focus (tham chiếu ring trong `inputVariants`). Tab qua từng field để soi.
  - Verify: `preview_eval` focus từng phần tử rồi `preview_inspect` xem `boxShadow`/`outline`.

### C. Nhịp spacing & cấu trúc (verify browser)
- [ ] Khoảng cách label↔field và giữa các field theo cùng scale (vd form dùng `space-y-5`); không có cụm bị khít bất thường (vd label section sát nhóm checkbox).
- [ ] **Dialog/scroll**: nếu có overflow, **chỉ body cuộn**, header + footer cố định. Mở ở chiều cao nhỏ (≈700px) để chắc chắn cuộn được bằng chuột, không kẹt.
  - Verify: `preview_resize` height 700 & 900; kiểm tra viewport `scrollHeight > clientHeight` và header/footer không trôi.

### D. Đủ state (đọc code + browser)
- [ ] **Loading / empty / error** đều có và đúng: loading indicator chuẩn (spinner), empty/error tiếng Việt, nút trong lúc xử lý thì disabled + đổi sang trạng thái loading (dùng prop `loading` của Button, không if/else thủ công).
- [ ] Danh sách phân trang dùng `DataGrid` + `useReactTable` (không `<table>` thô); cột qua factory khi có.

### E. Ngôn ngữ & a11y
- [ ] Copy tiếng Việt cho label / placeholder / empty / confirm / validation. Không truyền prop text chỉ để "dịch" — default component phải đã tiếng Việt (`docs/06 §0.2`).
- [ ] Nút icon có `aria-label`.

### F. Responsive & gate cuối
- [ ] Kiểm tra ở **1366px và 1920px** (và mobile nếu liên quan) — không vỡ layout, không tràn ngang.
- [ ] `npm run build` exit 0 **và** `npm run test:run` xanh.

## Quy trình verify browser (bắt buộc cho mục B/C/F)

Dùng bộ `preview_*` (không dùng Bash/Chrome cho việc này):
1. `preview_start` nếu chưa có server.
2. Điều hướng tới màn cần soát (vd `/example/employees` → mở dialog).
3. `preview_inspect` để lấy giá trị thật (màu nền, ring, padding) — chính xác hơn ảnh.
4. `preview_eval` để focus/scroll/tab khi cần soi ring & scroll.
5. `preview_resize` 1366 / 1920 / 700-height.
6. `preview_screenshot` chỉ để minh hoạ kết quả cho user (lưu ý: screenshot có thể treo khi modal Radix mở — ưu tiên `preview_inspect`/`preview_eval` lấy số liệu).

## Định dạng báo cáo

Theo Output discipline (terse, recommendation-first):
- **Verdict** 1 dòng: PASS / có BLOCKER.
- Bảng finding: `mức (BLOCKER/nit) | mục checklist | file:line | hướng fix ở GỐC`.
- BLOCKER: giải thích + fix cụ thể. Nit: 1 dòng. Mục pass: gộp 1 dòng ("còn lại đạt").
- Nếu là Codex self-check: liệt kê đã tự fix gì, còn nghi ngờ gì.

## Không làm

- Không sinh UI mới / "làm cho đẹp hơn" theo gu cá nhân — chỉ soát **nhất quán với hệ thống có sẵn**.
- Không vá per-page để qua checklist (vi phạm nguyên tắc gốc ở trên).
- Không dùng cho pha bố cục — đó là `block-layout`.
