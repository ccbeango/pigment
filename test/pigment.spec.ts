import pigment from '../src/index'

describe('你好i', () => {
  it('测试下', () => {
    expect(pigment.strip(pigment.red(`去除颜色`))).toBe('去除颜色')
  })
})
