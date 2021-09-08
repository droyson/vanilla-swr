import SWR from '../src/index'

describe('exporting front facing apis from index.ts', function () {
  // todo
  test('default export is function', () => {
    expect(SWR).toBeInstanceOf(Function)
  })
})
