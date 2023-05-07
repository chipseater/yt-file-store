import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import { Readable } from 'stream'

export default class Film {
  path: string
  command: FfmpegCommand
  framerate: number

  constructor(
    path: string,
    stream?: Readable,
    width: number = 1280,
    height: number = 720,
    framerate: number = 30,
  ) {
    this.path = path
    this.framerate = framerate
    if (stream)
      this.command = ffmpeg()
        .input(stream)
        .outputOptions([
          '-c:v', 'ffv1',
          `-framerate`, `${framerate}`,
          `-s`, `${width}x${height}`,
        ])
        .output(this.path)
        .format('matroska')
  }

  toFile() {
    ffmpeg()
      .input(this.path)
      .outputOptions([
        '-q:v 1', // Output quality
        '-vsync 0', // Disable frame rate conversion
      ])
      .output(`in/frames/frame-%04d.png`)
      .run()
  }
}
