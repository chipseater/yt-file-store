import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import { Readable } from 'stream'
import fs from 'fs'
import sharp from 'sharp'

export default class Film {
  path: string
  fileName: string
  command: FfmpegCommand
  framerate: number

  constructor(
    fileName: string,
    stream?: Readable,
    width: number = 1280,
    height: number = 720,
    framerate: number = 30,
  ) {
    this.fileName = fileName
    this.path = `out/${fileName}.mkv`
    this.framerate = framerate
    if (stream)
      this.command = ffmpeg()
        .input(stream)
        .outputOptions([
          '-c:v',
          'ffv1',
          `-framerate`,
          `${framerate}`,
          `-s`,
          `${width}x${height}`,
        ])
        .output(this.path)
        .format('matroska')
  }

  getFileName() {
    const lastIndex = this.path.split('/').length - 1
    return this.path.split('/')[lastIndex]
  }

  toFrames(): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(this.path)
        .outputOptions([
          '-q:v 1', // Output quality
          '-vsync 0', // Disable frame rate conversion
        ])
        .output(`in/frames/frame-%04d.png`)
        .on('end', () => {
          resolve()
        })
        .on('error', (err: Error) => reject(err.message))
        .run()
    })
  }

  async getPixels(): Promise<number[]> {
    await this.toFrames()
    const folderPath = 'in/frames'

    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) throw err

        const promises = files.map(async (file) =>
          sharp(`${folderPath}/${file}`)
            .raw()
            .toBuffer()
            .then((buffer) => buffer.toJSON().data),
        )

        Promise.all(promises)
          .then((pixelArrays) => resolve(pixelArrays.flat()))
          .catch((err) => reject(err.message))
      })
    })
  }

  async toFile(path: string) {
    const every_channels = await this.getPixels()
    const pixels = []
    for (let i = 0; i < every_channels.length; i += 4) {
      let pixel = every_channels.slice(i, i + 4)
      if (pixel[3] == 255) pixel = pixel.splice(0, 3)
      if (pixel[3] == 200) pixel = pixel.splice(0, 2)
      if (pixel[3] == 150) pixel = pixel.splice(0, 1)
      if (pixel[3] == 0) break
      // console.log(pixel)
      const hex_array = pixel.map((channel) => {
        return channel.toString(16)
      })
      pixels.push(hex_array)
    }
    const hex_content = pixels.flat().reduce((a, b) => a + b)
    fs.writeFileSync(path, hex_content, { encoding: 'hex' })
    return hex_content
  }
}
