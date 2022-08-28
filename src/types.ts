interface CSPair {
  open: string
  close: string
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

export interface AnsiSGRCode {
  modifier: Modifier
  color: ForegroundColor & ColorBase
  bgColor: BackgroundColor & ColorBase
}

export type GroupName = 'modifier' | 'color' | 'bgColor'

export type AnsiStyles = AnsiSGRCode &
  ForegroundColor &
  BackgroundColor &
  Modifier &
  ConvertColor

export interface PigmentInstanceGetter {
  _styles?: StyleName[]
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
  // level: ColorSupportLevel
  //  visible: this

  // rgb: (red: number, green: number, blue: number) => this

  // hex: (color: string) => this

  // ansi256: (index: number) => this

  // bgRgb: (red: number, green: number, blue: number) => this

  // bgHex: (color: string) => this

  // bgAnsi256: (index: number) => this

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

export interface Builder {
  (...args: string[]): any
  _styles: StyleName[]
}

export interface PigmentGetter {
  get(): PigmentInstance
}

export interface PigmentInstanceFunc {
  rgb: (red: number, green: number, blue: number) => this

  hex: (color: string) => this

  ansi256: (index: number) => this

  bgRgb: (red: number, green: number, blue: number) => this

  bgHex: (color: string) => this

  bgAnsi256: (index: number) => this
}

export type StyleFuncName = keyof PigmentInstanceFunc
export type PigmentInstance = PigmentInstanceGetter & PigmentInstanceFunc

export type PigmentStyle = Record<StyleName, PigmentGetter> &
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<StyleFuncName, PigmentGetter>
