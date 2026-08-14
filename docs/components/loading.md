# Loading states

Use the shared loading components instead of adding a one-off spinner or loading text in a feature.

## CardLoading

Use inside `CardContent` when a card-sized content area is waiting for data. It uses a large rotating
dot-circle indicator and reserves a bordered content area so the surrounding card chrome stays stable.

```tsx
<CardContent>
  {query.isPending ? (
    <CardLoading label="Đang tải thông tin tổ chức..." />
  ) : (
    <Form />
  )}
</CardContent>
```

## SectionLoading

Use for a smaller section or dialog body. It keeps the compact three-dot indicator that is useful when
the surrounding component already provides most of the visual context. The dots use a staggered sync
motion with the same 0.6-second rhythm as the reference loader.

```tsx
<DialogBody>
  {query.isPending ? (
    <SectionLoading label="Đang tải chi tiết..." />
  ) : (
    <DialogContent />
  )}
</DialogBody>
```

## PageLoading

Use when the page's main content cannot render until its initial data is ready. It displays the project
logo as a borderless square loader that flips horizontally, then vertically, matching the app favicon.

```tsx
return query.isPending ? (
  <PageLoading label="Đang tải dữ liệu..." />
) : (
  <PageContent />
);
```

Both components expose `role="status"`, announce updates politely, and accept `className` plus normal
`div` attributes for layout composition.

`LogoSquareLoader` is also exported for full-screen suspense fallbacks or other shared loading surfaces.
