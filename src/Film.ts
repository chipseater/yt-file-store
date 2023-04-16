import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg"
import { Readable } from 'stream'

export default class Film {
  path: string
  command: FfmpegCommand

  constructor(path: string, stream: Readable, width: number = 1280, height: number = 720) {
    this.path = path
    this.command = ffmpeg()
      .input(stream)
      .videoCodec('libx264')
      .outputOptions('-framerate', '15')
      .outputOptions('-s', `${width}x${height}`)
      .output(this.path)
      .format('mp4')
  }
}
