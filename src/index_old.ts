import ansiStyles from './ansiStyle'
import type {
  PigmentInstance,
  StyleName,
  CSPair,
  ColorSupportLevel
} from './types'

interface PigmentGetter {
  get(): PigmentInstance
  level?: ColorSupportLevel
}

interface PigmentFuncGetter {
  get(): (...args: any) => PigmentInstance
  level?: ColorSupportLevel
}
type PigmentKey = keyof PigmentInstance

type PigmentStyle = Record<PigmentKey, PigmentGetter | PigmentFuncGetter>

const pigments = {} as PigmentStyle

// 颜色别名getter
for (const styleName of Object.keys(ansiStyles)) {
  const name = styleName as StyleName | 'cursor'
  if (name !== 'cursor') {
    pigments[name] = {
      get() {
        const builder = createBulider(this, ansiStyles[name])
        Object.defineProperty(this, styleName, { value: builder })
        return builder
      }
    }
  }
}

const levelMapping: ['ansi', 'ansi256', 'ansi16m'] = [
  'ansi',
  'ansi256',
  'ansi16m'
]
const usedModels: ['rgb', 'hex', 'ansi256'] = ['rgb', 'hex', 'ansi256']
for (const model of usedModels) {
  const foregroundName = model as StyleName
  pigments[foregroundName] = {
    get() {
      const { level } = this
      return (...args: any) => {
        const openStr = getModelAnsi(
          model,
          levelMapping[level!],
          'color',
          ...args
        )
        const closeStr = ansiStyles.color.close
        return createBulider(this, { open: openStr, close: closeStr })
      }
    }
  }

  const backgroundName = ('bg' +
    model[0].toUpperCase() +
    model.slice(1)) as StyleName
  pigments[backgroundName] = {
    get() {
      const { level } = this
      return (...args: any) => {
        const openStr = getModelAnsi(
          model,
          levelMapping[level!],
          'bgColor',
          ...args
        )
        const closeStr = ansiStyles.bgColor.close
        return createBulider(this, { open: openStr, close: closeStr })
      }
    }
  }
}

function getModelAnsi(
  model: 'rgb' | 'ansi256' | 'hex',
  level: 'ansi' | 'ansi16m' | 'ansi256',
  type: 'color' | 'bgColor',
  ...args: [number, number, number] | [string] | [number]
): string {
  if (model === 'rgb') {
    args = args as [number, number, number]
    if (level === 'ansi16m') {
      return ansiStyles[type].ansi16m(...args)
    }

    if (level === 'ansi256') {
      return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...args))
    }

    return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...args))
  }

  if (model === 'hex') {
    return getModelAnsi(
      'rgb',
      level,
      type,
      ...ansiStyles.hexToRgb(...(args as [string]))
    )
  }

  return ansiStyles[type][model](...(args as [number]))
}

function escapeStringRegexp(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
  return str.replace(matchOperatorsRe, '\\$&')
}

const applyStyle = (self: PigmentInstance, str: string) => {
  const nestedStyles = self._styles
  const newLinesPresent = str.indexOf('\n') != -1

  let i = nestedStyles.length
  while (i--) {
    const { open, close } = nestedStyles[i]
    const closeRe = new RegExp(escapeStringRegexp(close))
    str = open + str.replace(closeRe, open) + close
    if (newLinesPresent) {
      const newLineRegex = new RegExp(/[\r\n]+/g)
      str = str.replace(newLineRegex, match => `${close}${match}${open}`)
    }
  }

  return str
}

const builderProto = Object.defineProperties(() => {}, pigments as any)
const createBulider = (
  self: PigmentGetter | PigmentFuncGetter,
  style: CSPair
) => {
  const builder: any = (...args: string[]) => {
    return applyStyle(builder, args.length === 1 ? args[0] : args.join(' '))
  }

  const parentStyles = (self as any)._styles || []
  builder._styles = parentStyles.concat(style)

  Object.setPrototypeOf(builder, builderProto)
  return builder as PigmentInstance
}

export function Pigment() {
  const instance = (...strings: string[]) => strings.join(' ')
  Object.setPrototypeOf(instance, Pigment.prototype)
  const pigment = instance as PigmentInstance
  pigment.enabled = true
  pigment.level = 0
  return pigment
}

Pigment.prototype.strip = function (str: string) {
  // eslint-disable-next-line no-control-regex
  return ('' + str).replace(/\x1B\[\d+m/g, '')
}

Pigment.prototype.cursor = ansiStyles.cursor

Object.defineProperties(Pigment.prototype, pigments as any)

const pigment = Pigment()
export default pigment
