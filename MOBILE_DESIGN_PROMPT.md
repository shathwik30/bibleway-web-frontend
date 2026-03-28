# Bibleway — Mobile Design Prompt

Use the following prompt verbatim (or adapt it) when generating mobile UI mockups for each page of the Bibleway web app. This is a faith-based social platform — think of it as a premium, editorial-quality experience somewhere between a modern Bible app and a social network.

---

## Context to give the designer / AI design tool

> **App name:** Bibleway — "The Modern Sanctuary"
>
> **What it is:** A faith-based community platform. Users read the Bible, share posts and prayer requests, chat with each other, study scripture, shop for digital resources, and manage their faith profile. The aesthetic is premium, editorial, and spiritual — like a high-end magazine blended with a modern social app.
>
> **Color palette & fonts:** These are already locked in. Do NOT change them. Reference them exactly as specified in the design tokens below.
>
> **Target platform for these mockups:** Mobile web / PWA — portrait orientation, 390 × 844 px (iPhone 14 base size). Design as if this is a native-feeling mobile app running in a browser.
>
> **Existing mobile infrastructure already in code:**
> - A sticky top `Navbar` (logo + chat icon + search icon + notification bell + profile avatar)
> - A fixed bottom `BottomNav` with five tabs: Home, Bible, Study, Chat, Profile
> - No sidebar on mobile (it's desktop-only)
> - Tailwind CSS v4 with the design tokens below
> - Material Symbols Outlined for all icons
> - Fonts: **Playfair Display** (headings/display) + **Inter** (body/labels)
> - Animations already defined: `shimmer`, `pageIn`, `slideUp`, `slideDown`, `scaleIn`, `toastIn`

---

## Design tokens (locked — do not change)

```css
/* Primary — deep burgundy */
--color-primary: #59021a;
--color-primary-container: #781c2e;
--color-primary-fixed: #ffdadc;
--color-on-primary: #ffffff;

/* Secondary — steel blue */
--color-secondary: #4e5f7c;
--color-secondary-container: #c9dbfd;

/* Tertiary — warm amber/gold */
--color-tertiary: #372700;
--color-tertiary-fixed: #ffdf9e;
--color-on-tertiary-container: #cca652;

/* Surfaces */
--color-surface: #fcf9f8;           /* page background */
--color-surface-container: #f0edec;
--color-surface-container-low: #f6f3f2;
--color-surface-container-high: #ebe7e7;
--color-surface-container-lowest: #ffffff;
--color-on-surface: #1c1b1b;
--color-on-surface-variant: #564243;

/* Outline */
--color-outline: #897173;
--color-outline-variant: #dcc0c1;

/* Fonts */
--font-headline: "Playfair Display", serif;
--font-body: "Inter", sans-serif;

/* Shadow utility */
editorial-shadow: 0 20px 40px rgba(18,18,18,0.04);
```

---

## Global mobile shell (applies to ALL pages)

Design a persistent mobile shell that wraps every page:

**Top Navbar** — sticky, frosted glass (`background: rgba(252,249,248,0.8); backdrop-filter: blur(20px)`):
- Left: Bibleway logo (SVG/PNG, `h-8`)
- Right: row of icon buttons — `chat` icon, `search` icon (opens a full-screen search overlay), `notifications` bell with a red badge counter, circular profile photo avatar (32×32, `rounded-full`)
- No text nav links on mobile (those are desktop-only)
- Height: ~60px

**Bottom Navigation** — fixed, frosted glass, `rounded-t-2xl`, safe-area-aware bottom padding:
- Five tabs: Home (`home`), Bible (`menu_book`), Study (`school`), Chat (`chat`), Profile (`person`)
- Each tab: icon (24px Material Symbol) + uppercase 10px label below, `tracking-widest font-bold`
- Active tab: `bg-primary/10 text-primary rounded-xl`, filled icon variant (`fontVariationSettings: "'FILL' 1"`)
- Inactive: `text-stone-400`
- Height: ~72px + safe area inset

**Content area**: Between navbar and bottom nav, full-width, vertically scrollable, `bg-surface`.

---

## Page 1 — Home Feed (`/`)

**Layout:** Single-column scrollable feed, 16px horizontal padding.

**Hero / Verse of the Day card** (appears above the feed):
- Full-width card, `rounded-2xl`, with a scenic background image (one of: mountain, forest, ocean, aurora, desert — rotates by day of week)
- Dark overlay gradient (`linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55))`)
- White serif italic quote text (Playfair Display italic, ~18px, centered), with a white scripture reference beneath
- Left/right chevron arrow buttons to navigate to other dates' verses
- Bottom of card: small calendar date pill

**Post / Prayer tab bar** (sticky below hero):
- Two pills: "Posts" and "Prayers"
- Active pill: `bg-primary text-white`
- Inactive: `bg-surface-container text-on-surface-variant`

**Floating action button (FAB)**:
- `+` button, bottom-right, above the bottom nav
- `bg-primary text-white`, `rounded-full`, `w-14 h-14`, shadow
- Tapping opens the PostingModal sheet

**Feed cards** (one per post/prayer, `16px gap` between):

```
┌─────────────────────────────────┐
│ ○ Author Name      •  3 min ago │  ← avatar (40px circle) + name + time
│   Prayer / Post tag pill        │  ← small pill badge top-right
├─────────────────────────────────┤
│ Title (optional, Playfair 16px) │
│ Body text (Inter 14px, 4 lines  │
│ max before "Read more")         │
│ [Optional image, rounded-xl]    │
├─────────────────────────────────┤
│ 🙏 12   💬 4   ↗ Share   •••   │  ← action row, 44px tap targets
└─────────────────────────────────┘
```

- Reaction row: long-press / hold on the 🙏 button reveals a floating emoji picker strip with `🙏 ❤️ 🔥 🙌 ✝️`
- Comments section: slides down inline below the card
- Three-dot `•••` menu: "Report" option (and "Delete" if it's the user's own post)
- Card background: `bg-surface-container-lowest`, `rounded-2xl`, `editorial-shadow`, `p-4`

**Loading state:** Show 3 shimmer skeleton cards (same shape as feed cards, with animated gray gradient sweep).

**Error state:** Centered icon + message + "Try Again" button.

---

## Page 2 — Bible Reader (`/bible`)

**Two-tab layout** — "Standard" and "Study" (tab bar below the navbar):
- Tab bar: full-width, `border-b border-outline-variant/20`
- Active tab: `border-b-2 border-primary text-primary`

### Standard Reader sub-page

**Selection bar** (stacked vertically on mobile, `gap-2`):
1. Translation dropdown (e.g. "KJV — King James Version") — full width
2. Book dropdown (e.g. "John") — full width
3. Chapter selector — horizontally scrollable pill row (`rounded-full bg-surface-container` chips, active = `bg-primary text-white`)

**Reading area**:
- Verse-by-verse display, Inter 16px body, 1.8 line height
- Verse numbers: small, `text-primary`, superscript-style
- Generous vertical padding between verses
- Tap a verse to highlight it (shows a context menu: Bookmark / Highlight / Copy / Share)

**Navigation footer** (inside scroll area, at bottom):
- `← Previous Chapter` | `Next Chapter →` buttons, full-width pill style

### Study sub-page

**Section picker**: Horizontal scrollable chips (e.g. "Old Testament", "New Testament", thematic sections)

**Chapter list**: Card grid (`2 columns`) of chapter chips after selecting a section

**Study content area**:
- Rendered Markdown content (headings in Playfair Display, body in Inter 15px)
- Floating toolbar at bottom: Bookmark / Highlight / Add Note buttons

---

## Page 3 — Chat List (`/chat`)

**Header**: "Messages" in `font-headline text-3xl` + connection status dot (green/red) + label

**Search bar**: Full-width, `rounded-xl`, `bg-surface-container-lowest`, with a leading `search` icon

**Conversation list**: Scrollable list of conversation rows:

```
┌────────────────────────────────────────┐
│ ○  Grace (AI Assistant)   Demo ──── ›  │  ← avatar + name + badge
│    Try the chat feature!               │  ← preview text, truncated
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ ○  John Smith             2:34 PM ─ ›  │
│    "See you Sunday!"          [3]      │  ← unread badge (primary circle)
└────────────────────────────────────────┘
```

- Avatar: 48px circle, `bg-surface-container-high`, with photo or initials fallback
- Unread conversations: row background `bg-primary/5`, bold name, unread count badge `bg-primary text-white rounded-full`
- Row height: ~72px, `px-4 py-3`
- Divider: `border-b border-outline-variant/10` between rows
- "Grace" AI row: has a `smart_toy` icon avatar with `bg-primary/10 border-primary/20`, and a "Demo" pill badge

**Empty state**: Centered illustration placeholder + "No conversations yet" text + optional "Start a new chat" CTA button

---

## Page 4 — Chat Conversation (`/chat/[id]`)

**Full-screen chat interface** — no bottom nav on this page (replaced by message input bar):

**Top bar**: Back arrow (`arrow_back`) + avatar + name + connection status

**Messages area** (fills remaining screen height, scrollable):
- My messages: right-aligned, `bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2`
- Their messages: left-aligned, `bg-surface-container rounded-2xl rounded-bl-sm px-4 py-2`
- Timestamps between message clusters (small, centered, `text-on-surface-variant/50`)

**Input bar** (fixed at bottom, above keyboard):
- Full-width `rounded-full` text input with placeholder "Type a message..."
- Send button (`send` icon, `bg-primary text-white`, `rounded-full`, 44×44px)
- Respects keyboard safe area inset

---

## Page 5 — Demo Chat with Grace AI (`/chat/demo`)

Same layout as Chat Conversation but:
- Top bar shows "Grace — BibleWay Assistant" with robot `smart_toy` icon avatar
- Has a "Demo" badge in the header
- Welcome message from Grace is pre-filled
- Typing indicator animation (three bouncing dots) while Grace "thinks"

---

## Page 6 — Profile (`/profile`)

**Profile header section**:

```
┌─────────────────────────────────────┐
│         [Profile Photo 96px]        │
│         + edit overlay icon         │
│         Full Name (Playfair 22px)   │
│         @username · Bio text        │
│                                     │
│   [Posts: 24]  [Prayers: 8]         │
│                                     │
│   [Edit Profile]   [Settings]       │
└─────────────────────────────────────┘
```

- Profile photo: 96px circle, `border-4 border-primary-fixed`, centered
- Tapping photo shows camera icon overlay to upload new photo
- Stats row: two pill counters side by side
- Action buttons: "Edit Profile" (`bg-primary text-white`) and gear icon for Settings, side by side

**Edit Profile sheet** (bottom sheet modal):
- Slides up from bottom, `rounded-t-2xl`
- Fields: Full Name, Bio (textarea), Date of Birth, Country, Phone Number
- Each field: label + `rounded-xl` input, `border border-outline-variant/30`
- Save / Cancel buttons at bottom of sheet

**Posts / Prayers tab bar** (same pill style as Home feed)

**Content grid**: User's posts/prayers shown as compact card rows (same FeedCard layout but slightly smaller)

**Privacy settings** (expandable section at bottom):
- "Account Visibility" toggle (Public / Private)
- "Hide Followers List" toggle

---

## Page 7 — View Other User Profile (`/user/[id]`)

Same as Profile page but:
- No edit controls
- "Follow / Unfollow" button instead of "Edit Profile"
- "Message" button links to chat
- Follower/following counts visible
- Posts/prayers tabs show that user's public content

---

## Page 8 — Post Detail (`/post/[id]`)

**Back navigation**: Top bar with `arrow_back` + "Post" title

**Post body**:
- Author info row (avatar, name, date)
- Full post content (no truncation)
- Optional full-width image, `rounded-2xl`
- Reaction summary: emoji + count pills

**Reactions bar**: Full-width, horizontally scrollable emoji reaction options

**Comments section**:
- Comment rows: avatar + name + comment text + relative time + reply button
- Nested replies (indented 16px, with vertical connector line)
- Pinned "Add a comment" input bar at bottom of screen (above keyboard)

---

## Page 9 — Prayer Detail (`/prayer/[id]`)

Same structure as Post Detail, but:
- Header pill: "🙏 Prayer Request"
- Reaction options emphasize `praying_hands` and `amen`
- Comments are labeled "Responses" with a warmer, supportive tone implied by the empty state copy

---

## Page 10 — Shop (`/shop`)

**Hero banner**: Full-width card (`rounded-2xl`) with gradient background (`primary → primary-container`), white heading "The Sanctuary Shop", subtitle text, and a search bar below it

**Search bar**: Full-width, `rounded-xl`, with leading `search` icon, `bg-surface-container-lowest`

**Category filter chips**: Horizontally scrollable row of pill chips below the search (e.g. All, Books, Courses, Devotionals)

**Product grid**: 2-column grid, `gap-4`, `px-4`:

```
┌──────────────┐  ┌──────────────┐
│   [Image]    │  │   [Image]    │
│   Product    │  │   Product    │
│   Title      │  │   Title      │
│   $12.99     │  │   $12.99     │
│  [Buy Now]   │  │  [Buy Now]   │
└──────────────┘  └──────────────┘
```

- Card: `rounded-2xl bg-surface-container-lowest editorial-shadow`
- Image: `aspect-square rounded-xl object-cover` (top of card)
- Price: `text-primary font-bold`
- "Buy Now" button: `bg-primary text-white rounded-xl text-sm py-2`, full card width

**Loading skeleton**: Same 2-column grid with shimmer cards

---

## Page 11 — Product Detail (`/shop/product/[id]`)

**Back navigation**: `arrow_back` + product category breadcrumb

**Product hero**: Full-width image (`aspect-video` or `aspect-square`), `rounded-2xl`

**Product info** (below image):
- Title: Playfair Display 24px
- Price: large, `text-primary font-bold`
- Description: Inter 15px, expandable "Read more"
- Tags/category chip

**Sticky purchase footer** (fixed at bottom, above safe area):
- Left: price
- Right: "Purchase" button (`bg-primary text-white rounded-xl`, full-width on very small screens)

---

## Page 12 — Purchases (`/shop/purchases`)

**Header**: "My Purchases" + `shopping_bag` icon

**List of purchased items**:
- Row: thumbnail (48px `rounded-xl`) + title + purchase date + "Download / Access" button
- Empty state: illustration + "No purchases yet" + "Browse Shop" CTA

---

## Page 13 — Settings (`/settings`)

**Grouped settings list** — accordion-style expandable sections:

```
┌──────────────────────────────────────┐
│  🌐 Language                    ›    │
├──────────────────────────────────────┤
│  🔔 Notifications               ›    │
├──────────────────────────────────────┤
│  🔒 Privacy                     ›    │
├──────────────────────────────────────┤
│  🚫 Blocked Users               ›    │
├──────────────────────────────────────┤
│  👥 Follow Requests             ›    │
├──────────────────────────────────────┤
│  🛍️ Purchase History            ›    │
├──────────────────────────────────────┤
│  📖 Bible Bookmarks             ›    │
├──────────────────────────────────────┤
│  📝 Bible Notes                 ›    │
└──────────────────────────────────────┘
```

- Section row height: 56px, `px-4`, chevron on right
- Expanded section: slides open below the row, inset content `px-4 py-3`
- Language selector: list of radio-style language options (English, Español, Français, Hindi, Português, العربية, Kiswahili)
- Notifications: single toggle switch row
- Privacy: two toggle switches (Account Visibility + Hide Followers)
- Blocked Users / Follow Requests: avatar list rows with Unblock / Accept-Decline buttons
- Bookmarks / Notes: compact list rows with delete swipe action
- Logout button: full-width, `border border-error text-error rounded-xl`, at the bottom of the page

---

## Page 14 — Login (`/login`)

**Auth page layout** (no Navbar / BottomNav — standalone):

```
┌─────────────────────────────────────┐
│                                     │
│     [Bibleway Logo — centered]      │
│     "Welcome back"  (Playfair 28px) │
│     "Sign in to your sanctuary"     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Email                       │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Password              👁    │    │
│  └─────────────────────────────┘    │
│                                     │
│     Forgot password?                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │       Sign In               │    │  ← bg-primary text-white
│  └─────────────────────────────┘    │
│                                     │
│  Don't have an account? Register    │
└─────────────────────────────────────┘
```

- Input fields: `rounded-xl border border-outline-variant/40 px-4 py-3`
- Error message: small red text below the relevant field
- Success banner (for post-registration redirect): green banner at top
- Loading state: spinner inside the Sign In button

---

## Page 15 — Register (`/register`)

**Auth page layout** (standalone, same shell as Login):

**Multi-step or long single-scroll form** with sections:
1. Account info: Full Name, Email, Password (with strength indicator)
2. Personal info: Date of Birth (date picker), Gender (dropdown), Country (dropdown), Phone Number (optional)
3. Preferences: Language selector (pill grid of 7 languages)

- Progress indicator at top: 3 dots or a step bar
- "Create Account" CTA button at bottom, `bg-primary text-white rounded-xl`
- "Already have an account? Sign In" link below CTA

---

## Page 16 — Verify Email (`/verify-email`)

**Centered OTP screen** (standalone):
- Bibleway logo
- "Check your inbox" heading (Playfair 26px)
- "We sent a 6-digit code to your email" subtitle
- **6 individual OTP input boxes** (side by side, auto-focus on next, `w-12 h-14 rounded-xl border-2 text-center text-2xl font-bold`)
- "Verify" button
- "Resend code" text link with a countdown timer
- Error state: boxes turn `border-error`, shake animation

---

## Page 17 — Forgot Password (`/forgot-password`)

**Standalone centered layout**:
- Back arrow + "Forgot Password" heading
- Illustration (envelope icon or lock icon, ~80px, `text-primary`)
- "Enter your email and we'll send you a reset link" subtext
- Email input field (full-width)
- "Send Reset Link" button (`bg-primary text-white`)
- "Back to Login" link

---

## Page 18 — Confirm Password Reset (`/confirm-password-reset`) & Change Password (`/change-password`)

**Standalone centered layout**:
- Lock icon + "Set New Password" heading
- New Password field + Confirm Password field, each with eye toggle
- Password strength bar (4-segment colored bar)
- "Update Password" CTA button
- Inline success/error message

---

## Global UI patterns to apply consistently on mobile

### Modals & bottom sheets
- **PostingModal** (create post/prayer): full-screen bottom sheet, `rounded-t-3xl`, handle bar at top
  - Tab toggle: "Post" / "Prayer Request"
  - Large textarea with placeholder "Share your thoughts..."
  - Media upload button row
  - Character counter
  - "Publish" button sticky at bottom

### Toast notifications
- Slide up from bottom, above bottom nav, `rounded-xl bg-inverse-surface text-inverse-on-surface`
- Auto-dismisses after 3 seconds

### Shimmer loading skeletons
- Use animated `linear-gradient` sweep (`shimmer` keyframe) in `bg-surface-container-high`
- Match the shape of the real content (card skeletons, avatar circles, text line rectangles)

### Empty states
- Centered icon (Material Symbol, ~48px, `text-primary/40`)
- Heading + subtext
- Optional CTA button

### Pull-to-refresh
- Standard native pull-to-refresh gesture (show loading spinner at top when dragging down)

### Safe area handling
- All sticky/fixed elements must respect `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)`

### Tap targets
- All interactive elements must be at minimum 44×44px

### Keyboard avoidance
- Input-heavy pages (chat, comments, forms) must push content up when the software keyboard appears — use `padding-bottom` that matches keyboard height

---

## Deliverables requested

For each of the 18 pages listed above, please provide:

1. **A complete mobile screen mockup** at 390×844px in portrait orientation
2. The design should use the locked color palette and fonts defined above
3. Show both the **default/loaded state** AND the **loading skeleton state** for data-driven pages (Feed, Bible, Shop, Chat)
4. Show the **empty state** for lists (Chat List, Purchases, Settings sub-panels)
5. Show at least one **interactive/expanded state** per page where applicable (e.g. reaction picker open on Feed, comment section expanded, settings section expanded)
6. The Bottom Navigation must appear on all pages except: Login, Register, Verify Email, Forgot Password, Confirm Password Reset, Change Password, and Chat Conversation (where it is replaced by the message input bar)
