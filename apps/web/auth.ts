import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import MicrosoftEntraId from 'next-auth/providers/microsoft-entra-id';
import Apple from 'next-auth/providers/apple';
import Facebook from 'next-auth/providers/facebook';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // required on non-Vercel hosts (Azure App Service); without it every auth
  // request fails with UntrustedHost
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.data.userId,
            email: credentials.email as string,
            role: data.data.role,
            apiToken: data.data.accessToken,
            profileComplete: data.data.profileComplete ?? true,
          };
        } catch {
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftEntraId({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? 'common'}/v2.0`,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Client called useSession().update() (e.g. after finishing onboarding) —
      // re-read live profile state so middleware sees fresh values
      if (trigger === 'update' && token.apiToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${token.apiToken as string}` },
            cache: 'no-store',
          });
          if (res.ok) {
            const me = (await res.json()).data;
            token.role = me.role;
            token.profileComplete =
              me.role !== 'CUSTOMER' ||
              !!(me.customerProfile?.licenseUrl && me.customerProfile?.licenseBackUrl);
          }
        } catch {
          // keep existing token values if the API is unreachable
        }
        return token;
      }
      if (user && account) {
        token.provider = account.provider;
        if (account.provider === 'credentials') {
          const u = user as {
            id: string;
            role: string;
            apiToken: string;
            profileComplete: boolean;
          };
          token.apiToken = u.apiToken;
          token.role = u.role;
          token.userId = u.id;
          token.profileComplete = u.profileComplete;
        } else {
          // Exchange SSO token for our own API JWT on first sign-in
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/sso`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                email: user.email,
                name: user.name,
                image: user.image,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              token.apiToken = data.data.accessToken;
              token.role = data.data.role;
              token.userId = data.data.userId;
              token.profileComplete = data.data.profileComplete ?? true;
            }
          } catch {
            // API unavailable during build/dev startup — token missing until next sign-in
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as string;
      session.apiToken = token.apiToken as string;
      session.profileComplete = token.profileComplete !== false;
      return session;
    },
  },
});
