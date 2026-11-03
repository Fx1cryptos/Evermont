import { SITE_NAME, SITE_URL } from './site'

export const EVERMONT_FRONTEND = {
  name: SITE_NAME,
  type: 'Private Wealth & Digital Banking prototype',
  // Single canonical domain: public site and member portal are served from the same origin.
  primaryUrl: SITE_URL,
} as const
