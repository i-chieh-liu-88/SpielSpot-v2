import { ClerkProvider } from '@clerk/clerk-react'
import type { PropsWithChildren } from 'react'
import { clerkPublishableKey } from '../config/clerk'

export function ClerkAuthProvider({ children }: PropsWithChildren) {
  if (!clerkPublishableKey) return children

  return <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">{children}</ClerkProvider>
}
