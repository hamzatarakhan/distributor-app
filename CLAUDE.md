# Sales Rep App — working notes for Claude

React Native + **Expo SDK 57**. Field sales-rep app on an Odoo backend: **login →
today's visits → confirm a visit (no purchase, or start an order) → build an order
from the van's product catalog → confirming the order deducts van stock and creates
the invoice → print/share the invoice → file a return against a past order.** Ships
to iOS + Android via EAS. Runs in the current store Expo Go.

This is a rewrite of an earlier "distributor/warehouse" scope (stock KPIs, pickings,
deliveries) that turned out not to match the actual client requirement — see the
2026-09-13 conversation for the full before/after mapping if old assumptions resurface.

## Golden rules

1. **Screens use hooks, never transports.** UI imports from `src/hooks/data.ts`
   (React Query) → `src/api/resources.ts` → `src/api/index.ts`. Never call a
   transport (`mock`/`jsonrpc`/`rest`) or `fetch` Odoo from a screen.
2. **New screens compose `src/components`** — `Screen`, `Button`, `Card`, `ListRow`,
   `Badge`, `Money`, `StickyActionBar`, `ResultSheet`, `Sheet`, `FilterChips`,
   `SearchBar`, `QtyStepper`, `Text`, `Icon`. Don't hand-roll `View`/`Text`/`Pressable`
   combos that drift from these.
3. **Colors/spacing/type come from `useTheme()`** (`src/theme/`). No literal hex in
   screens, no `scheme === 'dark' ? …` ternaries.
4. **RTL is manual, not native.** Every row-laying-out spot picks `isRTL ? 'row-reverse'
   : 'row'` from `useLocale()` itself — never `I18nManager.forceRTL()` (that native flag
   only takes effect after a real OS relaunch, which no app can trigger on itself).
   `Text` already defaults its own alignment to the locale; only override `textAlign`
   when a value column deliberately sits opposite its label.
5. **Every success/failure uses `ResultSheet`** (one component, `kind: 'success' | 'error'`).
6. Keep it lazy — smallest change that works, reuse before adding.

## Domain flow (matches the client's own description)

1. **Visits** (`(tabs)/index.tsx`) — today's visit list, sorted by time.
2. **Visit detail** (`visits/[id].tsx`) — confirm outcome: **No purchase** (done, no
   order) or **Start new order** (→ order builder). Creating an order from a visit
   marks that visit done/ordered automatically — there's no separate "confirm visit"
   step on the ordering path.
3. **New order** (`orders/new.tsx?visitId=`) — product catalog with van-stock qty and
   price, a `QtyStepper` per line builds the cart, confirm creates a draft order.
4. **Order detail** (`orders/[id].tsx`) — confirming a **draft** order is the
   stock-out moment: the mock deducts nothing visibly yet (no separate stock ledger
   screen), but conceptually this is where a real Odoo integration issues a delivery
   from the van's stock location and creates the invoice in the same call
   (`order.confirm` returns `{ order, invoice }`).
5. **Invoice** (`invoices/[id].tsx`) — view/download PDF, plus **Print / share**
   (`RN Share`, no extra dependency) — the client hasn't confirmed whether "print
   through the app" means a paired Bluetooth receipt printer; swap this for a
   printer SDK call once they do.
6. **Return** (`orders/[id]/return.tsx`, reached from Order detail once
   `status !== 'draft'`) — pick a return qty per line, one return per order
   (`order.hasReturn` blocks a second one in the mock).

**Van stock** (`(tabs)/stock.tsx`, `stock/[productId].tsx`) is a simple reference
list of the same product catalog the order builder uses (`ProductApi` / `Product`
type) — no warehouse KPIs (forecast/reserved/reorder point), no receiving flow.
Neither of those existed in the requirement; don't re-add them without being asked.

## Phase 1 vs Phase 2

Everything above is **Phase 1 — exactly the client's requirement**, nothing more.
**Phase 2** layers on extra ideas (offline mode, cash/cheque collection, credit-limit
check, customer signature, barcode scan, low-stock flag, discounts, GPS check-in +
merchandising photo, a map of visits, an end-of-day summary, local visit-reminder
notifications) that were **not asked for** — built anyway, gated behind one flag, so
they can be shown or hidden without touching Phase 1 at all.

- `usePhase()` (`src/settings/PhaseProvider.tsx`) exposes `phase: 1 | 2`, persisted
  to AsyncStorage, switched from **More → App phase** (`app/settings/phase.tsx`).
- **Every Phase 2 addition checks `phase === 2` at the call site** — an inline button/
  card/section in an existing screen, or an entire screen only reachable from the
  Phase 2 section of the More menu. When `phase === 1`, none of it renders and no
  Phase 2 permission (camera/location/notifications) is ever requested — Phase 1
  stays exactly the client's app.
- Adding a new Phase 2 feature: gate it the same way, don't fork the Phase 1 screen.
- Native modules added for this: `expo-camera` (barcode scan), `expo-image-picker`
  (merchandising photo), `expo-location` (GPS check-in, `src/lib/geo.ts` for the
  haversine distance), `expo-notifications` (**local** reminders only — Expo Go
  dropped remote push on Android), `react-native-maps` (visits map — Android tiles
  need a Google Maps API key in `app.json > android.config.googleMaps` before they
  render; the screen itself won't crash without one, tiles just stay blank),
  `react-native-svg` (hand-rolled `SignaturePad`, no signature-pad dependency),
  `@react-native-community/netinfo` (`src/lib/useOnline.ts`).
- Offline mode is scoped to the one highest-value case: building an order with no
  signal queues it (`src/lib/offlineQueue.ts`, AsyncStorage) instead of calling the
  API; **More → Sync queue** replays queued orders through the real `OrderApi.create`
  once back online. Other writes (visit confirm, returns, payments) aren't queued —
  a deliberate scope cut, extend the same pattern to them if asked.

## Wiring a real Odoo endpoint

Backend (REST vs JSON-RPC) is not finalized. Default transport is `mock`
(`app.json > expo.extra.apiTransport`, or `EXPO_PUBLIC_API_TRANSPORT`).

- **REST:** add the path to `ENDPOINTS` in `src/api/rest.ts`, keyed by the `Op`.
- **JSON-RPC:** implement the `Op` case in `src/api/jsonrpc.ts` `request()`.
- Point one resource at real data while others stay mock: add to `OVERRIDES` in
  `src/api/index.ts`, e.g. `{ 'invoice.list': 'rest' }`.
- Update the matching fixture in `src/api/fixtures.ts` so the mock still mirrors reality.
- `Op` union + domain types live in `src/api/transport.ts` / `src/api/types.ts`.
- `src/api/mock.ts` keeps an in-memory copy of visits/orders/invoices (mutated by
  `visit.confirm` / `order.create` / `order.confirm` / `return.create`) so a change
  shows up elsewhere in the same session — it resets on reload, it's not a database.

## Layout

- `app/` — expo-router routes. `(auth)` = login + server config, `(tabs)` = Visits /
  Van stock / Orders / Invoices / More.
- Auth gating: `Stack.Protected guard={!!session}` in `app/_layout.tsx`.
- `app/kitchen-sink.tsx` — every primitive, dev-only (linked from More).

## Commands

- `npx expo start` — run in Expo Go / dev client
- `npx tsx src/lib/checks.ts` — pure-logic self-checks (money formatting, overdue)
- `npx expo-doctor`
- `eas build --platform android|ios --profile development` — device build (iOS must be EAS; no Mac)
