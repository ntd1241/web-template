---
name: use-builder
description: Trước khi implement page, table, form, dialog hoặc bề mặt UI lặp lại, kiểm tra builder registry và chạy builder phù hợp thay vì viết tay output do builder sở hữu.
---

# Use Builder

Một gate chung cho mọi builder hiện tại và tương lai.

## Quy trình

1. Đọc `docs/workflows/implement-ui.md` và code feature liên quan.
2. Đọc registry trong `src/builders/README.md`.
3. Với mỗi bề mặt khớp, chỉ đọc guide được link ở registry, viết spec và chạy lệnh `npm run gen:*`.
4. Sở hữu output: điền stub, wire logic và verify.
5. Nếu không có builder phù hợp, compose `src/components/ui` theo `docs/06-component-usage-guide.md`.
   Chỉ đọc `docs/builders/authoring.md` khi bề mặt thật sự lặp lại.

## Không làm

- Không viết tay output builder lo được hoặc giả provenance generated.
- Cấu trúc/config generated thuộc spec; đổi spec rồi generate.
- Không regenerate đè file đã custom; generate ra scratch path rồi reconcile.
- Không tạo skill riêng cho từng builder.
- Không vá per-page phần thuộc shared component/token.

## Kiểm tra

- Chạy focused tests và builder-consistency tests khi liên quan.
- Chạy `npm run build` trước khi hoàn tất.
- Chỉ browser-check khi còn rủi ro visual/interaction.
