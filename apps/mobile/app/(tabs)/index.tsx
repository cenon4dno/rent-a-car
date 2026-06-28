import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { searchVehicles, Vehicle } from '@/lib/api';
import { VehicleCard } from '@/components/ui/VehicleCard';

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchVehicles({ location: location || undefined, limit: 20 });
      setVehicles(res.data);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Hero */}
      <View className="bg-blue-600 px-5 pt-10 pb-8">
        <Text className="text-white text-3xl font-bold mb-1">
          Rent<Text className="text-blue-200">A</Text>Car
        </Text>
        <Text className="text-blue-100 text-sm mb-6">Find your perfect ride</Text>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</Text>
          <TextInput
            className="text-base text-gray-900 border-b border-gray-200 pb-2 mb-3"
            placeholder="Manila, Cebu, Davao..."
            value={location}
            onChangeText={setLocation}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-3 items-center"
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Search Cars</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <View className="px-4 pt-5 pb-10">
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
        ) : searched ? (
          vehicles.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10">No vehicles found.</Text>
          ) : (
            <>
              <Text className="text-sm text-gray-500 mb-3">{vehicles.length} cars available</Text>
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onPress={() => router.push(`/vehicle/${v.id}`)}
                />
              ))}
            </>
          )
        ) : (
          <View className="items-center mt-10">
            <Text className="text-gray-400 text-sm">Enter a location to find available cars</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
