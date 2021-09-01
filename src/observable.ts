import { isFunction } from './helper'
import { Fetcher, Key, SWRConfiguration, SWRObservable, SWRWatcher, watchCallback } from './types'

export class Observable<Data, Error> implements SWRObservable<Data, Error> {
  private _watchers: Watcher<Data, Error>[]
  private _keyIsFunction: boolean
  private _key: Key
  private _fetcher: Fetcher<Data>
  private _options: SWRConfiguration
  constructor(key: Key, fetcher: Fetcher<Data>, options: SWRConfiguration) {
    this._watchers = []
    this._key = key
    this._fetcher = fetcher
    this._options = options
    this._keyIsFunction = isFunction(key)
  }

  watch (fn: watchCallback<Data, Error>): SWRWatcher {
    const watcher = new Watcher(fn)
    this._watchers.push(watcher)
    return watcher
  }
}

class Watcher<Data, Error> implements SWRWatcher {
  _callback;
  constructor(fn: watchCallback<Data, Error>) {
    this._callback = fn
  }

  unwatch ():void {
    // todo: unwatch handler
  }
}
