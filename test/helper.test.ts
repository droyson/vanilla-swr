import { isFunction, isObservable } from '../src/helper'
import { Observable } from '../src/observable'

describe('helper', function () {
  describe('isObservable', function () {
    test('should return true when object of type SWRObservable is passed', () => {
      const observable = new Observable('key', () => '', {})
      expect(isObservable(observable)).toBeTruthy()
    })

    test('should return false when parameter is null', () => {
      expect(isObservable(null)).toBeFalsy()
    })

    test('should return false when parameter is undefined', () => {
      expect(isObservable(undefined)).toBeFalsy()
    })
  })

  describe('isFunction', function () {
    test('should return true when parameter is function', () => {
      expect(isFunction(() => '')).toBeTruthy()
    })

    test('should return false when paramter is string or null or undefined', () => {
      expect(isFunction('key')).toBeFalsy()
      expect(isFunction([])).toBeFalsy()
    })
  })
})
