# Cookii 🌿

Home-cooking booking MVP built with Expo SDK 54, React Native, TypeScript, Expo Router, Zustand and AsyncStorage. All bookings and payments are **simulated**; no real charges are made.

## Requirements
Node.js 20+, npm, Expo Go (Android or iOS).

## Run
```bash
npm install
npx expo start
```
Scan the QR code in Expo Go, or run `npm run android`, `npm run ios` (macOS simulator), or `npm run web`.

## Quality
```bash
npm test
npm run lint
npx tsc --noEmit
```

## Project map
- `app/` — Expo Router screens, tabs, authentication, booking flow, account.
- `src/components/` — shared custom UI.
- `src/data/` — seeded demo cooks, addresses, offers, wallet and bookings.
- `src/lib/` — pure pricing, scheduling, cancellation and ID logic.
- `src/store/` — persistent Zustand state.
- `src/services/payment/` — mock payment provider, swappable for a real gateway later.
- `src/theme/` — colors, typography, spacing and shadows.
- `__tests__/` — business logic tests.

## Notes
OTP accepts any four digits. UPI, card and netbanking simulate success/failure/cancellation. Wallet supports partial payments. Real payment gateway integration, notifications, maps and backend are intentionally excluded.
