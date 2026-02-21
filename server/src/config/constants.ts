export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 9,
  MAX_PAGE_SIZE: 50,

  // Cache TTL (seconds)
  CACHE_TTL_SHORT: 300,     // 5 minutes
  CACHE_TTL_MEDIUM: 600,    // 10 minutes
  CACHE_TTL_LONG: 3600,     // 1 hour

  // Auth
  BCRYPT_SALT_ROUNDS: 12,
  JWT_EXPIRES_IN: '15m',
  REFRESH_EXPIRES_IN: '7d',

  // Upload limits
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Project types
  PROJECT_TYPES: ['residential', 'commercial', 'hospitality', 'mixed', 'renovation'] as const,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  RATE_LIMIT_MAX: 200,
  CONTACT_RATE_LIMIT_MAX: 5,
  AUTH_RATE_LIMIT_MAX: 10,
} as const;