import { isObservable } from './helper'
import { Observable } from './observable'
import { Cache, Fetcher, Key, SWRConfiguration, SWRObservable } from './types'

const cache: Cache<SWRObservable> = new Map<Key, SWRObservable>()

const swrHandler = <Data = any, Error = any>(key: Key, fetcher: Fetcher<Data>, options?: SWRConfiguration<Data, Error>): SWRObservable<Data, Error> => {
  let observable = cache.get(key)
  if (!isObservable(observable)) {
    if (typeof options === 'undefined') {
      options = {}
    }
    observable = new Observable(key, fetcher, options)
    cache.set(key, observable)
  }
  
  return observable
}

export default swrHandler
