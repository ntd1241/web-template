# Material Gallery Lightbox Design

## Goal

Upgrade the public material gallery into a reusable image viewer that supports touch swipe, mouse drag,
zoom, fullscreen, and future gallery extensions without maintaining custom gesture logic.

## Package

Use `yet-another-react-lightbox` with its official `Inline`, `Zoom`, and `Fullscreen` plugins. The
inline instance replaces the current static preview and handles swipe navigation inside the card. A
second modal instance opens when the user taps the active image and provides zoom and browser
fullscreen controls.

## Interaction

- Swipe or drag the inline preview to change the active image.
- Keep the existing dots and thumbnails; selecting either updates the inline carousel.
- Keep the active index synchronized between inline carousel, dots, thumbnails, and modal lightbox.
- Tapping the active preview opens the modal at that image.
- The modal supports swipe, keyboard navigation, zoom, pan, and fullscreen.
- Images retain `object-contain` behavior on a black background.

## Component Boundaries

`MaterialGalleryCard` owns the active index and modal open state. Gallery data remains in
`material-public-detail.mock.ts`. Package styles are imported alongside the gallery component so the
feature remains self-contained.

## Error And Accessibility Behavior

The existing image alt labels remain the accessible names. Native lightbox controls provide keyboard
navigation and close behavior. A failed remote image uses the package's normal loading/error state;
no custom retry UI is added in this iteration.

## Verification

- Component tests cover swipe/index synchronization, thumbnail selection, and opening the modal at
  the current image.
- A focused mobile browser check verifies touch-style navigation, modal opening, zoom controls, and
  absence of layout overflow.
- Run the production build after implementation.
