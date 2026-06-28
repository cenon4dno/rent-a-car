import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getVehicle, Vehicle } from '@/lib/api';
import { loadAuth } from '@/lib/auth';

const PLATFORM_FEE_RATE = 0.05;

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    getVehicle(id)
      .then((res) => setVehicle(res.data))
      .catch(() => Alert.alert('Error', 'Could not load vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!startDate || !endDate || !location) {
      Alert.alert('Missing details', 'Please fill in all booking fields');
      return;
    }
    const user = await loadAuth();
    if (!user) {
      router.push('/login');
      return;
    }
    router.push({
      pathname: '/booking/review',
      params: {
        vehicleId: id,
        pickupLocation: location,
        startDate,
        endDate,
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Vehicle not found.</Text>
      </View>
    );
  }

  const days = 1;
  const total = Math.round(days * vehicle.dailyRate * (1 + PLATFORM_FEE_RATE));

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Image placeholder */}
      <View className="h-52 bg-blue-100 items-center justify-center">
        <Text className="text-blue-400 text-6xl">🚗</Text>
      </View>

      <View className="px-4 py-5">
        {/* Title + rate */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-3">
            <Text className="text-xl font-bold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text className="text-sm text-gray-400 mt-0.5">{vehicle.renter?.companyName}</Text>
          </View>
          <Text className="text-xl font-bold text-blue-600">
            ₱{vehicle.dailyRate.toLocaleString()}/day
          </Text>
        </View>

        {/* Specs */}
        <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Specifications
          </Text>
          <View className="flex-row flex-wrap gap-y-3">
            <SpecItem label="Fuel" value={vehicle.fuelType} />
            <SpecItem label="Transmission" value={vehicle.transmission} />
            <SpecItem label="Seats" value={`${vehicle.seatingCapacity}`} />
            {vehicle.mileageLimit && (
              <SpecItem label="Mileage Limit" value={`${vehicle.mileageLimit} km`} />
            )}
          </View>
        </View>

        {/* Booking inputs */}
        <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Book This Car
          </Text>
          <BookingField
            label="Pickup Location"
            placeholder="e.g. NAIA Terminal 3"
            value={location}
            onChangeText={setLocation}
          />
          <BookingField
            label="Start Date (YYYY-MM-DD)"
            placeholder="2026-07-10"
            value={startDate}
            onChangeText={setStartDate}
          />
          <BookingField
            label="End Date (YYYY-MM-DD)"
            placeholder="2026-07-15"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>

        {/* Price estimate */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-5">
          <Text className="text-xs text-blue-500 uppercase tracking-wide mb-1">
            Estimated Total (1 day)
          </Text>
          <Text className="text-2xl font-bold text-blue-700">₱{total.toLocaleString()}</Text>
          <Text className="text-xs text-blue-400 mt-0.5">Includes 5% platform fee</Text>
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4 items-center"
          onPress={handleBook}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">Proceed to Booking Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 pr-3">
      <Text className="text-xs text-gray-400">{label}</Text>
      <Text className="text-sm font-medium text-gray-800 mt-0.5">{value}</Text>
    </View>
  );
}

function BookingField({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="mb-3">
      <Text className="text-xs text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
