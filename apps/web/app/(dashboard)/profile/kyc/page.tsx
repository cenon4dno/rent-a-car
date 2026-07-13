import { redirect } from 'next/navigation';

// KYC now lives inside the profile page — keep old links/bookmarks working.
export default function KycPage() {
  redirect('/profile#kyc');
}
