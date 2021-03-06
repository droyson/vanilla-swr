import { Observable } from '../src/observable'
import { SWRConfiguration } from '../src/types'
import { asyncNextTick } from './_testHelper'

describe('observable', function () {
  const key = 'key'
  const options = {}
  let fetcher: jest.Mock
  beforeEach(() => {
    fetcher = jest.fn()
  })

  test('should return object of type SWRObservable', () => {
    const observable = new Observable(key, fetcher, options)
    expect('watch' in observable).toBeTruthy()
  })

  test('should return object of type SWRWatcher when watch is called on SWRObservable', () => {
    const observable = new Observable(key, fetcher, options)
    const watcher = observable.watch(() => null)
    expect('unwatch' in watcher).toBeTruthy()
  })

  describe('validating fetcher calls', function () {
    test('should call fetcher with key when callback is added to watch', () => {
      const observable = new Observable(key, fetcher, options)
      observable.watch(() => null)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(fetcher).toHaveBeenCalledWith('key')
    })
  
    test('should call fetcher with all values of array as args when key is an array', () => {
      const arrayKey = ['key', 'arg1', 'arg2']
      const observable = new Observable(arrayKey, fetcher, options)
      observable.watch(() => null)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(fetcher).toHaveBeenCalledWith(...arrayKey)
    })
  
    test('should call fetcher with the value returned by key when key is function', () => {
      const keyFn = () => 'key'
      const observable = new Observable(keyFn, fetcher, options)
      observable.watch(() => null)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(fetcher).toHaveBeenCalledWith('key')
    })
  
    test('should not call fetcher when key throws an error or returns null', () => {
      const keyFn1 = () => { throw new Error('key error') }
      const observable1 = new Observable(keyFn1, fetcher, options)
      observable1.watch(() => null)
      expect(fetcher).not.toHaveBeenCalled()
      const keyFn2 = () => null
      const observable2 = new Observable(keyFn2, fetcher, options)
      observable2.watch(() => null)
      expect(fetcher).not.toHaveBeenCalled()
    })

    test('should call fetcher only once when multiple watch callbacks registered within dedupingInterval', () => {
      jest.useFakeTimers('modern')
      const observable = new Observable(key, fetcher, { dedupingInterval: 200 })
      observable.watch(() => null)
      jest.setSystemTime(Date.now() + 190)
      observable.watch(() => null)
      expect(fetcher).toBeCalledTimes(1)
      jest.setSystemTime(Date.now() + 201)
      observable.watch(() => null)
      expect(fetcher).toBeCalledTimes(2)
    })
  })

  describe('validating watch callbacks', function () {
    test('should call all watch callbacks with the stored data and error values when a watch is added', async () => {
      jest.useFakeTimers('modern')
      const observable = new Observable(key, fetcher, options)
      fetcher.mockReturnValueOnce('data 1')
      const watchCb1 = jest.fn()
      observable.watch(watchCb1)
      expect(watchCb1).toBeCalledTimes(1)
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: undefined,
        error: undefined,
        isValidating: true
      }))
      await asyncNextTick()
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: 'data 1',
        error: undefined,
        isValidating: false
      }))
      const watchCb2 = jest.fn()
      fetcher.mockReturnValueOnce('data 2')
      jest.setSystemTime(Date.now() + 2001)
      observable.watch(watchCb2)
      expect(watchCb2).toBeCalledWith(expect.objectContaining({
        data: 'data 1',
        error: undefined,
        isValidating: true
      }))
      await asyncNextTick()
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: 'data 2',
        error: undefined,
        isValidating: false
      }))
      expect(watchCb2).toBeCalledWith(expect.objectContaining({
        data: 'data 2',
        error: undefined,
        isValidating: false
      }))
    })

    test('should not call watch callbacks when value returned by fetcher is same as previous data', async () => {
      jest.useFakeTimers('modern')
      const observable = new Observable(key, fetcher, options)
      fetcher.mockReturnValue('data 1')
      const watchCb1 = jest.fn()
      observable.watch(watchCb1)
      expect(watchCb1).toBeCalledTimes(1)
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: undefined,
        error: undefined,
        isValidating: true
      }))
      await asyncNextTick()
      expect(watchCb1).toBeCalledTimes(2)
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: 'data 1',
        error: undefined,
        isValidating: false
      }))
      const watchCb2 = jest.fn()
      jest.setSystemTime(Date.now() + 2001)
      observable.watch(watchCb2)
      expect(watchCb1).toBeCalledTimes(2)
      expect(watchCb2).toBeCalledTimes(1)
      expect(watchCb2).toBeCalledWith(expect.objectContaining({
        data: 'data 1',
        error: undefined,
        isValidating: true
      }))
      await asyncNextTick()
      expect(watchCb2).toBeCalledTimes(1)
    })

    test('should call watch callback with the error thrown by fetcher', async () => {
      const observable = new Observable(key, fetcher, options)
      const fetcherError = new Error('fetcher error')
      fetcher.mockImplementationOnce(() => {throw fetcherError})
      const watchCb1 = jest.fn()
      observable.watch(watchCb1)
      await asyncNextTick()
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: undefined,
        error: fetcherError,
        isValidating: false
      }))
    })

    test('should call watch callback with data received when fetcher is resolved', async () => {
      const observable = new Observable(key, fetcher, options)
      fetcher.mockResolvedValue('resolved data 1')
      const watchCb1 = jest.fn()
      observable.watch(watchCb1)
      await asyncNextTick()
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: 'resolved data 1',
        error: undefined,
        isValidating: false
      }))
    })

    test('should call watch callback with error received when fetcher is rejected', async () => {
      const observable = new Observable(key, fetcher, options)
      const fetcherError = new Error('fetcher error')
      fetcher.mockRejectedValue(fetcherError)
      const watchCb1 = jest.fn()
      observable.watch(watchCb1)
      await asyncNextTick()
      await asyncNextTick() // waiting 2 ticks seems to resolve correctly. Need to figure out why?
      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: undefined,
        error: fetcherError,
        isValidating: false
      }))
    })
  })

  describe('unwatch', function () {
    test('should not call watch callback once unwatch is called on a particular watcher', async () => {
      jest.useFakeTimers('modern')
      const observable = new Observable(key, fetcher, options)
      let counter = 0
      fetcher.mockImplementation(() => counter++)
      const watchCb1 = jest.fn()
      const watchCb2 = jest.fn()
      const watchCb3 = jest.fn()
      const watcher1 = observable.watch(watchCb1)
      jest.setSystemTime(Date.now() + 2001)
      observable.watch(watchCb2)
      expect(watchCb1).toBeCalledTimes(1)
      await asyncNextTick()
      // first time watchCb1 called with undefined, hence `+ 1`
      expect(watchCb1).toBeCalledTimes(3)
      expect(watchCb2).toBeCalledTimes(3)
      watcher1.unwatch()
      jest.setSystemTime(Date.now() + 2001)
      observable.watch(watchCb3)
      await asyncNextTick()
      expect(watchCb1).toBeCalledTimes(3)
      expect(watchCb2).toBeCalledTimes(4)
      expect(watchCb3).toBeCalledTimes(2)
    })
  })

  describe('SWRConfigurations', function () {
    describe('fallbackData', function () {
      const fallbackOptions = {
        fallbackData: 'fallback value'
      }
      test('should return fallbackData on initial call', () => {
        const observable = new Observable(key, fetcher, fallbackOptions)
        const watchCb = jest.fn()
        observable.watch(watchCb)
        expect(watchCb).toBeCalledWith(expect.objectContaining({
          data: fallbackOptions.fallbackData,
          error: undefined,
          isValidating: true
        }))
      })

      test('should return fallbackData when fetcher throws an error', async () => {
        const observable = new Observable(key, fetcher, fallbackOptions)
        const fetcherError = new Error('fetcher error')
        fetcher.mockRejectedValue(fetcherError)
        const watchCb = jest.fn()
        observable.watch(watchCb)
        expect(watchCb).toBeCalledWith(expect.objectContaining({
          data: fallbackOptions.fallbackData,
          error: undefined,
          isValidating: true
        }))
        await asyncNextTick()
        await asyncNextTick()
        expect(watchCb).toBeCalledWith(expect.objectContaining({
          data: fallbackOptions.fallbackData,
          error: fetcherError,
          isValidating: false
        }))
      })
    })

    describe('error handling', function () {
      test('should retry on error, since it\'s default behaviour', async () => {
        jest.useFakeTimers('modern')
        const observable = new Observable(key, fetcher, options)
        const watchCb = jest.fn()
        const fetcherError = new Error('fetcher error')
        fetcher.mockRejectedValueOnce(fetcherError).mockResolvedValue('resolved value')
        observable.watch(watchCb)
        await asyncNextTick()
        await asyncNextTick()
        expect(watchCb).toHaveBeenLastCalledWith(expect.objectContaining({
          data: undefined,
          error: fetcherError,
          isValidating: false
        }))
        jest.runOnlyPendingTimers()
        await asyncNextTick()
        expect(watchCb).toHaveBeenLastCalledWith(expect.objectContaining({
          data: 'resolved value',
          error: undefined,
          isValidating: false
        }))
      })

      test('should not retry on error when shouldRetryOnError is set to false', async () => {
        jest.useFakeTimers('modern')
        const observable = new Observable(key, fetcher, { shouldRetryOnError: false })
        const watchCb = jest.fn()
        const fetcherError = new Error('fetcher error')
        fetcher.mockRejectedValueOnce(fetcherError).mockResolvedValue('resolved value')
        observable.watch(watchCb)
        await asyncNextTick()
        await asyncNextTick()
        expect(watchCb).toHaveBeenLastCalledWith(expect.objectContaining({
          data: undefined,
          error: fetcherError,
          isValidating: false
        }))
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(1)
      })

      test('should let onErrorRetry handle retry logic when this option is provided', async () => {
        jest.useFakeTimers('modern')
        const onErrorRetry = jest.fn()
        const customErrorOptions = { onErrorRetry }
        const observable = new Observable(key, fetcher, customErrorOptions)
        const fetcherError = new Error('fetcher error')
        fetcher.mockRejectedValueOnce(fetcherError).mockResolvedValue('resolved value')
        const watchCb = jest.fn()
        observable.watch(watchCb)
        await asyncNextTick()
        await asyncNextTick()
        expect(onErrorRetry).toBeCalled()
        const revalidate = onErrorRetry.mock.calls[0][3]
        revalidate()
        await asyncNextTick()
        expect(watchCb).toHaveBeenLastCalledWith(expect.objectContaining({
          data: 'resolved value',
          error: undefined,
          isValidating: false
        }))
      })
    })

    describe('onSuccess and onError hooks', function () {
      const hookOptions = {
        onSuccess: jest.fn(),
        onError: jest.fn()
      }
      test('should call onSuccess hook on success with data and key', async () => {
        jest.useFakeTimers('modern')
        const observable = new Observable(key, fetcher, hookOptions)
        const fetcherError = new Error('fetcher error')
        fetcher.mockRejectedValueOnce(fetcherError).mockResolvedValue('data')
        const watchCb = jest.fn()
        observable.watch(watchCb)
        await asyncNextTick()
        await asyncNextTick()
        expect(hookOptions.onError).toBeCalled()
        jest.runOnlyPendingTimers()
        await asyncNextTick()
        expect(hookOptions.onSuccess).toBeCalled()
      })
    })

    describe('revalidation handling', function () {
      test('should not revalidate on adding a watcher if revalidateOnWatch is set to false and value is defined', async () => {
        jest.useFakeTimers('modern')
        const customOptions: SWRConfiguration<any, any> = {
          revalidateOnWatch: false
        }

        const observable = new Observable(key, fetcher, customOptions)
        fetcher.mockRejectedValueOnce('fetcher failed').mockResolvedValue('fetcher resolved')
        observable.watch(() => null)
        await asyncNextTick()
        await asyncNextTick()
        observable.watch(() => null)
        await asyncNextTick()
        // will call revalidate if value is not defined
        expect(fetcher).toBeCalledTimes(2)
        jest.runOnlyPendingTimers()
        await asyncNextTick()
        observable.watch(() => null)
        expect(fetcher).toBeCalledTimes(3)
      })

      test('should revalidate on focus', async () => {
        const observable = new Observable(key, fetcher, options)
        fetcher.mockResolvedValue('resolved value')
        observable.watch(() => null)
        expect(fetcher).toBeCalledTimes(1)
        await asyncNextTick()
        // revalidate on visibilitychange event
        const visibilityStateSpy = jest.spyOn(document, 'visibilityState', 'get')
        visibilityStateSpy.mockReturnValue('hidden')
        document.dispatchEvent(new Event('visibilitychange'))
        visibilityStateSpy.mockReturnValue('visible')
        document.dispatchEvent(new Event('visibilitychange'))
        expect(fetcher).toBeCalledTimes(2)
        await asyncNextTick()
        // revalidate on window focus change
        visibilityStateSpy.mockReturnValue('hidden')
        window.dispatchEvent(new Event('focus'))
        visibilityStateSpy.mockReturnValue('visible')
        window.dispatchEvent(new Event('focus'))
        expect(fetcher).toBeCalledTimes(3)
      })

      test('should not revalidate on focus when revalidateOnFocus flag is set to false', async () => {
        const customOptions: SWRConfiguration<any, any> = {
          revalidateOnFocus: false
        }
        fetcher.mockResolvedValue('resolved value')
        const observable = new Observable(key, fetcher, customOptions)
        observable.watch(() => null)
        expect(fetcher).toBeCalledTimes(1)
        await asyncNextTick()
        // revalidate on visibilitychange event
        const visibilityStateSpy = jest.spyOn(document, 'visibilityState', 'get')
        visibilityStateSpy.mockReturnValue('hidden')
        document.dispatchEvent(new Event('visibilitychange'))
        visibilityStateSpy.mockReturnValue('visible')
        document.dispatchEvent(new Event('visibilitychange'))
        expect(fetcher).toBeCalledTimes(1)
        await asyncNextTick()
        // revalidate on window focus change
        visibilityStateSpy.mockReturnValue('hidden')
        window.dispatchEvent(new Event('focus'))
        visibilityStateSpy.mockReturnValue('visible')
        window.dispatchEvent(new Event('focus'))
        expect(fetcher).toBeCalledTimes(1)
      })

      test('should revalidate on reconnect', async () => {
        const observable = new Observable(key, fetcher, options)
        fetcher.mockResolvedValue('resolved value')
        observable.watch(() => null)
        expect(fetcher).toBeCalledTimes(1)
        await asyncNextTick()
        window.dispatchEvent(new Event('offline'))
        window.dispatchEvent(new Event('online'))
        expect(fetcher).toBeCalledTimes(2)
      })

      test('should not revalidate on reconnect when revalidateOnReconnect is set to false', async () => {
        const customOptions: SWRConfiguration<any, any> = {
          revalidateOnReconnect: false
        }
        const observable = new Observable(key, fetcher, customOptions)
        fetcher.mockResolvedValue('resolved value')
        observable.watch(() => null)
        expect(fetcher).toBeCalledTimes(1)
        await asyncNextTick()
        window.dispatchEvent(new Event('offline'))
        window.dispatchEvent(new Event('online'))
        expect(fetcher).toBeCalledTimes(1)
      })
    })

    describe('refresh handling', function () {
      test('should poll fetcher when refreshInterval is specified', async () => {
        jest.useFakeTimers('modern')
        const customOptions: SWRConfiguration<any, any> = {
          refreshInterval: 100
        }
        const observable = new Observable(key, fetcher, customOptions)
        fetcher.mockResolvedValue('resolved value')
        observable.watch(() => null)
        await asyncNextTick()
        expect(fetcher).toBeCalledTimes(1)
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(2)
      })

      test('should stop polling when hidden or offline and resume when back', async () => {
        jest.useFakeTimers('modern')
        const customOptions: SWRConfiguration<any, any> = {
          refreshInterval: 100
        }
        const observable = new Observable(key, fetcher, customOptions)
        fetcher.mockResolvedValue('resolved value')
        observable.watch(() => null)
        await asyncNextTick()
        expect(fetcher).toBeCalledTimes(1)
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(2)
        await asyncNextTick()
        const visibilityStateSpy = jest.spyOn(document, 'visibilityState', 'get')
        visibilityStateSpy.mockReturnValue('hidden')
        document.dispatchEvent(new Event('visibilitychange'))
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(2)
        visibilityStateSpy.mockReturnValue('visible')
        document.dispatchEvent(new Event('visibilitychange'))
        expect(fetcher).toBeCalledTimes(3)
        await asyncNextTick()
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(4)
        await asyncNextTick()
        window.dispatchEvent(new Event('offline'))
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(4)
        await asyncNextTick()
        window.dispatchEvent(new Event('online'))
        expect(fetcher).toBeCalledTimes(5)
        await asyncNextTick()
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(6)
        await asyncNextTick()
        visibilityStateSpy.mockReturnValue('hidden')
        window.dispatchEvent(new Event('focus'))
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(6)
        visibilityStateSpy.mockReturnValue('visible')
        document.dispatchEvent(new Event('visibilitychange'))
        expect(fetcher).toBeCalledTimes(7)
        await asyncNextTick()
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(8)
      })

      test('should not stop polling when hidden or offline when refreshWhenHidden and refreshWhenOffline flag is true', async () => {
        jest.useFakeTimers('modern')
        const customOptions: SWRConfiguration<any, any> = {
          refreshInterval: 100,
          refreshWhenOffline: true,
          refreshWhenHidden: true
        }
        const observable = new Observable(key, fetcher, customOptions)
        fetcher.mockResolvedValue('resolved value')
        observable.watch(() => null)
        await asyncNextTick()
        expect(fetcher).toBeCalledTimes(1)
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(2)
        await asyncNextTick()
        const visibilityStateSpy = jest.spyOn(document, 'visibilityState', 'get')
        visibilityStateSpy.mockReturnValue('hidden')
        document.dispatchEvent(new Event('visibilitychange'))
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(3)
        await asyncNextTick()
        visibilityStateSpy.mockReturnValue('visible')
        document.dispatchEvent(new Event('visibilitychange'))
        expect(fetcher).toBeCalledTimes(4)
        await asyncNextTick()
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(5)
        await asyncNextTick()
        window.dispatchEvent(new Event('offline'))
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(6)
        await asyncNextTick()
        window.dispatchEvent(new Event('online'))
        expect(fetcher).toBeCalledTimes(7)
        await asyncNextTick()
        jest.runOnlyPendingTimers()
        expect(fetcher).toBeCalledTimes(8)
      })
    })
  })

  describe('mutate', function () {
    test('should fetch values again and update the watcher when mutate is called', async () => {
      const observable = new Observable(key, fetcher, options)
      fetcher.mockResolvedValue('value 1')
      const watchCb1 = jest.fn()
      const watchCb2 = jest.fn()
      observable.watch(watchCb1)
      observable.watch(watchCb2)
      await asyncNextTick()
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(watchCb1).toHaveBeenCalledTimes(2)
      expect(watchCb2).toHaveBeenCalledTimes(2)
      fetcher.mockResolvedValue('value 2')
      observable.mutate()
      await asyncNextTick()
      expect(fetcher).toHaveBeenCalledTimes(2)
      expect(watchCb1).toHaveBeenCalledTimes(3)
      expect(watchCb2).toHaveBeenCalledTimes(3)
      expect(watchCb1).toHaveBeenLastCalledWith(expect.objectContaining({
        data: 'value 2',
        error: undefined,
        isValidating: false
      }))
    })

    test('should fetch values again with updated options when mutate is called', async () => {
      const observable = new Observable(key, fetcher, options)
      fetcher.mockResolvedValue('value 1')
      const watchCb1 = jest.fn()
      const watchCb2 = jest.fn()
      observable.watch(watchCb1)
      observable.watch(watchCb2)
      await asyncNextTick()
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(watchCb1).toHaveBeenCalledTimes(2)
      expect(watchCb2).toHaveBeenCalledTimes(2)
      fetcher.mockResolvedValue('value 2')
      const newOptions: SWRConfiguration<any, any> = {
        onSuccess: jest.fn()
      }
      observable.mutate(newOptions)
      await asyncNextTick()
      expect(fetcher).toHaveBeenCalledTimes(2)
      expect(watchCb1).toHaveBeenCalledTimes(3)
      expect(watchCb2).toHaveBeenCalledTimes(3)
      expect(watchCb1).toHaveBeenLastCalledWith(expect.objectContaining({
        data: 'value 2',
        error: undefined,
        isValidating: false
      }))
      expect(newOptions.onSuccess).toHaveBeenLastCalledWith('value 2', key, expect.objectContaining(newOptions))
    })
  })

  describe('setting fetcher', function () {
    test('should return Observable when fetcher is not passed', () => {
      const observable = new Observable(key)
      expect('watch' in observable).toBeTruthy()
    })

    test('should not throw when watch is called and fetcher is present', () => {
      const observable = new Observable(key)
      const watchCb1 = jest.fn()
      try {
        observable.watch(watchCb1)
      } catch (err) {
        console.log('threw an error', err)
        throw err
      }

      expect(watchCb1).toBeCalledWith(expect.objectContaining({
        data: undefined,
        error: undefined,
        isValidating: false
      }))
    })

    test('should call watcher with resolved value from fetcher once it is set and mutate is called', async () => {
      const observable = new Observable(key)
      const watchCb1 = jest.fn()
      observable.watch(watchCb1)
      fetcher.mockReturnValueOnce('data 1')
      observable.setFetcher(fetcher)
      observable.mutate()
      await asyncNextTick()
      expect(watchCb1).toHaveBeenLastCalledWith(expect.objectContaining({
        data: 'data 1',
        error: undefined,
        isValidating: false
      }))
    })

    describe('updating fetcher', function () {
      test('should not override fetcher when override flag is not passed', async () => {
        fetcher.mockReturnValueOnce('fetcher 1 data')
        const observable = new Observable(key, fetcher)
        const fetcher2 = jest.fn().mockReturnValueOnce('fetcher 2 data')
        observable.setFetcher(fetcher2)
        const watchCb = jest.fn()
        observable.watch(watchCb)
        await asyncNextTick()
        expect(watchCb).toHaveBeenLastCalledWith(expect.objectContaining({
          data: 'fetcher 1 data',
          error: undefined,
          isValidating: false
        }))
      })

      test('should override fetcher when override flag is true', async () => {
        fetcher.mockReturnValueOnce('fetcher 1 data')
        const observable = new Observable(key, fetcher)
        const fetcher2 = jest.fn().mockReturnValueOnce('fetcher 2 data')
        observable.setFetcher(fetcher2, true)
        const watchCb = jest.fn()
        observable.watch(watchCb)
        await asyncNextTick()
        expect(watchCb).toHaveBeenLastCalledWith(expect.objectContaining({
          data: 'fetcher 2 data',
          error: undefined,
          isValidating: false
        }))
      })
    })
  })
})
