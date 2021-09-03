import { isFunction } from './helper'
import { Fetcher, Key, SWRConfiguration, SWRObservable, SWRResponse, SWRWatcher, watchCallback } from './types'

export class Observable<Data = any, Error = any> implements SWRObservable<Data, Error> {
  private _watchers: Watcher<Data, Error>[]
  private _keyIsFunction: boolean
  private _key: Key
  private _fetcher: Fetcher<Data>
  private _options: SWRConfiguration
  private _data: Data | undefined = undefined
  private _error: Error | undefined = undefined
  private _isValidating = false
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
    this._callFetcher()
    this._callWatchers()
    return watcher
  }

  private _callWatchers():void {
    const response: SWRResponse<Data, Error> = {
      data: this._data,
      error: this._error,
      isValidating: this._isValidating
    }
    for (const watcher of this._watchers) {
      if (typeof watcher._callback === 'function') {
        try {
          watcher._callback(response)
        } catch (err) {
          // no-op
        }
      }
    }
  }

  private _callFetcher ():void {
    let key: any = this._key
    if (this._keyIsFunction) {
      try {
        key = key()
      } catch (err) {
        key = null
      }
    }
    if (typeof key === 'string') {
      key = [key]
    }
    if (key !== null) {
      try {
        this._isValidating = true
        Promise.resolve(this._fetcher(...key)).then(data => {
          this._data = data as Data
          this._error = undefined
        }).catch(err => {
          this._data = undefined
          this._error = err as Error
        }).finally(() => {
          this._isValidating = false
          this._callWatchers()
        })
      } catch (err) {
        this._data = undefined
        this._error = err as Error
        this._isValidating = false
      }
    }
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
