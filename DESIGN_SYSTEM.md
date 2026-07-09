# CineVault: Design System Specification

Welcome to the official Design System Specification for **CineVault**—a premium, entertainment tracking platform for movies, TV shows, anime, web series, documentaries, cartoons, and K-dramas. This document acts as the definitive design reference for the platform's visual identity, component parameters, and architectural aesthetics.

---

## 1. Brand Identity & Personality

CineVault is positioned as a **premium digital vault for cinephiles and entertainment enthusiasts**. Unlike general trackers, CineVault is an archive, a sanctuary, and a journal for the content users consume.

### Personality Pillars
*   **The Collector’s Vault**: The experience should feel like stepping into a private gallery or archive. It feels permanent, organized, and valuable.
*   **Atmospheric & Immersive**: The interface recedes into the background to allow cinematic artwork to shine. Contrast is intentional, drawing focus to posters, backdrops, and video assets.
*   **Sleek & Precision-engineered**: Interfaces are crisp and clean. Controls are high-fidelity, transitions are buttery-smooth, and layouts feel balanced and intentional.
*   **Curation-Centric**: Strong emphasis on typography and metadata layouts. Content categorization (e.g. distinguishing an anime from a documentary) is visually clean and elegant.

---

## 2. Design Philosophy

To deliver on this visual identity, the interface adheres to these core tenets:

1.  **Premium**: High-fidelity micro-interactions, subtle glassmorphism, gradient accents, and curated palettes that feel sophisticated.
2.  **Minimal**: Content is king. Unnecessary borders, boxes, and visual clutter are removed. Whitespace is used as a deliberate separator.
3.  **Modern**: Employs clean geometric typography, soft curves, and responsive card layouts inspired by modern SaaS platforms.
4.  **Elegant**: Uses subtle shifts in contrast and soft overlays rather than harsh outlines to partition sections.
5.  **Fast**: Design choices encourage high-performance perception. Skeletons occupy exact dimensions to prevent layout shifts; animations use swift durations (under 300ms) to feel highly responsive.
6.  **Entertainment-focused**: Adapts visually to showcase cinematic imagery. Layouts are designed specifically to accommodate vertical poster artwork and horizontal banner orientations.
7.  **Dark-First**: The default experience is optimized for low-light browsing (like a movie theater). The light theme is treated with equal care, using warm, paper-like tones instead of sterile stark whites.
8.  **Accessible**: Clear color contrast, distinct focus states, logical keyboard navigation tabs, and appropriate screen-reader descriptors throughout.
9.  **Responsive**: Content flows gracefully from a 320px mobile screen to 2160px ultra-wide home theater displays.

---

## 3. Color System

CineVault's color system is crafted around a premium **deep amethyst and vibrant rose** color identity. It utilizes HSL spaces to allow for programmatic opacity styling.

### 3.1 Accent & Brand Identity
*   **Primary (CineVault Violet)**: A rich, royal violet representing high-quality curation.
*   **Accent (Rose Amaranthe)**: A vibrant, warm crimson-rose indicating tracking states, user favorites, and highlight actions.
*   **Secondary (Steel Slate)**: A calm slate grey for utility elements, secondary buttons, and less prominent text labels.

### 3.2 Dark Theme (Default)
The dark palette is modeled after dark cinematic theaters: deep carbon backgrounds with cool obsidian surfaces.

