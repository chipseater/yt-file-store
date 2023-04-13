import fs, { createWriteStream } from 'fs'
import canvas, { Canvas, createCanvas, ImageData } from 'canvas'
import { Readable } from 'stream'
import ffmpeg, { FfmpegCommand, FfprobeData } from 'fluent-ffmpeg'
import { PNG } from 'pngjs'

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
    
    // Problem: does not output the last frame with the remaining bytes
    for (let i = 0; i < this.content.length - 2; i += 3 * width * height) {
      const frame = createCanvas(width, height)
      const ctx = frame.getContext('2d')

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          // One byte per color channel
          const image_data = new ImageData(1, 1)
          const index = i + y * width + x
          image_data.data[0] = parseInt(this.content[index], 16) * 16
          image_data.data[1] = parseInt(this.content[index + 1], 16) * 16
          image_data.data[2] = parseInt(this.content[index + 2], 16) * 16
          image_data.data[3] = 255
          ctx.putImageData(image_data, x, y)
        }
      }

      const imageData = ctx.getImageData(0, 0, width, height)
      const png = new PNG({ width: width, height: height })
      png.data = Buffer.from(imageData.data.buffer)
      fs.writeFileSync(`out/frames/frame${i / (3 * width * height)}.png`, PNG.sync.write(png))
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
