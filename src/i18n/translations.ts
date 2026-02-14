// Re-export existing JS translations with a permissive type to enable gradual typing.
export type Locale = 'en' | 'ta'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Translations = Record<Locale, any>

// Import the JS dictionary (allowed via allowJs in tsconfig)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JS module without types
import translationsJS from './translations.js'
const dict = translationsJS as unknown as Translations
export default dict
