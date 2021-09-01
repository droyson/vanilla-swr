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
})
