# Distributor App — working notes for Claude

React Native + **Expo SDK 54 (pinned — do NOT upgrade)**. Distributor-facing app on an
Odoo backend: stock management, delivery, invoices. Ships to iOS + Android via EAS.

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
4. **Every success/failure uses `ResultSheet`** (one component, `kind: 'success' | 'error'`).
5. Keep it lazy — smallest change that works, reuse before adding.

## Wiring a real Odoo endpoint

Backend (REST vs JSON-RPC) is not finalized. Default transport is `mock`
(`app.json > expo.extra.apiTransport`, or `EXPO_PUBLIC_API_TRANSPORT`).

- **REST:** add the path to `ENDPOINTS` in `src/api/rest.ts`, keyed by the `Op`.
- **JSON-RPC:** implement the `Op` case in `src/api/jsonrpc.ts` `request()`.
- Point one resource at real data while others stay mock: add to `OVERRIDES` in
  `src/api/index.ts`, e.g. `{ 'invoice.list': 'rest' }`.
- Update the matching fixture in `src/api/fixtures.ts` so the mock still mirrors reality.
- `Op` union + domain types live in `src/api/transport.ts` / `src/api/types.ts`.

## Layout

- `app/` — expo-router routes. `(auth)` = login + server config, `(tabs)` = Home /
  Stock / Deliveries / Invoices / More, detail screens at `app/stock|deliveries|invoices|settings/*`.
- Auth gating: `Stack.Protected guard={!!session}` in `app/_layout.tsx`.
- `app/kitchen-sink.tsx` — every primitive, dev-only (linked from More).

## Commands

- `npx expo start` — run in Expo Go / dev client
- `npx tsx src/lib/money.ts` / `src/lib/status.ts` — pure-logic self-checks
- `npx expo-doctor`
- `eas build --platform android|ios --profile development` — device build (iOS must be EAS; no Mac)
