/**
 * Brazilian input mask utilities for CPF, Phone, and CEP.
 * All mask functions accept raw digit strings and return formatted strings.
 * Unmask functions strip non-digit characters.
 */

/**
 * Strips all non-digit characters from a string.
 */
function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Masks a CPF string as "000.000.000-00".
 */
export function maskCPF(value: string): string {
  const digits = stripNonDigits(value).slice(0, 11)
  const d = digits
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/**
 * Strips non-digit characters from a CPF string.
 */
export function unmaskCPF(value: string): string {
  return stripNonDigits(value)
}

/**
 * Masks a phone string as "(00) 00000-0000".
 */
export function maskPhone(value: string): string {
  const digits = stripNonDigits(value).slice(0, 11)
  const d = digits
  if (d.length <= 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/**
 * Strips non-digit characters from a phone string.
 */
export function unmaskPhone(value: string): string {
  return stripNonDigits(value)
}

/**
 * Masks a CEP string as "00000-000".
 */
export function maskCEP(value: string): string {
  const digits = stripNonDigits(value).slice(0, 8)
  const d = digits
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

/**
 * Strips non-digit characters from a CEP string.
 */
export function unmaskCEP(value: string): string {
  return stripNonDigits(value)
}
