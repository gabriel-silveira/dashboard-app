import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/account/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      console.log('isLoggedIn', isLoggedIn);

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      console.log('isOnDashboard', isOnDashboard);

      if (isOnDashboard) {
        // Redirect unauthenticated users to login page
        return isLoggedIn;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      console.log('User is not logged!');

      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
