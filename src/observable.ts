import { deepEqual, isFunction, noop } from './helper'
import { Fetcher, Key, PublicConfiguration, SWRConfiguration, SWRObservable, SWRResponse, SWRWatcher, watchCallback } from './types'

const defaultConfiguration: PublicConfiguration<any, any> = {
  compare: deepEqual,
  dedupingInterval: 2000,
  fallbackData: undefined,
  onSuccess: noop,
  onError: noop,
  shouldRetryOnError: true,
  errorRetryInterval: 5000,
  errorRetryCount: 5,
  refreshInterval: 0,
  revalidateOnWatch: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshWhenHidden: false,
  refreshWhenOffline: false
}

export class Observable<Data = any, Error = any> implements SWRObservable<Data, Error> {
  private _watchers: Watcher<Data, Error>[]
  private _keyIsFunction: boolean
  private _key: Key
  private _fetcher: Fetcher<Data>
  private _options: PublicConfiguration<Data, Error>
  private _data: Data | undefined = undefined
  private _error: Error | undefined = undefined
  private _isValidating = false
  private _lastFetchTs = 0
  private _errorRetryCounter = 0
  private _online = true
  private _timer: any
  constructor(key: Key, fetcher: Fetcher<Data>, options: SWRConfiguration<Data, Error>) {
    this._watchers = []
    this._key = key
    this._fetcher = fetcher
    this._options = {...defaultConfiguration, ...options}
    this._data = this._options.fallbackData
    this._keyIsFunction = isFunction(key)
    this._online = typeof navigator?.onLine === 'boolean' ? navigator.onLine : true
    if (this._options.revalidateOnFocus) {
      this._initFocus()
    }
    if (this._options.revalidateOnReconnect) {
      this._initReconnect()
    }
  }

  private get response (): SWRResponse<Data, Error> {
    return {
      data: this._data,
      error: this._error,
      isValidating: this._isValidating
    }
  }

  watch (fn: watchCallback<Data, Error>): SWRWatcher {
    const watcher = new Watcher(fn)
    this._watchers.push(watcher)
    if (this._options.revalidateOnWatch || this._data === undefined) {
      this._callFetcher()
    }
    try {
      fn(this.response)
    } catch (err) {
      // no-op
    }
    return watcher
  }

  private _callWatchers():void {
    const removedIndices: number[] = []
    for (const index in this._watchers) {
      const watcher = this._watchers[index]
      if (typeof watcher._callback === 'function') {
        try {
          watcher._callback(this.response)
        } catch (err) {
          // no-op
        }
      } else {
        removedIndices.push(parseInt(index))
      }
    }
    for (const index of removedIndices) {
      this._watchers.splice(index, 1)
    }
  }

  private _callFetcher ():void {
    const now = Date.now()
    if ((now - this._lastFetchTs) < this._options.dedupingInterval) {
      return
    }
    this._lastFetchTs = now
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
        Promise.resolve(this._fetcher.apply(this._fetcher, key)).then(data => {
          const previousData = this._data
          this._data = data as Data
          this._error = undefined
          this._isValidating = false
          const onSuccess = this._options.onSuccess
          onSuccess.apply(onSuccess, [data, key[0], this._options])
          if (!this._options.compare(previousData, data)) {
            this._callWatchers()
          }
          this._lastFetchTs = 0
          this._errorRetryCounter = 0
          if (this._options.refreshInterval > 0) {
            this._timer = setTimeout(() => {
              this._callFetcher()
            }, this._options.refreshInterval)
          }
        }).catch((err) => this._errorHandler(err, key[0]))
      } catch (err) {
        this._errorHandler(err, key[0])
      }
    }
  }

  private _errorHandler (err: unknown, key: string) {
    this._data = this._options.fallbackData
    this._error = err as Error
    this._isValidating = false
    this._lastFetchTs = 0
    const onError = this._options.onError
    onError.apply(onError, [this._error, key, this._options])
    this._callWatchers()
    if (this._options.shouldRetryOnError && this._errorRetryCounter < this._options.errorRetryCount) {
      if (this._options.onErrorRetry) {
        const revalidateOptions = {
          retryCount: this._errorRetryCounter++
        }
        this._options.onErrorRetry(this._error, key, this._options, this._callFetcher.bind(this), revalidateOptions)
      } else {
        // Exponential back-off
        const timeout = ~~((Math.random() + 0.5) * (1 << Math.min(this._errorRetryCounter, 8))) * this._options.errorRetryInterval
        setTimeout(() => {
          this._errorRetryCounter++
          this._callFetcher()
        }, timeout)
      }
    }
  }

  private _isVisible (): boolean {
    return document?.visibilityState !== 'hidden'
  }

  private _initFocus () {
    if (typeof document?.addEventListener === 'function') {
      document.addEventListener('visibilitychange', () => {
        if (this._isVisible()) {
          this._callFetcher()
        } else if (this._timer && !this._options.refreshWhenHidden) {
          clearTimeout(this._timer)
        }
      })
    }

    if (typeof window?.addEventListener === 'function') {
      window.addEventListener('focus', () => {
        if (this._isVisible()) {
          this._callFetcher()
        } else if (this._timer && !this._options.refreshWhenHidden) {
          clearTimeout(this._timer)
        }
      })
    }
  }

  private _initReconnect () {
    if (typeof window?.addEventListener === 'function') {
      window.addEventListener('online', () => {
        this._online = true
        this._callFetcher()
      })
      window.addEventListener('offline', () => {
        this._online = false
        if (this._timer && !this._options.refreshWhenOffline) {
          clearTimeout(this._timer)
        }
      })
    }
  }
}

class Watcher<Data, Error> implements SWRWatcher {
  _callback: watchCallback<Data, Error> | null;
  constructor(fn: watchCallback<Data, Error>) {
    this._callback = fn
  }

  unwatch ():void {
    this._callback = null
  }
}
