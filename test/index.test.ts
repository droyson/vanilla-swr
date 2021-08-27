
describe('testing index.ts', function () {
  test('console.log called in index.ts', async () => {
    const consoleSpy: jest.SpyInstance = jest.spyOn(global.console, 'log')
    await import('../src/index')
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('mainA'))
  })
})
