# Mobile Build Guide

## Prerequisites

| Tool                | Version | Notes                                     |
| ------------------- | ------- | ----------------------------------------- |
| Node.js             | 20+     | `node --version`                          |
| Java JDK            | 17      | `java -version` — must be JDK 17, not JRE |
| Android SDK         | API 35  | Set `ANDROID_HOME` env var                |
| Android build-tools | 35.0.0+ | Installed via Android Studio SDK Manager  |

Set environment variables (Windows, persist in System Properties or your profile):

```powershell
$env:ANDROID_HOME = "C:\Android"       # or wherever the SDK is installed
$env:JAVA_HOME    = "C:\Program Files\Java\jdk-17"
```

---

## Option A — Expo Go (quickest, no build)

No APK needed. Install [Expo Go](https://expo.dev/go) on your Android phone, then:

```bash
cd apps/mobile
npx expo start
```

Scan the QR code. The app connects to the Metro bundler on your dev machine. Make sure `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` points to your machine's LAN IP.

---

## Option B — Local Debug APK

Produces an installable `.apk` signed with a debug keystore. Best for testing on physical devices without Expo Go.

### Step 1 — Generate the native Android project

```bash
cd apps/mobile
npx expo prebuild --platform android --no-install
```

This creates the `android/` folder. Run this once; re-run only after changing native Expo plugins in `app.json`.

### Step 2 — Build the APK

```powershell
$env:ANDROID_HOME = "C:\Android"
$env:JAVA_HOME    = "C:\Program Files\Java\jdk-17"
cd apps/mobile/android
.\gradlew.bat assembleDebug --no-daemon
```

Build time: ~5–10 minutes on first run (downloads Gradle dependencies); ~1–2 minutes on subsequent runs.

### Step 3 — Install on device or emulator

```bash
# Connect a physical device with USB debugging enabled, or start an emulator, then:
adb install apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Or copy the APK to the device and open it (enable "Install from unknown sources" in Settings → Security).

**APK location:** `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Option C — EAS Cloud Build (no local Android SDK needed)

Requires an [Expo account](https://expo.dev) and EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Create `apps/mobile/eas.json`:

```json
{
  "cli": { "version": ">= 20.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Then build:

```bash
cd apps/mobile
eas build --platform android --profile preview
```

EAS uploads the project to Expo's build servers and emails a download link when done (~10–15 min).

---

## Release Build (Production)

A release build requires a signing keystore. Generate one:

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias rentacar \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

Add signing config to `apps/mobile/android/app/build.gradle`:

```groovy
android {
  signingConfigs {
    release {
      storeFile file("release.keystore")
      storePassword System.getenv("KEYSTORE_PASSWORD")
      keyAlias "rentacar"
      keyPassword System.getenv("KEY_PASSWORD")
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

Then build:

```powershell
.\gradlew.bat assembleRelease --no-daemon
```

**Output:** `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

> Never commit the keystore file. Store it in a secrets manager and add `*.keystore` to `.gitignore`.

---

## App Configuration

| Key                   | Location                        | Purpose                                                    |
| --------------------- | ------------------------------- | ---------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | `apps/mobile/.env`              | API base URL — use LAN IP for physical devices             |
| Bundle ID             | `app.json → android.package`    | `com.rentacar.app`                                         |
| App name              | `app.json → expo.name`          | `RentACar`                                                 |
| Icons                 | `apps/mobile/assets/`           | Replace `icon.png` and `adaptive-icon.png` (1024×1024 PNG) |
| Splash screen         | `apps/mobile/assets/splash.png` | 1242×2436 PNG recommended                                  |

---

## Troubleshooting

### `JAVA_HOME is set to an invalid directory`

Make sure `JAVA_HOME` points to the JDK root, not the `javapath` shim:

```powershell
# Correct
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Wrong — this is just a PATH shim, not the JDK root
$env:JAVA_HOME = "C:\Program Files\Common Files\Oracle\Java\javapath"
```

### `Compose Compiler requires Kotlin version X`

Add `android.kotlinVersion=1.9.25` to `apps/mobile/android/gradle.properties` and pin the Kotlin classpath in `apps/mobile/android/build.gradle`:

```groovy
classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")
```

### Missing asset files (`ENOENT: adaptive-icon.png`)

The `assets/` folder must contain `icon.png`, `adaptive-icon.png`, `splash.png`, and `favicon.png` before running `expo prebuild`. Create placeholder images or use your own.

### App can't reach the API on a physical device

`localhost` doesn't resolve from a phone. Use your machine's LAN IP in `EXPO_PUBLIC_API_URL`:

```env
EXPO_PUBLIC_API_URL="http://192.168.1.42:4000/api/v1"
```

For Android emulator specifically, use `10.0.2.2` (maps to host `localhost`).
