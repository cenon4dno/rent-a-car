import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadDocumentMobile } from '@/lib/api';
import { loadAuth } from '@/lib/auth';

type DocType = 'license' | 'secondaryId' | 'businessPermit' | 'companyReg';

interface DocItem {
  type: DocType;
  label: string;
  description: string;
}

const CUSTOMER_DOCS: DocItem[] = [
  {
    type: 'license',
    label: "Driver's License",
    description: 'Non-Professional or Professional license',
  },
  { type: 'secondaryId', label: 'Secondary ID', description: 'Passport, SSS, PhilHealth, etc.' },
];

const RENTER_DOCS: DocItem[] = [
  {
    type: 'businessPermit',
    label: 'Business Permit',
    description: 'Current local business permit',
  },
  {
    type: 'companyReg',
    label: 'Company Registration',
    description: 'SEC or DTI registration documents',
  },
];

export default function MobileKycScreen() {
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [uploaded, setUploaded] = useState<Set<DocType>>(new Set());

  const pickAndUpload = async (docType: DocType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload documents.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = asset.fileName ?? `document-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setUploading(docType);
    try {
      const auth = await loadAuth();
      if (!auth?.token) {
        Alert.alert('Not signed in', 'Please sign in to upload documents.');
        return;
      }

      await uploadDocumentMobile(docType, uri, fileName, mimeType, auth.token);
      setUploaded((prev) => new Set(prev).add(docType));
      Alert.alert('Uploaded', 'Document uploaded successfully. Our team will review it shortly.');
    } catch (err) {
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const takeCameraPhoto = async (docType: DocType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take document photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = `document-${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';

    setUploading(docType);
    try {
      const auth = await loadAuth();
      if (!auth?.token) {
        Alert.alert('Not signed in', 'Please sign in to upload documents.');
        return;
      }

      await uploadDocumentMobile(docType, uri, fileName, mimeType, auth.token);
      setUploaded((prev) => new Set(prev).add(docType));
      Alert.alert('Uploaded', 'Document uploaded successfully.');
    } catch (err) {
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleDocPress = (docType: DocType) => {
    Alert.alert('Upload Document', 'Choose how to add your document', [
      { text: 'Take Photo', onPress: () => takeCameraPhoto(docType) },
      { text: 'Choose from Library', onPress: () => pickAndUpload(docType) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text className="text-xl font-bold text-gray-900 mb-1">KYC Verification</Text>
        <Text className="text-sm text-gray-500 mb-6">
          Upload your documents to complete identity verification and unlock booking.
        </Text>

        <DocSection title="Individual Renter Documents" docs={CUSTOMER_DOCS} />
        <DocSection title="Company Documents (Renter)" docs={RENTER_DOCS} />
      </View>
    </ScrollView>
  );

  function DocSection({ title, docs }: { title: string; docs: DocItem[] }) {
    return (
      <View className="mb-6">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
          {title}
        </Text>
        <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {docs.map((doc, i) => (
            <TouchableOpacity
              key={doc.type}
              className={`flex-row items-center px-4 py-4 ${i < docs.length - 1 ? 'border-b border-gray-100' : ''}`}
              onPress={() => handleDocPress(doc.type)}
              disabled={uploading === doc.type}
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800">{doc.label}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{doc.description}</Text>
              </View>
              {uploading === doc.type ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : uploaded.has(doc.type) ? (
                <View className="bg-green-100 rounded-full px-3 py-1">
                  <Text className="text-green-700 text-xs font-medium">Uploaded</Text>
                </View>
              ) : (
                <View className="bg-blue-50 rounded-full px-3 py-1">
                  <Text className="text-blue-600 text-xs font-medium">Upload</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
}
