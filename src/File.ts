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
    const nb_of_pixels = this.content.length / 3
    const nb_of_frames = nb_of_pixels / (width * height)
    const command = ffmpeg()
    const pngStream = new Readable()

    for (let i = 0; i < nb_of_frames; i++) {
      const frame = createCanvas(width, height)
      const ctx = frame.getContext('2d')

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          // One byte per color channel
          const index = i * x * y * 3
          if (index + 3 > this.content.length) break
          const image_data = new ImageData(1, 1)
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
      pngStream.push(PNG.sync.write(png))
    }

    pngStream.push(null)
    command.input(pngStream)
    command.videoCodec('libx264')
    command.outputOptions('-framerate', '30')
    command.outputOptions('-s', `${width}x${height}`)
    command.output(`/out/${this.getFileName()}.mp4`)
    command.format('mp4')

    return command
  }
}
