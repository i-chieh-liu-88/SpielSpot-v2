import type { AnchorHTMLAttributes, PropsWithChildren } from 'react'
import '../Button/Button.css'

type ActionLinkProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>

export function ActionLink({ children, className = '', ...props }: ActionLinkProps) {
  return (
    <a className={`glass-button glass-button-md ${className}`} {...props}>
      {children}
    </a>
  )
}
