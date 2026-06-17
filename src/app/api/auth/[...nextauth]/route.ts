import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '@/lib/prisma';

/**
 * NextAuth v4 configuration for Nexora.
 *
 * - Google OAuth provider for sign-in
 * - Credentials provider in development for testing
 * - Prisma adapter for storing users/accounts/sessions in PostgreSQL
 * - JWT strategy for stateless sessions (faster, no DB session lookups)
 * - Custom callbacks to expose user ID in the session/token
 */
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    ...(process.env.NODE_ENV === 'development'
      ? [
          CredentialsProvider({
            name: 'Development Credentials',
            credentials: {
              email: { label: 'Email', type: 'email', placeholder: 'admin@nexora.dev' },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;

              // Find user in database, or create them if they do not exist
              let user = await prisma.user.findUnique({
                where: { email: credentials.email },
              });

              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email: credentials.email,
                    name: credentials.email.split('@')[0],
                    image: `https://api.dicebear.com/9.x/initials/svg?seed=${credentials.email}`,
                  },
                });
              }

              return user;
            },
          }),
        ]
      : []),
  ],

  // Use JWT strategy — no server-side session table lookups
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * Attach the user's database ID and status to the JWT token.
     * This makes it available in the session without extra DB calls.
     * Also captures client-side session update events.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.status = (user as { status?: string | null }).status;
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.status !== undefined) token.status = session.status;
      }
      return token;
    },

    /**
     * Expose the user's database ID and status on the client-side session object.
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.status = token.status as string | null;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },

  // Custom pages (uncomment in Milestone 4 when pages are built)
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error',
  // },

  secret: process.env.AUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
