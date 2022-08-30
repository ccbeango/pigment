import ansiStyles from './ansiStyle'
import type { PigmentInstance, StyleName, CSPair } from './types'

/**
 * 创建Pigment实例模板函数，用做getter函数的返回值
 * @param self
 * @param style
 * @returns
 */
function createBulider(self: PigmentInstance, style: CSPair) {
  const builder: any = (...args: string[]) => {
    return applyStyle(builder, args.length === 1 ? args[0] : args.join(' '))
  }

  const parentStyles = (self as any)._styles || []
  builder._styles = parentStyles.concat(style)

  Object.setPrototypeOf(builder, Pigment)
  return builder as PigmentInstance
}

/**
 * 获取颜色模式的ANSI code
 */
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
  const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
  return str.replace(matchOperatorsRe, '\\$&')
}

/**
 * 对str应用样式
 */
function applyStyle(self: PigmentInstance, str: string) {
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

function Pigment() {
  const instance = (...strings: string[]) => strings.join(' ')
  Object.setPrototypeOf(instance, Pigment)
  const pigment = instance as PigmentInstance
  pigment.enabled = true
  pigment.level = 0
  pigment.cursor = ansiStyles.cursor
  pigment.strip = (str: string) => {
    // eslint-disable-next-line no-control-regex
    return ('' + str).replace(/\x1B\[\d+m/g, '')
  }

  return pigment
}

/**
 * 组装颜色别名的Getter
 */
function assembleColorAliasGetter() {
  for (const styleName of Object.keys(ansiStyles)) {
    if (styleName !== 'cursor') {
      Object.defineProperty(Pigment, styleName, {
        get() {
          const builder = createBulider(
            this,
            ansiStyles[styleName as StyleName]
          )
          Object.defineProperty(this as PigmentInstance, styleName, {
            value: builder
          })
          return builder
        }
      })
    }
  }
}

/**
 * 组装颜色模式的getter方法
 */
function assembleModelMethodGetter() {
  const levelMapping: ['ansi', 'ansi256', 'ansi16m'] = [
    'ansi',
    'ansi256',
    'ansi16m'
  ]
  const usedModels: ['rgb', 'hex', 'ansi256'] = ['rgb', 'hex', 'ansi256']
  for (const model of usedModels) {
    Object.defineProperty(Pigment, model, {
      get() {
        const { level } = this as PigmentInstance
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
    })

    const backgroundName = 'bg' + model[0].toUpperCase() + model.slice(1)
    Object.defineProperty(Pigment, backgroundName, {
      get() {
        const { level } = this as PigmentInstance
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
    })
  }
}

assembleColorAliasGetter()
assembleModelMethodGetter()

const pigment = Pigment()

console.log(pigment.white.bold.bgGreen('PASS!'))
export default pigment
