'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface MaskedInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  /** Mask function that takes raw value and returns masked string */
  mask: (value: string) => string
  /** Called with (raw: string, masked: string) on every change */
  onChange: (raw: string, masked: string) => void
  /** Controlled masked value */
  value?: string
  /** Default value (unmasked) */
  defaultValue?: string
}

/**
 * A reusable masked input that wraps the shadcn Input component.
 * Manages internal masked state and applies the mask on every keystroke.
 */
export function MaskedInput({ mask, onChange, value, defaultValue, className, ...props }: MaskedInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Compute initial masked value
  const computeInitialMasked = React.useCallback(() => {
    const initial = value !== undefined ? value : defaultValue || ''
    return mask(initial)
  }, [mask, value, defaultValue])

  const [maskedValue, setMaskedValue] = React.useState(computeInitialMasked)
  const [rawValue, setRawValue] = React.useState(value !== undefined ? value : defaultValue || '')

  // Sync if value prop changes externally
  React.useEffect(() => {
    if (value !== undefined) {
      const newMasked = mask(value)
      setMaskedValue(newMasked)
      setRawValue(value)
    }
  }, [value, mask])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    const masked = mask(e.target.value)
    setMaskedValue(masked)
    setRawValue(raw)
    onChange(raw, masked)
  }

  return (
    <Input
      ref={inputRef}
      value={maskedValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  )
}
