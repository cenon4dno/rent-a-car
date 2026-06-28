import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getMyBookings, BookingDetail } from '@/lib/api';
import { loadAuth } from '@/lib/auth';

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700' },
  ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-600' },
};

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    const user = await loadAuth();
    if (!user) {
      setUnauthenticated(true);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await getMyBookings(user.apiToken);
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (unauthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-gray-400 text-base text-center mb-4">
          Sign in to view your bookings
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl px-6 py-3"
          onPress={() => router.push('/login')}
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      data={bookings}
      keyExtractor={(b) => b.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      ListEmptyComponent={
        <View className="items-center mt-20">
          <Text className="text-4xl mb-3">📋</Text>
          <Text className="text-gray-400">No bookings yet</Text>
        </View>
      }
      renderItem={({ item: b }) => {
        const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE['PENDING'];
        return (
          <TouchableOpacity
            className="bg-white rounded-2xl border border-gray-200 p-4 mb-3 shadow-sm"
            onPress={() => router.push(`/booking/${b.id}`)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-gray-900">
                  {b.vehicle.make} {b.vehicle.model}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {fmt(b.startDate)} → {fmt(b.endDate)}
                </Text>
              </View>
              <View>
                <View className={`${badge.bg} rounded-full px-2.5 py-1 mb-1`}>
                  <Text className={`text-xs font-semibold ${badge.text}`}>{b.status}</Text>
                </View>
                <Text className="text-sm font-bold text-blue-600 text-right">
                  ₱{b.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
