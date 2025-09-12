import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { upsertUser } from "./database"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only handle Google OAuth sign-ins
      if (account?.provider === "google" && profile?.sub && profile?.email) {
        // Store user data for later database operations
        // Database operations will be handled in the JWT callback
        user.googleId = profile.sub
        user.email = profile.email
        user.name = profile.name || null
        user.picture = profile.picture || null
        return true
      }
      return true
    },
    async jwt({ token, account, profile, user }) {
      // Persist the OAuth access_token and user data to the token right after signin
      if (account && profile) {
        token.accessToken = account.access_token
        token.id = profile.sub
        token.email = profile.email
        token.name = profile.name
        token.picture = profile.picture
        
        // Handle database operations (only in non-edge runtime)
        if (user.googleId && typeof window === 'undefined') {
          try {
            // Create or update user in database
            const dbUser = await upsertUser({
              google_id: user.googleId,
              email: user.email!,
              name: user.name,
              image_url: user.picture,
            })
            
            // Store database-specific data in token
            token.dbId = dbUser.id.toString()
            token.credits = dbUser.credits
            token.subscriptionStatus = dbUser.subscription_status
          } catch (error) {
            console.error("Error creating/updating user in database:", error)
            // Continue without database data
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      if (token.id) {
        session.user.id = token.id as string
      }
      if (token.dbId) {
        session.user.dbId = token.dbId as string
      }
      if (token.email) {
        session.user.email = token.email as string
      }
      if (token.name) {
        session.user.name = token.name as string
      }
      if (token.picture) {
        session.user.image = token.picture as string
      }
      if (token.credits !== undefined) {
        session.user.credits = token.credits as number
      }
      if (token.subscriptionStatus) {
        session.user.subscriptionStatus = token.subscriptionStatus as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
