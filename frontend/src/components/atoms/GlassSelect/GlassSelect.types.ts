export type GlassSelectOption = {
  value: string
  label: string
}

export type GlassSelectProps = {
  label: string
  options: readonly GlassSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  name?: string
  isRequired?: boolean
  isInvalid?: boolean
  className?: string
  labelClassName?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}
