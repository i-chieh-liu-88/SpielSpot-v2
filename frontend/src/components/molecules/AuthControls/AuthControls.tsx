import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { isClerkConfigured } from '../../../config/clerk'
import Button from '../../atoms/Button'
import { useLanguage } from '../../../providers/LanguageProvider'

const authButtonClass = 'text-sm'

function AuthButtons() {
  const { t } = useLanguage()

  return (
    <>
      <SignInButton mode="modal"><Button className={authButtonClass} size="sm" type="button">{t("Log In")}</Button></SignInButton>
      <SignUpButton mode="modal"><Button className={authButtonClass} size="sm" type="button">{t("Sign Up")}</Button></SignUpButton>
    </>
  )
}

export function AuthControls({ className = '' }: { className?: string }) {
  const { t } = useLanguage()

  if (!isClerkConfigured) {
    return (
      <div className={`items-center gap-2 ${className}`} title="Set VITE_CLERK_PUBLISHABLE_KEY to enable authentication">
        <Button className={authButtonClass} size="sm" type="button" disabled>{t("Log In")}</Button>
        <Button className={authButtonClass} size="sm" type="button" disabled>{t("Sign Up")}</Button>
      </div>
    )
  }

  return (
    <div className={`items-center gap-2 ${className}`}>
      <SignedOut><AuthButtons /></SignedOut>
      <SignedIn><UserButton /></SignedIn>
    </div>
  )
}
