# apps/mobile — React Native / Expo App

The iOS and Android mobile app for RentACar. Mirrors the core booking flow from the web app.

## Features

- Email/password login + Google SSO
- Vehicle search with location and date filters
- Vehicle detail with booking form and add-ons
- Booking confirmation with QR code
- My bookings list with status tracking
- KYC document upload (camera or gallery)
- Profile page

## Running locally

### Option A — Expo Go (no build required)

Install [Expo Go](https://expo.dev/go) on your Android or iOS device.

```bash
cd apps/mobile
npx expo start
```

Scan the QR code. The app hot-reloads as you save files.

### Option B — Android emulator

```bash
npx expo start --android
```

Requires Android Studio with a running emulator.

### Option C — iOS simulator (macOS only)

```bash
npx expo start --ios
```

Requires Xcode.

## Building an APK

See [docs/mobile-build.md](../../docs/mobile-build.md) for full instructions.

Quick version:

```bash
# 1. Generate native project (once)
npx expo prebuild --platform android --no-install

# 2. Build debug APK
cd android
.\gradlew.bat assembleDebug --no-daemon    # Windows
./gradlew assembleDebug --no-daemon        # macOS/Linux

# 3. Install
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Environment variables

Create `apps/mobile/.env`:

```env
# Use your machine's LAN IP for physical devices
# Use 10.0.2.2 for Android emulator (maps to host localhost)
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api/v1
```

## Structure

```
app/
  (tabs)/
    index.tsx          Home screen — vehicle search
    bookings.tsx       My bookings list
    profile.tsx        User profile + KYC
  booking/
    [id].tsx           Booking detail + QR code confirmation
  vehicle/
    [id].tsx           Vehicle detail + booking form
  login.tsx            Email/password login + SSO
  onboarding.tsx       KYC document upload flow

lib/
  api.ts               Typed fetch helpers for the NestJS API
  auth.ts              Login, logout, token storage (expo-secure-store)
```

## Assets

Replace placeholder images before release:

| File                       | Size      | Purpose                          |
| -------------------------- | --------- | -------------------------------- |
| `assets/icon.png`          | 1024×1024 | App icon                         |
| `assets/adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |
| `assets/splash.png`        | 1242×2436 | Splash screen                    |
| `assets/favicon.png`       | 48×48     | Web favicon (Expo web)           |
