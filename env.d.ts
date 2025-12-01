/// <reference types="vite/client" />

import 'pinia'

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | {
      key?: string
      storage?: Storage
      paths?: string[]
    }
  }
}
