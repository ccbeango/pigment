/* eslint-disable no-undef */
const out = process.stdout

/**
 * 8色
 * @param {*} pre
 * @param {*} post
 * @param {*} startCode
 */
function colors8(pre, post, startCode = 30) {
  const codePointA = 'A'.codePointAt(0)

  let i = 0
  while (i < 8) {
    const colorCode = startCode + i
    const char = String.fromCodePoint(codePointA + i)
    out.write(`${pre}${colorCode}${post}${char} `)
    i++
  }
  console.log('\u001b[0m')
}

/**
 * 8色
 */
function fgColors8() {
  colors8('\u001b[', 'm')
}
/**
 * 8色 粗体
 */
function fgColors8Bold() {
  colors8('\u001b[', ';1m')
}

fgColors8()
fgColors8Bold()

function colors256(pre, post) {
  let i = 0
  while (i < 16) {
    let j = 0
    while (j < 16) {
      const colorCode = i * 16 + j
      const text = `${colorCode}`.padEnd(4)
      out.write(`${pre}${colorCode}${post}${text}`)
      j++
    }
    console.log('\u001b[0m')
    i++
  }
}

function fgColors256() {
  colors256('\u001b[38;5;', 'm')
}
fgColors256()

function bgColors8() {
  colors8('\u001b[', 'm', 40)
}

function bgColors8Bright() {
  colors8('\u001b[', ';1m', 40)
}
bgColors8()
bgColors8Bright()

function bgColors256() {
  colors256('\u001b[48;5;', 'm')
}
bgColors256()

function decorations() {
  const codes = [
    [1, 'High'],
    [2, 'Low'],
    [3, 'Italic'],
    [4, 'Underline'],
    [7, 'Reverse']
  ]

  for (let c of codes) {
    out.write(`\u001b[${c[0]}m${c[1]} \u001b[0m`)
  }
  console.log()
  console.log(
    '\u001b[1m\u001b[4m\u001b[44m\u001b[31mBlue Background Red Color Bold Underline\u001b[0m'
  )
}

decorations()

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function progressIndicator() {
  console.log('Loading...')
  let i = 0
  while (i <= 100) {
    await sleep(10)
    out.write(`\u001b[1000D${i}%`)
    i++
  }
  // 清除进度信息（上两行）然后输出 Done!
  console.log('\u001b[2F\u001b[0JDone!')
}

;(async () => {
  await progressIndicator()
})()

async function progressBars(count = 1) {
  const list = []
  let i = 0
  while (i++ < count) {
    list[i] = 0
  }

  // 占位提供空间
  out.write(list.map(i => '').join('\n'))

  while (list.some(i => i < 100)) {
    await sleep(10)

    const unfinished = list.reduce((p, c, i) => {
      if (c < 100) p.push(i)
      return p
    }, [])
    const randomIndex =
      unfinished[Math.floor(Math.random() * unfinished.length)]
    list[randomIndex] += 1

    // 移动到上一行开头
    out.write('\u001b[' + count + 'F')
    list.forEach(p => {
      const width = Math.floor(p / 4)
      console.log('[' + '#'.repeat(width) + ' '.repeat(25 - width) + ']')
    })
  }

  console.log(`\u001b[1000D\u001b[${count}A\u001b[0JDone!`)
}

;(async () => {
  console.log('Single progress')
  await progressBars()

  console.log()
  console.log('Multiple progress')
  await progressBars(4)
})()
