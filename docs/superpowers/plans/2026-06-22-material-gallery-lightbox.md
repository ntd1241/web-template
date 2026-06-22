# Material Gallery Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable swipeable material gallery with modal zoom and fullscreen viewing.

**Architecture:** Use `yet-another-react-lightbox` twice inside `MaterialGalleryCard`: an `Inline`
instance owns swipe/drag navigation in the card, and a modal instance uses `Zoom` and `Fullscreen`.
Both instances, dots, and thumbnails share one controlled active index.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, yet-another-react-lightbox

---

### Task 1: Install the gallery package

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the production dependency**

Run: `npm install yet-another-react-lightbox`

Expected: npm adds the package to `dependencies` and updates the lockfile without peer dependency
errors.

- [ ] **Step 2: Inspect the installed public types**

Run: `rg -n "interface.*Inline|type.*Lightbox|click:|view:" node_modules/yet-another-react-lightbox`

Expected: confirm the `Inline`, `Zoom`, `Fullscreen`, controlled `index`, `on.view`, and slide render
APIs used below exist in the installed version.

### Task 2: Specify gallery interaction behavior

**Files:**

- Create: `src/examples/material/public-detail/components/material-gallery-card.test.tsx`
- Modify: `src/examples/material/public-detail/components/material-gallery-card.tsx`

- [ ] **Step 1: Write the failing component tests**

Create tests that render `MaterialGalleryCard` and assert:

```tsx
it('đồng bộ thumbnail với ảnh đang hiển thị', async () => {
  const user = userEvent.setup();
  render(<MaterialGalleryCard />);

  await user.click(
    screen.getByRole('button', { name: 'Xem ảnh Bình chữa cháy CO₂ MT5 5kg' }),
  );

  expect(screen.getByText('2/2')).toBeInTheDocument();
});

it('mở lightbox từ ảnh đang hiển thị', async () => {
  const user = userEvent.setup();
  const { container } = render(<MaterialGalleryCard />);

  await user.click(
    screen.getByRole('button', { name: 'Mở ảnh Bình chữa cháy bột và CO₂' }),
  );

  expect(
    container.ownerDocument.querySelector('.yarl__portal'),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify RED**

Run: `npm run test:run -- src/examples/material/public-detail/components/material-gallery-card.test.tsx`

Expected: FAIL because the inline lightbox and accessible open-image control do not exist.

- [ ] **Step 3: Replace the static preview with controlled lightboxes**

In `material-gallery-card.tsx`:

```tsx
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

const slides = materialGalleryItems.map((item) => ({
  src: item.url,
  alt: item.label,
}));
```

Add `lightboxOpen` state. Render an inline instance with `plugins={[Inline]}`, controlled `index`,
`on.view` index synchronization, finite carousel, zero padding, and a custom slide button labelled
`Mở ảnh <alt>` that preserves `object-contain` on black. Render a second modal instance with
`plugins={[Zoom, Fullscreen]}`, the same controlled index, and `open`/`close` state. Keep dots,
thumbnails, caption, and counter bound to `activeIndex`.

- [ ] **Step 4: Run the component tests to verify GREEN**

Run: `npm run test:run -- src/examples/material/public-detail/components/material-gallery-card.test.tsx`

Expected: 2 tests pass.

### Task 3: Verify responsive gestures and production integration

**Files:**

- Modify only if verification exposes a defect: `src/examples/material/public-detail/components/material-gallery-card.tsx`

- [ ] **Step 1: Run focused feature tests**

Run: `npm run test:run -- src/examples/material/public-detail/components/material-gallery-card.test.tsx src/examples/material/public-detail/data/material-public-detail.mock.test.ts src/examples/material/public-detail/tabs/common/index.test.tsx`

Expected: all tests pass.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: TypeScript and Vite build exit 0.

- [ ] **Step 3: Verify the mobile interaction in browser**

Open `/example/materials/public/test` at 390×844 and verify:

- dragging/swiping the inline image changes `1/2` to `2/2`;
- tapping the image opens the modal at the current slide;
- zoom and fullscreen controls are present;
- closing the modal returns to the same active slide;
- the gallery creates no horizontal page overflow.
