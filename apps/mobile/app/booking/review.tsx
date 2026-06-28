import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getVehicle, createBooking, initiatePayment } from '@/lib/api';
import { loadAuth } from '@/lib/auth';

const PLATFORM_FEE_RATE = 0.05;

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', emoji: '💳' },
  { id: 'gcash', label: 'GCash', emoji: '📱' },
  { id: 'maya', label: 'Maya', emoji: '💚' },
];

export default function BookingReviewScreen() {
  const router = useRouter();
  const { vehicleId, pickupLocation, startDate, endDate } = useLocalSearchParams<{
    vehicleId: string;
    pickupLocation: string;
    startDate: string;
    endDate: string;
  }>();

  const [vehicleName, setVehicleName] = useState('');
  const [dailyRate, setDailyRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    getVehicle(vehicleId)
      .then((res) => {
        setVehicleName(`${res.data.year} ${res.data.make} ${res.data.model}`);
        setDailyRate(res.data.dailyRate);
      })
      .catch(() => Alert.alert('Error', 'Could not load vehicle'))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const { days, baseTotal, platformFee, grandTotal } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const baseTotal = days * dailyRate;
    const platformFee = Math.round(baseTotal * PLATFORM_FEE_RATE);
    return { days, baseTotal, platformFee, grandTotal: baseTotal + platformFee };
  }, [startDate, endDate, dailyRate]);

  const handleConfirm = async () => {
    const user = await loadAuth();
    if (!user) {
      router.push('/login');
      return;
    }

    setBooking(true);
    try {
      const bookingRes = await createBooking(
        {
          vehicleId,
          pickupLocation,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
        user.apiToken,
      );
      const bookingId = bookingRes.data.id;
      const payRes = await initiatePayment(bookingId, paymentMethod, user.apiToken);

      if (payRes.data.checkoutUrl) {
        Alert.alert('Redirect to Payment', `Open checkout: ${payRes.data.checkoutUrl}`, [
          { text: 'OK', onPress: () => router.push(`/booking/${bookingId}`) },
        ]);
      } else {
        router.push(`/booking/${bookingId}`);
      }
    } catch (err) {
      Alert.alert('Booking Failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setBooking(false);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-5 space-y-4">
        {/* Vehicle */}
        <Card title="Vehicle">
          <Text className="text-base font-bold text-gray-900">{vehicleName}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">₱{dailyRate.toLocaleString()}/day</Text>
        </Card>

        {/* Trip */}
        <Card title="Trip Details">
          <Row label="Pick-up" value={fmt(startDate)} />
          <Row label="Drop-off" value={fmt(endDate)} />
          <Row label="Duration" value={`${days} day${days !== 1 ? 's' : ''}`} />
          <Row label="Location" value={pickupLocation} />
        </Card>

        {/* Price */}
        <Card title="Price Breakdown">
          <Row
            label={`₱${dailyRate.toLocaleString()} × ${days} day${days !== 1 ? 's' : ''}`}
            value={`₱${baseTotal.toLocaleString()}`}
          />
          <Row label="Platform fee (5%)" value={`₱${platformFee.toLocaleString()}`} />
          <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
            <Text className="text-base font-bold text-gray-900">Total</Text>
            <Text className="text-base font-bold text-blue-600">
              ₱{grandTotal.toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* Payment method */}
        <Card title="Payment Method">
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              className={`flex-row items-center gap-3 p-3 rounded-xl border mb-2 ${
                paymentMethod === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onPress={() => setPaymentMethod(m.id)}
              activeOpacity={0.8}
            >
              <Text className="text-xl">{m.emoji}</Text>
              <Text
                className={`text-sm font-medium ${
                  paymentMethod === m.id ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4 items-center mb-8"
          onPress={handleConfirm}
          disabled={booking}
          activeOpacity={0.8}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Confirm & Pay ₱{grandTotal.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  );
}
