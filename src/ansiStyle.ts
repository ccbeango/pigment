/**

基于ANSI转义序列

https://en.wikipedia.org/wiki/CSIape_code

在文本中嵌入确定的字节序列，大部分以ESC转义字符和"["字符开始，终端会把这些字节序列解释为相应的指令，而不是普通的字符编码。

所有序列都以ASCII字符ESC（27 / 十六进制 0x1B）开头，第二个字节则是0x40–0x5F（ASCII @A–Z[\]^_）范围内的字符

CSI序列 控制序列导入器（Control Sequence Introducer）
  格式：ESC [ 若干个（包括0个）“参数字节”、若干个“中间字节”，以及一个“最终字节”组成

  组成部分	字符范围	ASCII
  ----------------------------------------
  参数字节	0x30–0x3F	0–9:;<=>?
  中间字节	0x20–0x2F	空格、!"#$%&'()*+,-./
  最终字节	0x40–0x7E	@A–Z[\]^_`a–z{|}~

  所有常见的序列都只是把参数用作一系列分号分隔的数字，如1;2;3。缺少的数字视为0（如1;;3相当于中间的数字是0，ESC[m这样没有参数的情况相当于参数为0）。

ANSI转义序列#选择图形再现（SGR）参数
https://zh.wikipedia.org/wiki/ANSI%E8%BD%AC%E4%B9%89%E5%BA%8F%E5%88%97#%E9%80%89%E6%8B%A9%E5%9B%BE%E5%BD%A2%E5%86%8D%E7%8E%B0%EF%BC%88SGR%EF%BC%89%E5%8F%82%E6%95%B0
 */

import type {
  AnsiStyles,
  StyleName,
  Modifier,
  ForegroundColor,
  BackgroundColor,
  Cursor
} from './types'

const FOREGROUND_COLOR_DEFAULT = 39 // 默认前景色
const BACKGROUND_COLOR_DEFAULT = 49 // 默认背景色

const ANSI_BACKGROUND_OFFSET = 10 // 前景、背景的ANSI Code相差10
const CSI = '\u001B[' // 开头 ESC [

const FINAL_FLAG = {
  CUU: 'A', // 光标上移
  CUD: 'B', // 光标下移
  CUF: 'C', // 光标前移
  CUB: 'D', // 光标后移
  CNL: 'E', // 光标移到下一行
  CPL: 'F', // 光标移到上一行
  CHA: 'G', // 光标水平绝对
  CUP: 'H', // 光标位置
  ED: 'J', // 擦除显示
  EL: 'K', // 擦除行
  SU: 'S', // 向上滚动
  SD: 'T', // 向下滚动
  SGR: 'm' // 选择图形再现
}

/**
 * 生成图形再现SGR参数的别名
 */
