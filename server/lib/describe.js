function repeat(char, times) {
  let string = ''

  for (let i = 0; i < times; i++)
    string += char

  return string
}

function color(text, color) {
  switch(color) {
    case 'red':
      return `\x1b[0m${text}\x1b[0m`
    case 'green':
      return `\x1b[32m${text}\x1b[0m`
    default:
      throw `Unkown color: ${color}`
  }
}

function suiteBuilder(depth) {
  depth = depth || 0

  return function describe(title, suite) {
    console.log(`${repeat('  ', depth)}${title}`)
    suite(function it(name, body) {
      try {
        body()
        console.log(color(`${repeat('  ', depth + 1)}Passed: ${name}`, 'green'))
      } catch (e) {
        console.log(color(`${repeat('  ', depth + 1)}Failed: ${name}`, 'red'), e)
      }
    }, suiteBuilder(depth + 1))
  }
}

module.exports = suiteBuilder(0)