| Token | HSL / HEX | Description | Rationale |
| :--- | :--- | :--- | :--- |
| **Primary** | `hsl(262, 83%, 58%)` / `#7C3AED` | Amethyst Violet | Brand signature actions, key callouts |
| **Primary Hover** | `hsl(262, 80%, 50%)` / `#6D28D9` | Darker Violet | Hover state for primary buttons |
| **Secondary** | `hsl(215, 16%, 47%)` / `#64748B` | Muted Steel Slate | Secondary actions, inactive tab fills |
| **Accent** | `hsl(340, 82%, 52%)` / `#EC4899` | Rose Amaranthe | Favorite flags, active status indicators |
| **Background** | `hsl(224, 71%, 4%)` / `#02040A` | Midnight Ink | Main page background (reduces eye strain) |
| **Surface** | `hsl(222, 47%, 7%)` / `#0A0F1D` | Obsidian Surface | Navigation bars, cards, modals |
| **Surface Hover** | `hsl(222, 40%, 11%)` / `#111827` | Lightened Surface | Hover state for interactive items |
| **Card** | `hsl(222, 47%, 7%)` / `#0A0F1D` | Poster Containers | Container color for content cards |
| **Card Hover** | `hsl(222, 40%, 11%)` / `#111827` | Elevated Card | Visual lift for hovered media cards |
| **Border** | `hsl(217, 19%, 17%)` / `#1F2937` | Charcoal Grey | Structural outlines and card borders |
| **Divider** | `hsl(217, 19%, 13%)` / `#1E293B` | Thin Slate | Sub-section partitioning lines |
| **Success** | `hsl(142, 70%, 45%)` / `#10B981` | Emerald Green | Completed, watched, active sync states |
| **Warning** | `hsl(37, 90%, 50%)` / `#F59E0B` | Amber Orange | On-hold status, rating scores |
| **Error** | `hsl(346, 84%, 50%)` / `#EF4444` | Crimson Red | Failed action, deleted, network timeout |
| **Info** | `hsl(200, 95%, 45%)` / `#0EA5E9` | Azure Blue | Plan-to-watch tags, notification banners |
| **Muted** | `hsl(215, 13%, 65%)` / `#94A3B8` | Grey Slate | Secondary metadata (runtime, genres, years) |
| **Disabled** | `hsl(222, 10%, 20%)` / `#1F2937` | Dull Charcoal | Inactive inputs, unavailable page controls |
| **Skeleton** | `hsl(222, 30%, 12%)` / `#151F32` | Dark Slate Glow | Placeholder shimmer base for load times |
| **Focus Ring** | `hsl(262, 83%, 58%)` / `#7C3AED` | Amethyst Glow | Accessible keyboard focus outline |

---

### 3.3 Light Theme
The light palette uses paper-like tones instead of pure whites, maintaining an elegant, premium look that mimics high-end editorial archives.

| Token | HSL / HEX | Description | Rationale |
| :--- | :--- | :--- | :--- |
| **Primary** | `hsl(262, 83%, 58%)` / `#7C3AED` | Amethyst Violet | Brand signature actions, key callouts |
| **Primary Hover** | `hsl(262, 85%, 65%)` / `#8B5CF6` | Lighter Violet | Hover state for primary buttons |
| **Secondary** | `hsl(215, 16%, 47%)` / `#64748B` | Muted Steel Slate | Secondary actions, inactive tab fills |
| **Accent** | `hsl(340, 82%, 52%)` / `#EC4899` | Rose Amaranthe | Favorite flags, active status indicators |
| **Background** | `hsl(210, 20%, 98%)` / `#F8FAFC` | Alabaster Snow | Main page background |
| **Surface** | `hsl(0, 0%, 100%)` / `#FFFFFF` | Pure White Surface | Navigation bars, cards, modals |
| **Surface Hover** | `hsl(210, 20%, 96%)` / `#F1F5F9` | Lightened Surface | Hover state for interactive items |
| **Card** | `hsl(0, 0%, 100%)` / `#FFFFFF` | Poster Containers | Container color for content cards |
| **Card Hover** | `hsl(210, 20%, 96%)` / `#F1F5F9` | Elevated Card | Visual lift for hovered media cards |
| **Border** | `hsl(214, 32%, 91%)` / `#E2E8F0` | Light Grey Slate | Structural outlines and card borders |
| **Divider** | `hsl(214, 32%, 95%)` / `#F1F5F9` | Thin Slate | Sub-section partitioning lines |
| **Success** | `hsl(142, 70%, 40%)` / `#059669` | Forest Green | Completed, watched, active sync states |
| **Warning** | `hsl(37, 90%, 45%)` / `#D97706` | Amber Orange | On-hold status, rating scores |
| **Error** | `hsl(346, 84%, 45%)` / `#DC2626` | Crimson Red | Failed action, deleted, network timeout |
| **Info** | `hsl(200, 95%, 40%)` / `#0284C7` | Azure Blue | Plan-to-watch tags, notification banners |
| **Muted** | `hsl(215, 16%, 47%)` / `#64748B` | Grey Slate | Secondary metadata (runtime, genres, years) |
| **Disabled** | `hsl(210, 20%, 90%)` / `#E2E8F0` | Light Grey | Inactive inputs, unavailable page controls |
| **Skeleton** | `hsl(210, 20%, 93%)` / `#E2E8F0` | Light Slate Glow | Placeholder shimmer base for load times |
| **Focus Ring** | `hsl(262, 83%, 58%)` / `#7C3AED` | Amethyst Glow | Accessible keyboard focus outline |

