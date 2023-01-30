declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      HOST: string
      PORT: number
      DB_FILENAME: string
    }
  }
}

export {}
