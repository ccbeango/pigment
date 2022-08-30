export interface CSPair {
  open: string
  close: string
}

export interface Cursor {
  // 光标上移 光标向指定的方向移动n格
  up: (n?: number) => string
  // 光标下移 光标向指定的方向移动n格
  down: (n?: number) => string
  // 光标前移 光标向指定的方向移动n格
  forward: (n?: number) => string
  // 光标后移 光标向指定的方向移动n格
  back: (n?: number) => string
  // 光标移到下一行 光标移动到下面第n（默认1）行的开头
  nextLine: (n?: number) => string
  // 光标移到上一行 光标移动到上面第n（默认1）行的开头
  previousLine: (n?: number) => string
  // 光标水平绝对 光标移动到第n（默认1）列
  moveColumn: (n?: number) => string
  // 光标位置 光标移动到第n行、第m列
  move: (n: number, m: number) => string
  // 擦除显示 清除屏幕的部分区域
  // 如果n是0（或缺失），则清除从光标位置到屏幕末尾的部分。
  // 如果n是1，则清除从光标位置到屏幕开头的部分。
  // 如果n是2，则清除整个屏幕
  // 如果n是3，则清除整个屏幕，并删除回滚缓存区中的所有行
  eraseInDisplay: (n?: 0 | 1 | 2 | 3) => string
  // 擦除行 清除行内的部分区域
  // 如果n是0（或缺失），清除从光标位置到该行末尾的部分。
  // 如果n是1，清除从光标位置到该行开头的部分。
  // 如果n是2，清除整行。光标位置不变。
  eraseInLine: (n?: 0 | 1 | 2) => string
  // 向上滚动 整页向上滚动n（默认1）行。新行添加到底部
  scrollUp: (n?: number) => string
  // 向下滚动 整页向下滚动n（默认1）行。新行添加到顶部
  scrollDown: (n?: number) => string
}

export interface Modifier {
  reset: CSPair
  bold: CSPair
  dim: CSPair
  italic: CSPair
  underline: CSPair
  twinkle: CSPair
  flash: CSPair
  inverse: CSPair
  hidden: CSPair
  strikethrough: CSPair
  default: CSPair
}

export interface ForegroundColor {
  black: CSPair
  red: CSPair
  green: CSPair
  yellow: CSPair
  blue: CSPair
  cyan: CSPair
  magenta: CSPair
  white: CSPair

  gray: CSPair
  grey: CSPair
  blackBright: CSPair
  redBright: CSPair
  greenBright: CSPair
  yellowBright: CSPair
  blueBright: CSPair
  cyanBright: CSPair
  magentaBright: CSPair
  whiteBright: CSPair
}

export interface BackgroundColor {
  bgBlack: CSPair
  bgRed: CSPair
  bgGreen: CSPair
  bgYellow: CSPair
  bgBlue: CSPair
  bgCyan: CSPair
  bgMagenta: CSPair
  bgWhite: CSPair

  bgGray: CSPair
  bgGrey: CSPair
  bgBlackBright: CSPair
  bgRedBright: CSPair
  bgGreenBright: CSPair
  bgYellowBright: CSPair
  bgBlueBright: CSPair
  bgCyanBright: CSPair
  bgMagentaBright: CSPair
  bgWhiteBright: CSPair
}

export interface ColorBase {
  close: string
  ansi(code: number): string
  ansi256(code: number): string
  ansi16m(red: number, green: number, blue: number): string
}

export interface ConvertColor {
  /**
	Convert from the RGB color space to the ANSI 256 color space.

	@param red - (`0...255`)
	@param green - (`0...255`)
	@param blue - (`0...255`)
	*/
  rgbToAnsi256(red: number, green: number, blue: number): number

  /**
	Convert from the RGB HEX color space to the RGB color space.

	@param hex - A hexadecimal string containing RGB data.
	*/
  hexToRgb(hex: string): [red: number, green: number, blue: number]

  /**
	Convert from the RGB HEX color space to the ANSI 256 color space.

	@param hex - A hexadecimal string containing RGB data.
	*/
  hexToAnsi256(hex: string): number

  /**
	Convert from the ANSI 256 color space to the ANSI 16 color space.

	@param code - A number representing the ANSI 256 color.
	*/
  ansi256ToAnsi(code: number): number

  /**
	Convert from the RGB color space to the ANSI 16 color space.

	@param red - (`0...255`)
	@param green - (`0...255`)
	@param blue - (`0...255`)
	*/
  rgbToAnsi(red: number, green: number, blue: number): number

  /**
	Convert from the RGB HEX color space to the ANSI 16 color space.

	@param hex - A hexadecimal string containing RGB data.
	*/
  hexToAnsi(hex: string): number
}

export type StyleName =
  | keyof Modifier
  | keyof ForegroundColor
  | keyof BackgroundColor

export type AnsiStyles = AnsiSGRCode &
  ForegroundColor &
  BackgroundColor &
  Modifier &
  ConvertColor

export interface AnsiSGRCode {
  cursor: Cursor
  modifier: Modifier
  color: ForegroundColor & ColorBase
  bgColor: BackgroundColor & ColorBase
}

export type ColorSupportLevel = 0 | 1 | 2

export interface PigmentInstance {
  _styles: CSPair[]
  (...text: unknown[]): string

  /**
	The color support for Chalk.

	By default, color support is automatically detected based on the environment.

	Levels:
	- `0` - All colors disabled.
	- `1` - Basic 16 colors support.
	- `2` - ANSI 256 colors support.
	- `3` - Truecolor 16 million colors support.
	*/
  level: ColorSupportLevel
  enabled: boolean

  cursor: Cursor

  strip: (str: string) => string
  rgb: (red: number, green: number, blue: number) => this
  hex: (color: string) => this
  ansi256: (index: number) => this
  bgRgb: (red: number, green: number, blue: number) => this
  bgHex: (color: string) => this
  bgAnsi256: (index: number) => this

  reset: this
  bold: this
  dim: this
  italic: this
  underline: this
  twinkle: this
  flash: this
  overline: this
  inverse: this
  hidden: this
  strikethrough: this
  default: this
  black: this
  red: this
  green: this
  yellow: this
  blue: this
  magenta: this
  cyan: this
  white: this

  gray: this
  grey: this

  blackBright: this
  redBright: this
  greenBright: this
  yellowBright: this
  blueBright: this
  magentaBright: this
  cyanBright: this
  whiteBright: this

  bgBlack: this
  bgRed: this
  bgGreen: this
  bgYellow: this
  bgBlue: this
  bgMagenta: this
  bgCyan: this
  bgWhite: this

  bgGray: this
  bgGrey: this
  bgBlackBright: this
  bgRedBright: this
  bgGreenBright: this
  bgYellowBright: this
  bgBlueBright: this
  bgMagentaBright: this
  bgCyanBright: this
  bgWhiteBright: this
}
