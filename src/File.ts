import { PNG } from 'pngjs'
import { Readable } from 'stream'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import Frame from './Frame.js'

export default class CustomFile {
  path: string
  content: string

  constructor(path?: string) {
    this.path = path
    if (path) {
      this.content = fs.readFileSync(this.path, 'hex')
    } else {
      this.content = ''
    }
  }

  getFileName() {
    const lastIndex = this.path.split('/').length - 1
    return this.path.split('/')[lastIndex].split('.')[0]
  }

  dumpData(path: string, hex_value: string): void {
    this.content = hex_value
    fs.writeFileSync(path, hex_value, { encoding: 'hex' })
  }

  toFrames(width: number = 1280, height: number = 720) {
    const command = ffmpeg()
    const pngStream = new Readable()
    
    for (let i = 0; i <= this.content.length / (3 * width * height); i++) {
      const startIndex = i * 3 * width * height
      const endIndex = (i + 1) * 3 * width * height
      const frame = new Frame(this.content.slice(startIndex, endIndex), width, height)
      const png = frame.getPNG()
      fs.writeFileSync(`out/frames/frame${i}.png`, PNG.sync.write(png))
      pngStream.push(PNG.sync.write(png))
    }

    pngStream.push(null)
    command.input(pngStream)
    command.videoCodec('libx264')
    command.outputOptions('-framerate', '30')
    command.outputOptions('-s', `${width}x${height}`)
    command.output(`out/${this.getFileName()}.mp4`)
    command.format('mp4')

    return command
  }
}
