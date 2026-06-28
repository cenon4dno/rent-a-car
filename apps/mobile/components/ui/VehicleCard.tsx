import { View, Text, TouchableOpacity } from 'react-native';
import { Vehicle } from '@/lib/api';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden shadow-sm"
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image placeholder */}
      <View className="h-40 bg-blue-100 items-center justify-center">
        <Text className="text-blue-400 text-4xl">🚗</Text>
      </View>

      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">{vehicle.renter?.companyName}</Text>
          </View>
          <View className="bg-blue-50 rounded-lg px-3 py-1.5">
            <Text className="text-blue-700 font-bold text-sm">
              ₱{vehicle.dailyRate.toLocaleString()}
            </Text>
            <Text className="text-blue-400 text-xs text-right">/day</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-3">
          <Chip label={vehicle.fuelType} />
          <Chip label={vehicle.transmission} />
          <Chip label={`${vehicle.seatingCapacity} seats`} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View className="bg-gray-100 rounded-full px-2.5 py-1">
      <Text className="text-xs text-gray-600">{label}</Text>
    </View>
  );
}
