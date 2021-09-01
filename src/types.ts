
export type ValueKey = string | any[] | null

export type Key = ValueKey | (() => ValueKey)

export type Fetcher<Data> = (...args: any[]) => Data | Promise<Data>

export interface PublicConfiguration {
  loadingTimeout: number
}

export type SWRConfiguration = Partial<PublicConfiguration>

export type SWRResponse<Data, Error> = {
  data?: Data,
  error?: Error
}

export type watchCallback<Data = any, Error = any> = (response: SWRResponse<Data, Error>) => any

export interface SWRWatcher {
  unwatch():void;
}

export interface SWRObservable<Data = any, Error = any> {
  watch(fn: watchCallback<Data, Error>):SWRWatcher;
}

export type Cache<Data = any> = {
  get (key: Key): Data | null | undefined,
  set (key: Key, value: Data): void,
  delete (key: Key): void
}
