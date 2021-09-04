import { Observable } from '../src/observable'
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

    // describe('refresh', function () {
    //   test('should call refresh ')
    // })
  })
})
