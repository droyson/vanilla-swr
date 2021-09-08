import { mocked } from 'ts-jest/utils'
import swrHandler from '../src/swr'
import { Observable } from '../src/observable'
import { MockedObject } from 'ts-jest/dist/utils/testing'

jest.mock('../src/observable')

describe('swrHandler', function () {
  const key = 'key'
  const options = {}
  let fetcher: jest.Mock
  let mockedObservable: MockedObject<typeof Observable>

  beforeEach(() => {
    fetcher = jest.fn()
    mockedObservable = mocked(Observable)
  })

  test('should accept key, fetcher and options and return SWRObservable', () => {
    const observable = swrHandler(key, fetcher, options)
    expect(mockedObservable).toHaveBeenCalledTimes(1)
    expect('watch' in observable).toBeTruthy()
  })

  test('should return same observable for same string key', () => {
    const observable1 = swrHandler(key, fetcher, options)
    const observable2 = swrHandler(key, fetcher, options)
    const observable3 = swrHandler('key 2', fetcher, options)
    expect(observable1).toBe(observable2)
    expect(observable3).not.toBe(observable1)
  })

  test('should return same observable for same function key', () => {
    const keyFn = () => key
    const observable1 = swrHandler(keyFn, fetcher, options)
    const observable2 = swrHandler(keyFn, fetcher, options)
    const observable3 = swrHandler(() => 'key 2', fetcher, options)
    expect(observable1).toBe(observable2)
    expect(observable3).not.toBe(observable1)
  })

  test('should provide empty object when options is not provided', () => {
    const noOptionKey = 'no options key'
    swrHandler(noOptionKey, fetcher)
    expect(mockedObservable).toHaveBeenLastCalledWith(noOptionKey, fetcher, expect.objectContaining({}))
  })
})
