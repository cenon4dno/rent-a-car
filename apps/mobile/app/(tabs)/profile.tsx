import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { loadAuth, clearAuth, AuthUser } from '@/lib/auth';

const KYC_BADGE: Record<string, { bg: string; text: string }> = {
  VERIFIED: { bg: 'bg-green-100', text: 'text-green-700' },
  UNDER_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-500' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-600' },
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAuth().then(setUser);
    }, []),
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          setUser(null);
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-5xl mb-4">👤</Text>
        <Text className="text-gray-500 text-base text-center mb-6">
          Sign in to access your profile and bookings
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl px-8 py-3 w-full items-center"
          onPress={() => router.push('/login')}
        >
          <Text className="text-white font-bold text-base">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const badge = KYC_BADGE['PENDING'];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Avatar */}
      <View className="bg-blue-600 items-center py-10">
        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3">
          <Text className="text-blue-600 text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">{user.name}</Text>
        <Text className="text-blue-200 text-sm mt-0.5">{user.email}</Text>
        <View className="flex-row items-center gap-2 mt-2">
          <View className="bg-white/20 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-medium">{user.role}</Text>
          </View>
          <View className={`${badge.bg} rounded-full px-3 py-1`}>
            <Text className={`text-xs font-medium ${badge.text}`}>KYC: PENDING</Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-5">
        <MenuSection title="Account">
          <MenuItem
            label="My Bookings"
            emoji="📋"
            onPress={() => router.push('/(tabs)/bookings')}
          />
          <MenuItem label="KYC Documents" emoji="📄" onPress={() => router.push('/profile/kyc')} />
        </MenuSection>

        <MenuSection title="Settings">
          <MenuItem label="Notifications" emoji="🔔" onPress={() => {}} />
          <MenuItem label="Help & Support" emoji="💬" onPress={() => {}} />
          <MenuItem label="Terms & Privacy" emoji="📝" onPress={() => {}} />
        </MenuSection>

        <TouchableOpacity
          className="mt-2 bg-red-50 border border-red-200 rounded-2xl py-4 items-center"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 font-semibold">Sign Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-xs mt-6">RentACar v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
        {title}
      </Text>
      <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function MenuItem({
  label,
  emoji,
  onPress,
}: {
  label: string;
  emoji: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-100 last:border-0"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-lg mr-3">{emoji}</Text>
      <Text className="flex-1 text-sm font-medium text-gray-800">{label}</Text>
      <Text className="text-gray-300 text-lg">›</Text>
    </TouchableOpacity>
  );
}
