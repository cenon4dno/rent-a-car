import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAutoDiscovery, useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ssoExchange, emailLogin } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ?? '';
const MICROSOFT_TENANT = process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID ?? 'common';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<'google' | 'microsoft' | 'apple' | 'email' | null>(null);
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [showEmailForm, setShowEmailForm] = useState(false);

  // ── Google ──────────────────────────────────────────────────────────────────
  const [, , promptGoogle] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      const result = await promptGoogle();
      if (result.type !== 'success') return;

      const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${result.authentication!.accessToken}` },
      });
      const info = (await infoRes.json()) as {
        sub: string;
        email: string;
        name: string;
        picture?: string;
      };

      const user = await ssoExchange('google', info.sub, info.email, info.name, info.picture);
      if (user) router.replace('/(tabs)');
      else Alert.alert('Sign-in failed', 'Could not exchange token with the API');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(null);
    }
  };

  // ── Microsoft ────────────────────────────────────────────────────────────────
  const msDiscovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${MICROSOFT_TENANT}/v2.0`,
  );
  const [, , promptMicrosoft] = useAuthRequest(
    {
      clientId: MICROSOFT_CLIENT_ID,
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      redirectUri: makeRedirectUri({ scheme: 'rentacar' }),
    },
    msDiscovery,
  );

  const handleMicrosoftSignIn = async () => {
    if (!MICROSOFT_CLIENT_ID) {
      Alert.alert('Not configured', 'Microsoft SSO is not configured on this build.');
      return;
    }
    setLoading('microsoft');
    try {
      const result = await promptMicrosoft();
      if (result.type !== 'success') return;

      const graphRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${result.authentication!.accessToken}` },
      });
      const me = (await graphRes.json()) as {
        id: string;
        displayName: string;
        mail?: string;
        userPrincipalName?: string;
      };
      const email = me.mail ?? me.userPrincipalName ?? '';

      const user = await ssoExchange('microsoft', me.id, email, me.displayName);
      if (user) router.replace('/(tabs)');
      else Alert.alert('Sign-in failed', 'Could not exchange token with the API');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(null);
    }
  };

  // ── Apple ─────────────────────────────────────────────────────────────────────
  const handleAppleSignIn = async () => {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      Alert.alert('Not available', 'Apple Sign In is only available on iOS devices.');
      return;
    }
    setLoading('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const name = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');

      const user = await ssoExchange(
        'apple',
        credential.user,
        credential.email ?? `${credential.user}@privaterelay.appleid.com`,
        name || 'Apple User',
      );
      if (user) router.replace('/(tabs)');
      else Alert.alert('Sign-in failed', 'Could not exchange token with the API');
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', err instanceof Error ? err.message : 'Apple sign-in failed');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleEmailLogin = async () => {
    if (!emailForm.email || !emailForm.password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading('email');
    try {
      const user = await emailLogin(emailForm.email, emailForm.password);
      if (user) router.replace('/(tabs)');
      else Alert.alert('Sign-in failed', 'Invalid email or password.');
    } catch {
      Alert.alert('Error', 'Sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View className="items-center mb-10">
        <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
          <Text className="text-white text-3xl">🚗</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900">
          Rent<Text className="text-blue-600">A</Text>Car
        </Text>
        <Text className="text-gray-400 text-sm mt-1">Sign in to continue</Text>
      </View>

      {/* Email/password form */}
      {showEmailForm ? (
        <View className="space-y-3 mb-6">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailForm.email}
            onChangeText={(v) => setEmailForm((f) => ({ ...f, email: v }))}
          />
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white"
            placeholder="Password"
            secureTextEntry
            value={emailForm.password}
            onChangeText={(v) => setEmailForm((f) => ({ ...f, password: v }))}
          />
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 items-center"
            onPress={handleEmailLogin}
            disabled={loading === 'email'}
            activeOpacity={0.8}
          >
            {loading === 'email' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEmailForm(false)}>
            <Text className="text-center text-sm text-gray-400">Use SSO instead</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-3 mb-6">
          <SSOButton
            emoji="📧"
            label="Continue with Email"
            onPress={() => setShowEmailForm(true)}
            loading={false}
          />
          <SSOButton
            emoji="🔵"
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={loading === 'google'}
          />
          <SSOButton
            emoji="🟦"
            label="Continue with Microsoft"
            onPress={handleMicrosoftSignIn}
            loading={loading === 'microsoft'}
          />
          {Platform.OS === 'ios' && (
            <SSOButton
              emoji="⚫"
              label="Continue with Apple"
              onPress={handleAppleSignIn}
              loading={loading === 'apple'}
            />
          )}
        </View>
      )}

      <Text className="text-center text-gray-300 text-xs mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </ScrollView>
  );
}

function SSOButton({
  emoji,
  label,
  onPress,
  loading,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-center gap-3 border border-gray-200 rounded-2xl py-4 bg-white"
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#2563EB" />
      ) : (
        <>
          <Text className="text-xl">{emoji}</Text>
          <Text className="text-sm font-semibold text-gray-800">{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