---

## 4. Typography

CineVault uses a modern, geometric font scale that prioritizes screen legibility and content-first metadata hierarchy.

### Font Families
*   **Heading Font**: *Outfit* or *Plus Jakarta Sans* (Slightly wider, geometric letterforms that give a clean, premium tech look).
*   **Body Font**: *Inter* or *Geist Sans* (Neutral, highly readable at small text sizes, optimized for tracking densities).
*   **Monospace Font**: *JetBrains Mono* or *Geist Mono* (Used for code blocks, rating numbers, durations, and system details).

### Type Hierarchy
| Level | Font Family | Size | Weight | Tracking (Letter Spacing) | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Heading | `48px` / `3rem` | 800 (Extra Bold) | `-0.03em` | `1.1` |
| **Heading 1** | Heading | `36px` / `2.25rem` | 700 (Bold) | `-0.02em` | `1.2` |
| **Heading 2** | Heading | `30px` / `1.875rem` | 700 (Bold) | `-0.02em` | `1.25` |
| **Heading 3** | Heading | `24px` / `1.5rem` | 600 (Semi-Bold) | `-0.015em` | `1.3` |
| **Heading 4** | Heading | `20px` / `1.25rem` | 600 (Semi-Bold) | `-0.01em` | `1.4` |
| **Body Large** | Body | `18px` / `1.125rem` | 400 (Regular) | `0` | `1.6` |
| **Body** | Body | `16px` / `1rem` | 400 (Regular) | `0` | `1.6` |
| **Caption** | Body | `14px` / `0.875rem` | 500 (Medium) | `0.01em` | `1.5` |
| **Overline** | Body | `12px` / `0.75rem` | 700 (Bold) | `0.1em` (Uppercase) | `1.4` |
| **Button** | Heading | `14px` / `0.875rem` | 600 (Semi-Bold) | `0.02em` | `1` |
| **Code Font** | Monospace | `14px` / `0.875rem` | 400 (Regular) | `0` | `1.5` |

---

## 5. Spacing System

CineVault adheres strictly to an **8-point linear spacing system**. Odd spacing values are prohibited except for half-grid offsets (like 4px) for tight metadata layouts.

| Name | Rem Equivalent | Pixels | Application |
| :--- | :--- | :--- | :--- |
| **space-1** | `0.25rem` | 4px | Poster badges padding, micro-spacing between status pills |
| **space-2** | `0.5rem` | 8px | Button padding, gaps between tag labels, card item gaps |
| **space-3** | `0.75rem` | 12px | Dropdown items padding, inline card layouts gap |
| **space-4** | `1rem` | 16px | Card content padding, list item layouts, mobile outer padding |
| **space-5** | `1.25rem` | 20px | Grid gap between posters, toolbar action item clusters |
| **space-6** | `1.5rem` | 24px | Desktop outer grid padding, modal header-to-content gap |
| **space-8** | `2rem` | 32px | Dialog margins, page section headers gap |
| **space-10** | `2.5rem` | 40px | Inner spacing of full screen dashboard elements |
| **space-12** | `3rem` | 48px | Outer margins of profile detail sections, hero image gutters |
| **space-16** | `4rem` | 64px | Vertical spacing between main layout sections |
| **space-20** | `5rem` | 80px | Giant splash screen layouts, login/logout banner blocks |
| **space-24** | `6rem` | 96px | Extreme decorative layout spacing |

