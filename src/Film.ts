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
        .videoCodec('libx264')
        .outputOptions('-framerate', `${framerate}`)
        .outputOptions('-s', `${width}x${height}`)
        .output(this.path)
        .format('mp4')
  }

  toFile() {
    ffmpeg()
      .input(this.path)
      .outputOptions([
        '-vf', `fps=${this.framerate}`,
        '-q:v', '0'
      ])
      .output(`in/frames/frame-%04d.png`)
      .run()
  }
}
