import { type DefaultSession } from 'next-auth';

/**
 * NextAuth Type Augmentation
 *
 * Extends the default NextAuth types to include the user's
 * database ID in the session object. This allows components
 * and API routes to access `session.user.id` with full type safety.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's database ID (cuid) */
      id: string;
      /** The user's profile status message */
      status?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's database ID (cuid) */
    id?: string;
    /** The user's profile status message */
    status?: string | null;
  }
}
