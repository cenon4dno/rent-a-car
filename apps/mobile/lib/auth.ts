import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'api_token';
const USER_KEY = 'user_info';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  apiToken: string;
}

export async function saveAuth(user: AuthUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, user.apiToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadAuth(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AuthUser;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function ssoExchange(
  provider: string,
  providerAccountId: string,
  email: string,
  name: string,
  image?: string,
): Promise<AuthUser | null> {
  try {
    const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiBase}/auth/sso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, providerAccountId, email, name, image }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      token: string;
      user: { id: string; name: string; email: string; role: string };
    };
    const user: AuthUser = { ...json.user, apiToken: json.token };
    await saveAuth(user);
    return user;
  } catch {
    return null;
  }
}
