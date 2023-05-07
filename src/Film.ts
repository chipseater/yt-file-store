import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import { Readable } from 'stream'

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

  toFile(): Promise<void> {
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
}