---

## 6. Border Radius

Radii values define the roundness and premium feel of components. Higher elevation blocks have larger curves to suggest containing surfaces.

*   **Buttons**: `8px (0.5rem)` — Slightly rounded, providing a modern, crisp action aesthetic.
*   **Inputs**: `8px (0.5rem)` — Matches buttons, maintaining design consistency across forms.
*   **Badges/Tags**: `9999px (pill)` — Full circular caps for statuses, category tags, and counters.
*   **Media Cards**: `12px (0.75rem)` — Soft curves that look pleasant and premium for vertical movie poster containers.
*   **Dialogs / Modals / Drawers**: `16px (1rem)` — Heavy, containing panels that overlay the main canvas.
*   **Images**: `12px (0.75rem)` — Matches media card curves, preventing image edges from clipping outside the boundaries.

---

## 7. Shadow & Elevation System

Shadows visually signal vertical elevation (z-index) to guide cognitive hierarchy. Light sources always come from the top center.

*   **Flat (Level 0)**: Inset elements, borders only. Background canvas, inputs, and layout boundaries.
*   **Low (Level 1)**: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)` — Media cards, filter toolbars.
*   **Medium (Level 2)**: `0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.08)` — Navigation bars, active dropdown menus, context triggers.
*   **High (Level 3)**: `0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)` — Hover states of cards, notifications.
*   **Overlay (Level 4)**: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)` — Modals, popovers, active overlays, toast notifications.

---

## 8. Animation & Motion System

Animations should never block user action. Motion should be functional, reinforcing context, layout transformations, and system speed.

### Motion Principles
1.  **Direct Response**: Elements trigger immediately on click/press.
2.  **Continuity**: Changes in state glide fluidly rather than snapping instantly.
3.  **Physical Weight**: Open/Close actions mimic real-world properties—springing, decelerating, and sliding.

### Duration Guidelines
*   **Instant / UI Response**: `100ms` (Micro-interactions, button hover shifts, checkboxes)
*   **Standard / Short Transition**: `200ms` (Dropdown expansion, tag closures, toast popups)
*   **Medium / Page & Modal Shift**: `300ms` (Drawer slide-ins, modal scale-ups, page route swipes)
*   **Long / Cinematic Sweep**: `500ms` (Hero carousels, detailed media page cover reveals)

### Easing Guidelines
*   **Ease-Out (Decelerate)**: `cubic-bezier(0.16, 1, 0.3, 1)` — Default ease for entry animations (e.g. modals opening).
*   **Ease-In (Accelerate)**: `cubic-bezier(0.7, 0, 0.84, 0)` — Exiting transitions (e.g. dialogs closing).
*   **Ease-In-Out (Smooth Curve)**: `cubic-bezier(0.87, 0, 0.13, 1)` — Running state shifts (e.g. switching tabs).

### Component Motion Specifications
*   **Hover**: Focus indicator scales up by `1.02x` with a low shadow elevation bump. Duration: `150ms` (Ease-out).
*   **Press**: Depresses by `0.98x` scale. Duration: `100ms` (Ease-out).
*   **Page Transitions**: Fade in with a tiny vertical translation of `8px` from bottom to top. Duration: `300ms` (Ease-out).
*   **Dialog Overlay**: Backdrop fades from 0% to 50% opacity. Dialog scales from `95%` to `100%` with a subtle translate. Duration: `250ms` (Ease-out).
*   **Drawer Slide**: Slides in from right to left or bottom to top. Duration: `300ms` (Ease-out).
*   **Toast Popup**: Enters with a spring-like bounce from the bottom-right corner. Duration: `250ms`.
*   **Skeleton Loader**: Loop-animates a horizontal gradient pulse from left to right. Duration: `1.5s` (Infinite loop, linear).

---

## 9. Iconography

CineVault leverages **Lucide Icons** exclusively for UI controls, navigation, and categorization to maintain clean line-weight consistency.

