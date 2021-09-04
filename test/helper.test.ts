import { deepEqual, isFunction, isObservable } from '../src/helper'
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

    test('should return false when parameter is string or null or undefined', () => {
      expect(isFunction('key')).toBeFalsy()
      expect(isFunction([])).toBeFalsy()
    })
  })

  describe('deepEqual', function () {
    function same (a: unknown, b: unknown) {
      expect(deepEqual(a, b)).toBeTruthy()
    }

    function different (a: unknown, b: unknown) {
      expect(deepEqual(a, b)).toBeFalsy()
    }

    test('scalars', () => {
      same(1, 1)
      different(1, 2)
      different(1, [])
      different(1, '1')
      same(Infinity, Infinity)
      different(Infinity, -Infinity)
      different(NaN, undefined)
      different(NaN, null)
      same(NaN, NaN)
      different(1, -1)
      same(0, -0)

      same(null, null)
      same(void 0, undefined)
      same(undefined, undefined)
      different(null, undefined)
      different('', null)
      different(0, null)

      same(true, true)
      same(false, false)
      different(true, false)
      different(0, false)
      different(1, true)

      same('a', 'a')
      different('a', 'b')
    })

    test('objects', () => {
      same({}, {})
      same({ a:1, b:2 }, { a:1, b:2 })
      same({ b:2, a:1 }, { a:1, b:2 })

      different({ a:1, b:2, c:[] }, { a:1, b:2 })
      different({ a:1, b:2 }, { a:1, b:2, c:[] })
      different({ a:1, c:3 }, { a:1, b:2 })

      same({ a:[{ b:1 }] }, { a:[{ b:1 }] })
      different({ a:[{ b:2 }] }, { a:[{ b:1 }] })
      different({ a:[{ c:1 }] }, { a:[{ b:1 }] })

      different([], {})
      different({}, [])
      different({}, null)
      different({}, undefined)

      different({ a:void 0 }, {})
      different({}, { a:undefined })
      different({ a:undefined }, { b:undefined })

      const foo = Object.create(null)
      const bar = Object.create(null)
      same(foo, bar)

      foo.hello = 'world'
      different(foo, bar)
    })

    test('arrays', () => {
      same([], [])
      same([1,2,3], [1,2,3])
      different([1,2,4], [1,2,3])
      different([1,2], [1,2,3])

      same([{ a:1 }, { b:2 }], [{ a:1 }, { b:2 }])
      different([{ a:2 }, { b:2 }], [{ a:1 }, { b:2 }])

      different({ '0':0, '1':1, length:2 }, [0, 1])
    })

    test('date', () => {
      same(
        new Date('2021-09-04T07:56:03.434Z'),
        new Date('2021-09-04T07:56:03.434Z')
      )
    
      different(
        new Date('2021-09-04T07:56:03.434Z'),
        new Date('2021-09-04T00:00:00.000Z')
      )
    
      different(
        new Date('2021-09-04T07:56:03.434Z'),
        '2021-09-04T07:56:03.434Z'
      )
    
      different(
        new Date('2021-09-04T07:56:03.434Z'),
        1430518578234
      )
    
      different(
        new Date('2021-09-04T07:56:03.434Z'),
        {}
      )
    })

    test('regexps', () => {
      same(/foo/, /foo/)
      same(/foo/i, /foo/i)
    
      different(/foo/, /bar/)
      different(/foo/, /foo/i)
    
      different(/foo/, 'foo')
      different(/foo/, {})
    })

    test('functions', () => {
      const foo = () => null
      const bar = () => null
    
      same(foo, foo)
      different(foo, bar)
      different(foo, () => null)
    })
  })
})