function generateAliasStyles(ansiStyles: AnsiStyles) {
  /**
   * SGR参数
   */
  const ANSI_SGR_CODE = {
    modifier: {
      reset: [0, 0], // 重置/正常
      /* 字体 */
      bold: [1, 22], // 粗体或增加强度 21不好使，22效果同21
      dim: [2, 22], // 弱化（降低强度）
      italic: [3, 23], // 斜体
      underline: [4, 24], // 下划线
      twinkle: [5, 25], // 缓慢闪烁
      flash: [6, 25], // 快速闪烁
      inverse: [7, 27], // 反显
      hidden: [8, 28], // 隐藏
      strikethrough: [9, 29], // 删除线
      default: [10, 10] // 默认字体
    },
    /* 前景色 */
    color: {
      black: [30, FOREGROUND_COLOR_DEFAULT], // 黑
      red: [31, FOREGROUND_COLOR_DEFAULT], // 红
      green: [32, FOREGROUND_COLOR_DEFAULT], // 绿
      yellow: [33, FOREGROUND_COLOR_DEFAULT], // 黄
      blue: [34, FOREGROUND_COLOR_DEFAULT], // 蓝
      magenta: [35, FOREGROUND_COLOR_DEFAULT], // 洋红
      cyan: [36, FOREGROUND_COLOR_DEFAULT], // 青色
      white: [37, FOREGROUND_COLOR_DEFAULT], // 白
      // 亮色
      grey: [90, FOREGROUND_COLOR_DEFAULT], // 亮黑？灰！
      gray: [90, FOREGROUND_COLOR_DEFAULT], // 亮黑？灰！
      blackBright: [90, FOREGROUND_COLOR_DEFAULT], // 灰
      redBright: [91, FOREGROUND_COLOR_DEFAULT], // 亮红
      greenBright: [92, FOREGROUND_COLOR_DEFAULT], // 亮绿
      yellowBright: [93, FOREGROUND_COLOR_DEFAULT], // 亮黄
      blueBright: [94, FOREGROUND_COLOR_DEFAULT], // 亮蓝
      magentaBright: [95, FOREGROUND_COLOR_DEFAULT], // 亮洋红
      cyanBright: [96, FOREGROUND_COLOR_DEFAULT], // 亮青
      whiteBright: [97, FOREGROUND_COLOR_DEFAULT] // 亮白
    },
    /* 背景色 */
    bgColor: {
      bgBlack: [40, BACKGROUND_COLOR_DEFAULT], // 黑
      bgRed: [41, BACKGROUND_COLOR_DEFAULT], // 红
      bgGreen: [42, BACKGROUND_COLOR_DEFAULT], // 绿
      bgYellow: [43, BACKGROUND_COLOR_DEFAULT], // 黄
      bgBlue: [44, BACKGROUND_COLOR_DEFAULT], // 蓝
      bgMagenta: [45, BACKGROUND_COLOR_DEFAULT], // 洋红
      bgCyan: [46, BACKGROUND_COLOR_DEFAULT], // 青
      bgWhite: [47, BACKGROUND_COLOR_DEFAULT], // 白

      // 亮色
      bgGrey: [100, BACKGROUND_COLOR_DEFAULT], // 灰
      bgGray: [100, BACKGROUND_COLOR_DEFAULT], // 灰
      bgBlackBright: [100, BACKGROUND_COLOR_DEFAULT], // 灰
      bgRedBright: [101, BACKGROUND_COLOR_DEFAULT], // 亮红
      bgGreenBright: [102, BACKGROUND_COLOR_DEFAULT], // 亮绿
      bgYellowBright: [103, BACKGROUND_COLOR_DEFAULT], // 亮黄
      bgBlueBright: [104, BACKGROUND_COLOR_DEFAULT], // 亮蓝
      bgMagentaBright: [105, BACKGROUND_COLOR_DEFAULT], // 亮洋红
      bgCyanBright: [106, BACKGROUND_COLOR_DEFAULT], // 亮青
      bgWhiteBright: [107, BACKGROUND_COLOR_DEFAULT] // 亮白
    }
  }

  for (const [groupName, group] of Object.entries(ANSI_SGR_CODE)) {
    const gName = groupName as 'modifier' | 'color' | 'bgColor'
    const groupStyle = {} as Modifier & ForegroundColor & BackgroundColor

    for (const [styleName, style] of Object.entries(group)) {
      const name = styleName as StyleName
      ansiStyles[name] = {
        open: `${CSI}${style[0]}${FINAL_FLAG.SGR}`,
        close: `${CSI}${style[1]}${FINAL_FLAG.SGR}`
      }

      groupStyle[name] = ansiStyles[name]
    }

    Object.defineProperty(ansiStyles, gName, {
      value: groupStyle,
      enumerable: false
    })
  }
}

/**
 * 生成自定义传值颜色码
 */
function generateCustomStyles(ansiStyles: AnsiStyles) {
  // 3/4位 16色 （前景 + 背景）
  const wrapAnsi16 = (offest = 0) => {
    return (code: number) => `${CSI}${code + offest}${FINAL_FLAG.SGR}`
  }

  /**
   * 8位 256色
   * ESC[ … 38;5;<n> … m选择前景色（n是下表中的一种）
   * ESC[ … 48;5;<n> … m选择背景色
   */
  const wrapAnsi256 = (offest = 0) => {
    return (code: number) => `${CSI}${38 + offest};5;${code}${FINAL_FLAG.SGR}`
  }

  /**
   * 24位 1600万色（RGB）
   * ESC[ … 38;2;<r>;<g>;<b> … m选择RGB前景色
   * ESC[ … 48;2;<r>;<g>;<b> … m选择RGB背景色
   */
  const wrapAnsi16m = (offest = 0) => {
    return (red: number, green: number, blue: number) =>
      `${CSI}${38 + offest};2;${red};${green};${blue}${FINAL_FLAG.SGR}`
  }

  ansiStyles.color.ansi = wrapAnsi16()
  ansiStyles.color.ansi256 = wrapAnsi256()
  ansiStyles.color.ansi16m = wrapAnsi16m()
  ansiStyles.color.close = `${CSI}${FOREGROUND_COLOR_DEFAULT}${FINAL_FLAG.SGR}`

  ansiStyles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET)
  ansiStyles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET)
  ansiStyles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET)
  ansiStyles.bgColor.close = `${CSI}${BACKGROUND_COLOR_DEFAULT}${FINAL_FLAG.SGR}`
}

/**
 * 生成颜色转换函数
 */
