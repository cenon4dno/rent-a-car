import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    apiToken: string;
    profileComplete: boolean;
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}
