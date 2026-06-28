import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getBooking, BookingDetail } from '@/lib/api';
import { loadAuth } from '@/lib/auth';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'text-green-600 bg-green-50',
  ACTIVE: 'text-blue-600 bg-blue-50',
  PENDING: 'text-yellow-600 bg-yellow-50',
  COMPLETED: 'text-gray-600 bg-gray-100',
  CANCELLED: 'text-red-600 bg-red-50',
};

export default function BookingConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth().then((user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      getBooking(id, user.apiToken)
        .then((res) => setBooking(res.data))
        .catch(() => Alert.alert('Error', 'Could not load booking'))
        .finally(() => setLoading(false));
    });
  }, [id]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Booking not found.</Text>
      </View>
    );
  }

  const ref = `RAC-${booking.id.slice(0, 8).toUpperCase()}`;
  const statusStyle = STATUS_COLORS[booking.status] ?? 'text-gray-600 bg-gray-100';

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-5 py-8 items-center">
        <Text className="text-white text-4xl mb-2">🎉</Text>
        <Text className="text-white text-xl font-bold">Booking Confirmed!</Text>
        <Text className="text-blue-200 text-sm mt-1">Reference: {ref}</Text>
        <View className={`mt-3 px-3 py-1 rounded-full ${statusStyle.split(' ')[1]}`}>
          <Text className={`text-xs font-semibold ${statusStyle.split(' ')[0]}`}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View className="px-4 py-5 space-y-4">
        {/* Vehicle */}
        <InfoCard title="Vehicle">
          <Text className="text-base font-bold text-gray-900">
            {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})
          </Text>
          {booking.renter && (
            <Text className="text-sm text-gray-500 mt-0.5">{booking.renter.companyName}</Text>
          )}
        </InfoCard>

        {/* Trip */}
        <InfoCard title="Trip Details">
          <InfoRow label="Pick-up" value={fmt(booking.startDate)} />
          <InfoRow label="Drop-off" value={fmt(booking.endDate)} />
          <InfoRow label="Location" value={booking.pickupLocation} />
        </InfoCard>

        {/* Payment */}
        <InfoCard title="Payment">
          <InfoRow
            label="Base amount"
            value={`₱${(booking.totalAmount - booking.platformFee - booking.addonsAmount).toLocaleString()}`}
          />
          {booking.addonsAmount > 0 && (
            <InfoRow label="Add-ons" value={`₱${booking.addonsAmount.toLocaleString()}`} />
          )}
          <InfoRow label="Platform fee" value={`₱${booking.platformFee.toLocaleString()}`} />
          <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
            <Text className="text-base font-bold text-gray-900">Total Paid</Text>
            <Text className="text-base font-bold text-blue-600">
              ₱{booking.totalAmount.toLocaleString()}
            </Text>
          </View>
        </InfoCard>

        <TouchableOpacity
          className="bg-gray-100 rounded-2xl py-3 items-center mb-8"
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Text className="text-gray-700 font-semibold">View All Bookings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900 flex-shrink ml-4 text-right">{value}</Text>
    </View>
  );
}
