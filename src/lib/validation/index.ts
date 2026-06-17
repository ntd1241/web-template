/** Shared validation builders for forms (docs/01 §8). */
export {
  formatMessage,
  getValidationLocale,
  setValidationLocale,
} from './messages';
export { vEmail, vNumber, vPhoneVN, vRequiredEnum, vString } from './factories';
export type { MessageParams } from './messages';
export type { VNumberOptions, VStringOptions } from './factories';
