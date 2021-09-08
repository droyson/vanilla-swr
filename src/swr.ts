import { isObservable } from './helper'
import { Observable } from './observable'
import { Cache, Fetcher, Key, SWRConfiguration, SWRObservable } from './types'

const cache: Cache<SWRObservable> = new Map<string, SWRObservable>()

const normalizeKey = (key: Key): string => {
  if (typeof key === 'string') {
    return key
  }
  if (typeof key?.toString === 'function') {
    return key.toString()
  }
  return ''
}

const swrHandler = <Data = any, Error = any>(key: Key, fetcher: Fetcher<Data>, options?: SWRConfiguration<Data, Error>): SWRObservable<Data, Error> => {
  const normalizedKey = normalizeKey(key)
  let observable = cache.get(normalizedKey)
  if (!isObservable(observable)) {
    if (typeof options === 'undefined') {
      options = {}
    }
    observable = new Observable(key, fetcher, options)
    cache.set(normalizedKey, observable)
  }
  
  return observable
}

export default swrHandler