function generateConvertColor(ansiStyles: AnsiStyles) {
  /**
   * RGB转256色
   */
  const rgbToAnsi256 = (red: number, green: number, blue: number) => {
    // FIXME：搞懂算法
    // 除了黑白外，在这里使用扩展的灰度调色板。普通调色板只有4个灰度色调。
    if (red === green && green === blue) {
      if (red < 8) {
        return 16
      }

      if (red > 248) {
        return 231
      }

      return Math.round(((red - 8) / 247) * 24) + 232
    }

    return (
      16 +
      36 * Math.round((red / 255) * 5) +
      6 * Math.round((green / 255) * 5) +
      Math.round((blue / 255) * 5)
    )
  }
  /**
   * 十六进制转RGB
   */
  const hexToRgb = (
    hex: string
  ): [red: number, green: number, blue: number] => {
    const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex)
    if (!matches) {
      return [0, 0, 0]
    }

    let { colorString } = matches.groups!

    if (colorString.length === 3) {
      colorString = [...colorString]
        .map(character => character + character)
        .join('')
    }

    const integer = Number.parseInt(colorString, 16)

    return [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff]
  }

  /**
   * 十六进制转ansi256
   */
  const hexToAnsi256 = (hex: string) => rgbToAnsi256(...hexToRgb(hex))

  /**
   * ansi256转ansi16
   */
  const ansi256ToAnsi = (code: number) => {
    // FIXME：搞懂算法
    if (code < 8) {
      return code + 8
    }

    if (code < 16) {
      return 90 + (code - 8)
    }

    let red: number
    let green: number
    let blue: number
    if (code >= 232) {
      red = green = blue = ((code - 232) * 10 + 8) / 255
    } else {
      code -= 16

      const remainder = code % 36

      red = Math.floor(code / 36) / 5
      green = Math.floor(remainder / 6) / 5
      blue = (remainder % 6) / 5
    }

    const value = Math.max(red, green, blue) * 2

    if (value === 0) {
      return 30
    }

    let result =
      30 +
      ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red))

    if (value === 2) {
      result += 60
    }

    return result
  }

  const rgbToAnsi = (red: number, green: number, blue: number) =>
    ansi256ToAnsi(rgbToAnsi256(red, green, blue))

  const hexToAnsi = (hex: string) => ansi256ToAnsi(hexToAnsi256(hex))

  Object.defineProperties(ansiStyles, {
    rgbToAnsi256: {
      enumerable: false,
      value: rgbToAnsi256
    },
    hexToRgb: {
      enumerable: false,
      value: hexToRgb
    },
    hexToAnsi256: {
      enumerable: false,
      value: hexToAnsi256
    },
    ansi256ToAnsi: {
      enumerable: false,
      value: ansi256ToAnsi
    },
    rgbToAnsi: {
      enumerable: false,
      value: rgbToAnsi
    },
    hexToAnsi: {
      enumerable: false,
      value: hexToAnsi
    }
  })
}

function generateCursorStyles(ansiStyles: AnsiStyles) {
  const cursorCodeFactory = (finalFlag: string, defN = 1) => {
    return (n = defN) => `${CSI}${n}${finalFlag}`
  }

  ansiStyles.cursor = {
    // 光标上移 光标向指定的方向移动n格
    up: cursorCodeFactory(FINAL_FLAG.CUU),
    // 光标下移 光标向指定的方向移动n格
    down: cursorCodeFactory(FINAL_FLAG.CUD),
    // 光标前移 光标向指定的方向移动n格
    forward: cursorCodeFactory(FINAL_FLAG.CUF),
    // 光标后移 光标向指定的方向移动n格
    back: cursorCodeFactory(FINAL_FLAG.CUB),
    // 光标移到下一行 光标移动到下面第n（默认1）行的开头
    nextLine: cursorCodeFactory(FINAL_FLAG.CNL),
    // 光标移到上一行 光标移动到上面第n（默认1）行的开头
    previousLine: cursorCodeFactory(FINAL_FLAG.CPL),
    // 光标水平绝对 光标移动到第n（默认1）列
    moveColumn: cursorCodeFactory(FINAL_FLAG.CHA),
    // 光标位置 光标移动到第n行、第m列
    move: (n = 1, m = 1) => `${CSI}${n};${m}${FINAL_FLAG.CUP}`,
    // 擦除显示 清除屏幕的部分区域
    // 如果n是0（或缺失），则清除从光标位置到屏幕末尾的部分。
    // 如果n是1，则清除从光标位置到屏幕开头的部分。
    // 如果n是2，则清除整个屏幕
    // 如果n是3，则清除整个屏幕，并删除回滚缓存区中的所有行
    eraseInDisplay: cursorCodeFactory(FINAL_FLAG.ED, 0),
    // 擦除行 清除行内的部分区域
    // 如果n是0（或缺失），清除从光标位置到该行末尾的部分。
    // 如果n是1，清除从光标位置到该行开头的部分。
    // 如果n是2，清除整行。光标位置不变。
    eraseInLine: cursorCodeFactory(FINAL_FLAG.EL, 0),
    // 向上滚动 整页向上滚动n（默认1）行。新行添加到底部
    scrollUp: cursorCodeFactory(FINAL_FLAG.SU),
    // 向下滚动 整页向下滚动n（默认1）行。新行添加到顶部
    scrollDown: cursorCodeFactory(FINAL_FLAG.SD)
  }
}
/**
 * 组装ANSI参数
 */
function assembleStyles() {
  const ansiStyles = {} as AnsiStyles

  generateAliasStyles(ansiStyles)
  generateCustomStyles(ansiStyles)
  generateConvertColor(ansiStyles)
  generateCursorStyles(ansiStyles)
  return ansiStyles
}

const ansiStyles = assembleStyles()

export default ansiStyles
