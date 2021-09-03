import { Observable } from '../src/observable'

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
  })

  describe('validating watch callbacks', function () {
    test('should call all watch callbacks with the stored data and error values when a watch is added', (done) => {
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
      process.nextTick(() => {
        expect(watchCb1).toBeCalledWith(expect.objectContaining({
          data: 'data 1',
          error: undefined,
          isValidating: false
        }))
        done()
      })
    })
  })
})
