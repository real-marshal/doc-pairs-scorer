import { X_REQUEST_ID } from '@/constants/headers'

const config = {
  requestIdHeader: X_REQUEST_ID,
  logger:
    process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
          },
        }
      : process.env.NODE_ENV === 'production',
}

export default config