### Icon Design Principles
*   **Style**: Outline-only with a uniform stroke width of `2px` (standard) or `1.5px` (for display UI blocks).
*   **Sizing Scale**:
    *   `12px`: Metadata tags (e.g. Star, Clock next to duration, Film next to genre).
    *   `16px`: Inside small buttons, input icons (e.g. Search glass, Password eye).
    *   `20px`: Navigation items, toolbar controls, action buttons.
    *   `24px`: Section headers, panel entry close symbols.
    *   `32px`: Empty states, error splash indicators.
*   **Spacing**: Icons must be padded from adjacent text by at least `8px` (space-2).

---

## 10. Component Standards

To maintain design continuity, any built component must comply with these layout and spacing properties:

### 10.1 Buttons
*   **Heights**: Small (`32px`), Medium (`40px` - default), Large (`48px`).
*   **Layout**: Horizontal flexbox, center aligned. Icons sit on the left (except caret arrows).
*   **States**:
    *   *Primary*: Solid background (`primary`), white/white-equivalent text.
    *   *Secondary*: Ghost background with border or soft surface backplate.
    *   *Destructive*: Soft red surface background, dark red text (light theme) or bright red text (dark theme).

### 10.2 Cards
*   **Aspect Ratio**: Content posters use `2:3` vertical ratio. Wide banners use `16:9` ratio.
*   **Design**: Borders are restricted to `1px` thickness. Image overlays use a bottom-up black linear gradient block to guarantee white metadata text readability.

### 10.3 Inputs & Search Bars
*   **Structure**: Height `40px`, border `1px`, background `surface` or inset.
*   **Search**: Prefixing magnifying glass on the left, "Clear" button (close icon) on the right when dirty.

### 10.4 Dropdowns & Modals
*   **Structure**: Overlay elevation level 4, blur backdrop filters (`backdrop-blur-md`).
*   **Actions**: Destructive menu actions (like "Delete Watchlist") are grouped at the bottom, colored in red.

### 10.5 Badges & Tags
*   **Types**:
    *   *Status Pills*: Watched (Green), Planning (Blue), In Progress (Yellow), Dropped (Red).
    *   *Generic Tags*: Genres, release formats, rating labels (solid gray surface with small text).

### 10.6 Toasts
*   **Format**: Compact rectangular alert. Maximum 2 lines of text. Icon indicating status (success, warning, error, info). Includes a mini-dismiss button.

### 10.7 Skeleton Loaders
*   **Structure**: Block elements with gray backgrounds matching exact shapes of future content (avatars are round, posters are 2:3, text blocks are thin rectangles).

---

## 11. Responsive Design & Breakpoints

CineVault is built on a responsive mobile-first grid. Layout grids shift columns as screens grow.

| Breakpoint | Prefix | Width Threshold | Column Layout (Media Grid) |
| :--- | :--- | :--- | :--- |
| **Mobile** | `sm` | `640px` | 2 Columns |
| **Tablet** | `md` | `768px` | 3 Columns |
| **Laptop** | `lg` | `1024px` | 4 Columns |
| **Desktop** | `xl` | `1280px` | 5 Columns |
| **Ultra Wide** | `2xl` | `1536px` | 6 Columns |

---

## 12. Accessibility Standards (A11y)

A premium app is accessible to all. CineVault aims for **WCAG 2.1 Level AA compliance**.

*   **Contrast**: Text contrast must exceed `4.5:1` for regular text and `3:1` for large headers against backgrounds.
*   **Keyboard Navigation**:
    *   Interactive items are focusable (`tabindex="0"`).
    *   Modals trap focus inside them. Focus returns to the opening trigger button when closed.
*   **Focus States**: Clearly visible border highlights (`hsl(262, 83%, 58%)` glow) must appear when items are tabbed to.
*   **Touch Targets**: Mobile buttons and clickable zones must be at least `44px x 44px`.
*   **ARIA Descriptors**: Image cards use descriptive alt labels (e.g. "Poster for Interstellar"). Status tags contain labels (e.g. `aria-label="Status: Watched"`).
