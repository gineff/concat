const { glob } = require('glob')
const { writeFile } = require('node:fs/promises')
const { spawn } = require('node:child_process')
import { extractArgs } from './utils'

const prepareList = async (files: string[]) => {
  return writeFile(`mylist.txt`, files.map(file => `file ${file}`).join('\n'))
}

const concat = async () => {
  console.log('concat')
  const [args, rest] = extractArgs(process.argv.slice(2), ['-i'])
  console.log(args, rest)
  const pattern = args['-i']

  const files = (await glob(pattern)).sort(
    (a: string, b: string) => Number(a.split('-')[1]) - Number(b.split('-')[1])
  )
  await prepareList(files)

  const ffmpeg = spawn('ffmpeg', [
    '-threads',
    '3',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    'mylist.txt',
    '-c',
    'copy',
    ...rest,
  ])

  ffmpeg.stderr.pipe(process.stderr)
  process.stdin.pipe(ffmpeg.stdin)
}

concat()
