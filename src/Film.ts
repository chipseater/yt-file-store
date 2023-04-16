import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import stream, { Writable } from 'stream'
import { PassThrough, Readable } from 'stream'

export default class Film {
  path: string
  command: FfmpegCommand

  constructor(
    path: string,
    stream?: Readable,
    width: number = 1280,
    height: number = 720,
  ) {
    this.path = path
    if (stream)
      this.command = ffmpeg()
        .input(stream)
        .videoCodec('libx264')
        .outputOptions('-framerate', '15')
        .outputOptions('-s', `${width}x${height}`)
        .output(this.path)
        .format('mp4')
  }

  toFile() {
    const frames = ffmpeg(this.path)
      .outputOptions('-vf', 'fps=1/10')
      .outputOptions('-qscale:v', '2')
      .outputOptions('-start_number', '0')
      .outputOptions('-f', 'rawvideo') // specify the output format as raw video
      .on('end', () => console.log('Frames extracted successfully!'))
      .pipe(new stream.Writable({
        write(chunk, encoding, callback) {
          console.log(chunk)
          callback();
        }
      }))
  }
}
