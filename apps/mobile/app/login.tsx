import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ssoExchange } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [, , promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setLoading(false);
        return;
      }

      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${result.authentication!.accessToken}` },
      });
      const info = (await userInfoRes.json()) as {
        sub: string;
        email: string;
        name: string;
        picture?: string;
      };

      const user = await ssoExchange('google', info.sub, info.email, info.name, info.picture);
      if (user) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Sign-in failed', 'Could not exchange token with the API');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
          <Text className="text-white text-3xl">🚗</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900">
          Rent<Text className="text-blue-600">A</Text>Car
        </Text>
        <Text className="text-gray-400 text-sm mt-1">Sign in to continue</Text>
      </View>

      {/* SSO buttons */}
      <View className="space-y-3">
        <SSOButton
          emoji="🔵"
          label="Continue with Google"
          onPress={handleGoogleSignIn}
          loading={loading}
        />
        <SSOButton
          emoji="🟦"
          label="Continue with Microsoft"
          onPress={() => Alert.alert('Coming soon', 'Microsoft login coming soon')}
        />
        <SSOButton
          emoji="⚫"
          label="Continue with Apple"
          onPress={() => Alert.alert('Coming soon', 'Apple login coming soon')}
        />
      </View>

      <Text className="text-center text-gray-300 text-xs mt-8">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
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
