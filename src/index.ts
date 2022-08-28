import ansiStyles from './ansiStyle'
import type {
  PigmentInstance,
  StyleName,
  PigmentStyle,
  PigmentGetter,
  Builder,
  StyleFuncName
} from './types'

const pigments = {} as PigmentStyle

// 颜色别名getter
for (const styleName of Object.keys(ansiStyles)) {
  const name = styleName as StyleName
  pigments[name] = {
    get() {
      const builder = createBulider(this, name)
      Object.defineProperty(this, styleName, { value: builder })
      return builder
    }
  }
}

const usedModels = ['rgb', 'hex', 'ansi256']
for (const model of usedModels) {
  const foregroundName = model as StyleFuncName
  // const backgroundName = model as StyleFuncName
  pigments[foregroundName] = {
    get() {
      // const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), ansiStyles.color.close, this[STYLER]);
      return createBulider(this, foregroundName)
    }
  }
}

const builderProto = Object.defineProperties(() => {}, pigments as any)

function escapeStringRegexp(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g
  return str.replace(matchOperatorsRe, '\\$&')
}

const applyStyle = (self: Builder, str: string) => {
  const nestedStyles = self._styles
  const newLinesPresent = str.indexOf('\n') != -1

  let i = nestedStyles.length
  while (i--) {
    const code = ansiStyles[nestedStyles[i]]
    const closeRe = new RegExp(escapeStringRegexp(code.close))
    str = code.open + str.replace(closeRe, code.open) + code.close
    if (newLinesPresent) {
      const newLineRegex = new RegExp(/[\r\n]+/g)
      str = str.replace(
        newLineRegex,
        match => `${code.close}${match}${code.open}`
      )
    }
  }

  return str
}

const createBulider = (
  self: PigmentGetter,
  style: StyleName | StyleFuncName
) => {
  const builder: Builder = (...args: string[]) => {
    return applyStyle(builder, args.length === 1 ? args[0] : args.join(' '))
  }

  const parentStyles = (self as any)._styles || []
  builder._styles = parentStyles.concat(style)

  Object.setPrototypeOf(builder, builderProto)
  return builder as PigmentInstance
}

export function Pigment() {
  const pigment = (...strings: string[]) => strings.join(' ')
  Object.setPrototypeOf(pigment, Pigment.prototype)
  return pigment as PigmentInstance
}

Object.defineProperties(Pigment.prototype, pigments as any)

// /**
//  * 测试下
//  */
// const aaaaaa = Pigment()
// console.log(aaaaaa.blue.bold.bgWhite('你好', '哈哈'))

const pigment = Pigment()
export default pigment
