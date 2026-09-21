import { Label, ListBox, Select } from '@heroui/react'
import type { GlassSelectProps } from './GlassSelect.types'
import './GlassSelect.css'

export function GlassSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  name,
  isRequired,
  isInvalid,
  className = '',
  labelClassName = '',
  ariaLabel,
  ariaDescribedBy,
}: GlassSelectProps) {
  return (
    <Select
      className={`glass-select ${className}`.trim()}
      value={value || null}
      onChange={(selectedValue) => onChange(selectedValue ? String(selectedValue) : '')}
      placeholder={placeholder}
      name={name}
      isRequired={isRequired}
      isInvalid={isInvalid}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <Label className={labelClassName}>{label}</Label>
      <Select.Trigger className="glass-select__trigger">
        <Select.Value className="glass-select__value" />
        <Select.Indicator className="glass-select__indicator" />
      </Select.Trigger>
      <Select.Popover className="glass-select__popover">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              className="glass-select__option"
              id={option.value}
              key={option.value}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
