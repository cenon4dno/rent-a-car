import { auth } from '@/auth';
import { getAdminRenters } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { CommissionEditor } from './CommissionEditor';

const TRUST_VARIANT: Record<string, 'green' | 'yellow' | 'gray'> = {
  VERIFIED: 'green',
  UNDER_VALIDATION: 'yellow',
  NOT_VERIFIED: 'gray',
};

export default async function AdminConfigPage() {
  const session = await auth();
  const result = await getAdminRenters(session!.apiToken).catch(() => null);
  const renters = result?.data ?? [];

  const requiredSecrets = [
    {
      name: 'PROD_DATABASE_URL',
      desc: 'PostgreSQL connection string for production',
      example: 'postgresql://user:pass@host:5432/rentacar',
    },
    {
      name: 'AZURE_WEBAPP_PUBLISH_PROFILE_API',
      desc: 'Download from Azure Portal → App Service (API) → Get publish profile',
      example: '<publishData>...</publishData>',
    },
    {
      name: 'AZURE_WEBAPP_PUBLISH_PROFILE_WEB',
      desc: 'Download from Azure Portal → App Service (Web) → Get publish profile',
      example: '<publishData>...</publishData>',
    },
    {
      name: 'NEXTAUTH_SECRET',
      desc: 'Random 32-byte string. Generate with: openssl rand -base64 32',
      example: 'abc123...',
    },
    {
      name: 'NEXTAUTH_URL',
      desc: 'Public URL of the deployed web app',
      example: 'https://rent-a-car-web.azurewebsites.net',
    },
    {
      name: 'NEXT_PUBLIC_API_URL',
      desc: 'Public URL of the deployed API',
      example: 'https://rent-a-car-api.azurewebsites.net',
    },
    {
      name: 'AUTH_GOOGLE_ID',
      desc: 'Google OAuth 2.0 Client ID',
      example: '123456.apps.googleusercontent.com',
    },
    { name: 'AUTH_GOOGLE_SECRET', desc: 'Google OAuth 2.0 Client Secret', example: 'GOCSPX-...' },
    {
      name: 'AUTH_MICROSOFT_ENTRA_ID_ID',
      desc: 'Microsoft Entra Application (client) ID',
      example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
    {
      name: 'AUTH_MICROSOFT_ENTRA_ID_SECRET',
      desc: 'Microsoft Entra Client Secret value',
      example: 'xxxxxxxxxx~xxxxxxxx...',
    },
    {
      name: 'AUTH_MICROSOFT_ENTRA_ID_ISSUER',
      desc: 'Microsoft Entra issuer URL with tenant ID',
      example: 'https://login.microsoftonline.com/{tenant}/v2.0',
    },
    {
      name: 'FACEBOOK_CLIENT_ID',
      desc: 'Facebook App ID from Meta Developer Console',
      example: '1234567890',
    },
    {
      name: 'FACEBOOK_CLIENT_SECRET',
      desc: 'Facebook App Secret from Meta Developer Console',
      example: 'abcdef...',
    },
    {
      name: 'APPLE_CLIENT_ID',
      desc: 'Apple Services ID for Sign in with Apple',
      example: 'com.yourapp.service',
    },
    {
      name: 'APPLE_CLIENT_SECRET',
      desc: 'Apple JWT private key (ES256)',
      example: '-----BEGIN PRIVATE KEY-----...',
    },
    {
      name: 'PAYMONGO_SECRET_KEY',
      desc: 'PayMongo Secret Key from dashboard.paymongo.com',
      example: 'sk_live_...',
    },
    { name: 'PAYMONGO_PUBLIC_KEY', desc: 'PayMongo Public Key', example: 'pk_live_...' },
    {
      name: 'PAYMONGO_WEBHOOK_SECRET',
      desc: 'PayMongo webhook secret for signature verification',
      example: 'whsk_...',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Configuration</h1>
        <p className="text-gray-500 text-sm">
          Default platform commission: <strong>5%</strong>. You can override per renter below.
        </p>
      </div>

      {/* GitHub Secrets Reference */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">GitHub Actions Secrets</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Add these to{' '}
              <a
                href="https://github.com/cenon4dno/rent-a-car/settings/secrets/actions"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                github.com/cenon4dno/rent-a-car → Settings → Secrets → Actions
              </a>
            </p>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-800 font-medium px-2.5 py-1 rounded-full">
            {requiredSecrets.length} required
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {requiredSecrets.map((s) => (
            <div key={s.name} className="px-6 py-3 flex items-start gap-4">
              <code className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                {s.name}
              </code>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">{s.desc}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">{s.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission rates */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Per-renter Commission Rates</h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Company', 'Owner', 'Trust Badge', 'Commission Rate', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {renters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No renters yet.
                  </td>
                </tr>
              )}
              {renters.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.companyName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{r.user.name}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={r.trustBadge.replace('_', ' ')}
                      variant={TRUST_VARIANT[r.trustBadge] ?? 'gray'}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {(r.commissionRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <CommissionEditor renterId={r.id} currentRate={r.commissionRate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
