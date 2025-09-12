import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      dbId?: string
      name?: string | null
      email?: string | null
      image?: string | null
      credits?: number
      subscriptionStatus?: string
    }
  }

  interface JWT {
    accessToken?: string
    id?: string
    dbId?: string
    credits?: number
    subscriptionStatus?: string
  }

  interface User {
    dbId?: string
    credits?: number
    subscriptionStatus?: string
    googleId?: string
    picture?: string
  }
}
