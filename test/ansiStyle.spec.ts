import ansiStyles from '../src/ansiStyle'

describe('测试 generateAliasStyles', () => {
  it('返回ANSI转换码', () => {
    expect(ansiStyles.green.open).toBe('\u001B[32m')
    expect(ansiStyles.green.close).toBe('\u001B[39m')
    expect(ansiStyles.bgGray.open).toBe(ansiStyles.bgGrey.open)
  })

  it('ansiStyles下的code等于ansiStyles.modifer、color、bgColor下的code', () => {
    expect(ansiStyles.modifier.bold).toBe(ansiStyles.bold)
    expect(ansiStyles.color.red).toBe(ansiStyles.red)
    expect(ansiStyles.bgColor.bgBlue).toBe(ansiStyles.bgBlue)
  })

  it('modifer、color、bgColor不可枚举', () => {
    expect(
      Object.getOwnPropertyDescriptor(ansiStyles, 'modifier')
    ).not.toBeUndefined()
    expect(Object.keys(ansiStyles)).not.toContain('modifier')
  })
})

describe('generateCustomStyles 自定义传值ANSI颜色码', () => {
  it('styles.[color|bgColor].[ansi|ansi256|ansi16m]', () => {
    expect(ansiStyles.color.ansi(31)).toBe('\u001B[31m')
    expect(ansiStyles.color.ansi256(31)).toBe('\u001B[38;5;31m')
    expect(ansiStyles.color.ansi16m(31, 100, 20)).toBe('\u001B[38;2;31;100;20m')

    expect(ansiStyles.bgColor.ansi(31)).toBe('\u001B[41m')
    expect(ansiStyles.bgColor.ansi256(31)).toBe('\u001B[48;5;31m')
    expect(ansiStyles.bgColor.ansi16m(31, 100, 20)).toBe(
      '\u001B[48;2;31;100;20m'
    )
  })
})

describe('generateConvertColor 颜色转换函数', () => {
  it('支持颜色转Ansi 16色', () => {
    expect(ansiStyles.color.ansi(ansiStyles.rgbToAnsi(255, 255, 255))).toBe(
      '\u001B[97m'
    )
    expect(ansiStyles.color.ansi(ansiStyles.hexToAnsi('#990099'))).toBe(
      '\u001B[35m'
    )
    expect(ansiStyles.color.ansi(ansiStyles.hexToAnsi('#FF00FF'))).toBe(
      '\u001B[95m'
    )

    expect(ansiStyles.bgColor.ansi(ansiStyles.rgbToAnsi(255, 255, 255))).toBe(
      '\u001B[107m'
    )
    expect(ansiStyles.bgColor.ansi(ansiStyles.hexToAnsi('#990099'))).toBe(
      '\u001B[45m'
    )
    expect(ansiStyles.bgColor.ansi(ansiStyles.hexToAnsi('#FF00FF'))).toBe(
      '\u001B[105m'
    )
  })

  it('支持颜色转ansi 256色', () => {
    expect(
      ansiStyles.color.ansi256(ansiStyles.rgbToAnsi256(255, 255, 255))
    ).toBe('\u001B[38;5;231m')
    expect(ansiStyles.color.ansi256(ansiStyles.hexToAnsi256('#990099'))).toBe(
      '\u001B[38;5;127m'
    )
    expect(ansiStyles.color.ansi256(ansiStyles.hexToAnsi256('#FF00FF'))).toBe(
      '\u001B[38;5;201m'
    )

    expect(
      ansiStyles.bgColor.ansi256(ansiStyles.rgbToAnsi256(255, 255, 255))
    ).toBe('\u001B[48;5;231m')
    expect(ansiStyles.bgColor.ansi256(ansiStyles.hexToAnsi256('#990099'))).toBe(
      '\u001B[48;5;127m'
    )
    expect(ansiStyles.bgColor.ansi256(ansiStyles.hexToAnsi256('#FF00FF'))).toBe(
      '\u001B[48;5;201m'
    )
  })

  it('支持颜色转ansi 160万色', () => {
    expect(ansiStyles.color.ansi16m(...ansiStyles.hexToRgb('#990099'))).toBe(
      '\u001B[38;2;153;0;153m'
    )
    expect(ansiStyles.color.ansi16m(...ansiStyles.hexToRgb('#FF00FF'))).toBe(
      '\u001B[38;2;255;0;255m'
    )

    expect(ansiStyles.bgColor.ansi16m(...ansiStyles.hexToRgb('#990099'))).toBe(
      '\u001B[48;2;153;0;153m'
    )
    expect(ansiStyles.bgColor.ansi16m(...ansiStyles.hexToRgb('#FF00FF'))).toBe(
      '\u001B[48;2;255;0;255m'
    )
  })
})

describe('颜色格式情况', () => {
  it('hex颜色', () => {
    expect(ansiStyles.hexToRgb('#11')).toEqual([0, 0, 0])
    expect(ansiStyles.hexToRgb('#FFF')).toEqual([255, 255, 255])
  })

  it('rgbToAnsi256 灰度调色板', () => {
    expect(ansiStyles.rgbToAnsi256(0, 0, 0)).toBe(16)
    expect(ansiStyles.rgbToAnsi256(255, 255, 255)).toBe(231)
    expect(ansiStyles.rgbToAnsi256(233, 233, 233)).toBe(254)
  })

  it('ansi256ToAnsi 灰度调色板', () => {
    expect(ansiStyles.ansi256ToAnsi(7)).toBe(15)
    expect(ansiStyles.ansi256ToAnsi(15)).toBe(97)
    expect(ansiStyles.ansi256ToAnsi(16)).toBe(30)
    expect(ansiStyles.ansi256ToAnsi(232)).toBe(30)
    expect(ansiStyles.ansi256ToAnsi(255)).toBe(37)
  })
})
