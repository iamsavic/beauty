export interface CurrencyConfig {
  code: string        // ISO 4217: 'RSD', 'BAM', 'EUR', 'HRK'
  symbol: string      // Prikazni simbol: 'din', 'KM', '€'
  stripeCode: string  // Stripe lowercase: 'rsd', 'bam', 'eur'
  position: 'after' | 'before'
}

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  RS: { code: 'RSD', symbol: 'din', stripeCode: 'rsd', position: 'after' },
  BA: { code: 'BAM', symbol: 'KM',  stripeCode: 'bam', position: 'after' },
  ME: { code: 'EUR', symbol: '€',   stripeCode: 'eur', position: 'after' },
  HR: { code: 'EUR', symbol: '€',   stripeCode: 'eur', position: 'after' },
  SI: { code: 'EUR', symbol: '€',   stripeCode: 'eur', position: 'after' },
  AT: { code: 'EUR', symbol: '€',   stripeCode: 'eur', position: 'before' },
  DE: { code: 'EUR', symbol: '€',   stripeCode: 'eur', position: 'before' },
  CH: { code: 'CHF', symbol: 'CHF', stripeCode: 'chf', position: 'after' },
  GB: { code: 'GBP', symbol: '£',   stripeCode: 'gbp', position: 'before' },
  US: { code: 'USD', symbol: '$',   stripeCode: 'usd', position: 'before' },
}

export const DEFAULT_CURRENCY: CurrencyConfig = COUNTRY_CURRENCY_MAP['RS']

export function getCurrency(country: string | null | undefined): CurrencyConfig {
  if (!country) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY_MAP[country.toUpperCase()] ?? DEFAULT_CURRENCY
}

export function formatPrice(amount: number, currency: CurrencyConfig): string {
  const formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2)
  return currency.position === 'before'
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`
}

export const SUPPORTED_COUNTRIES = [
  { code: 'RS', name: 'Srbija', flag: '🇷🇸' },
  { code: 'BA', name: 'Bosna i Hercegovina', flag: '🇧🇦' },
  { code: 'ME', name: 'Crna Gora', flag: '🇲🇪' },
  { code: 'HR', name: 'Hrvatska', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovenija', flag: '🇸🇮' },
  { code: 'AT', name: 'Austrija', flag: '🇦🇹' },
  { code: 'DE', name: 'Nemačka', flag: '🇩🇪' },
  { code: 'CH', name: 'Švajcarska', flag: '🇨🇭' },
  { code: 'GB', name: 'Velika Britanija', flag: '🇬🇧' },
  { code: 'US', name: 'SAD', flag: '🇺🇸' },
]
