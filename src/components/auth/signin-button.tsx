"use client"

import { signInAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SignInButton({ children, className, variant = "default" }: SignInButtonProps) {
  return (
    <form action={signInAction}>
      <Button type="submit" className={className} variant={variant}>
        {children || "Sign In with Google"}
      </Button>
    </form>
  )
}
