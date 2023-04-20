import { PNG } from 'pngjs'
import { Readable } from 'stream'
import fs from 'fs'
import Frame from './Frame.js'
import Film from './Film.js'

export default class CustomFile {
  path: string
  content: string

  constructor(path: string) {
    this.path = path
    this.content = fs.readFileSync(this.path, 'hex')
  }

  getFileName(): string {
    const lastIndex = this.path.split('/').length - 1
    return this.path.split('/')[lastIndex].split('.')[0]
  }

  dumpData(path: string, hex_value: string): void {
    this.content = hex_value
    fs.writeFileSync(path, hex_value, { encoding: 'hex' })
  }

  async toFilm(width: number = 1280, height: number = 720): Promise<Film> {
    const webpStream = new Readable()
    
    for (let i = 0; i <= this.content.length / (3 * width * height); i++) {
      const startIndex = i * 3 * width * height
      const endIndex = (i + 1) * 3 * width * height
      const frame = new Frame(this.content.slice(startIndex, endIndex), width, height)
      frame.writeToFile(`out/frames/frame${i}.webp`)
      // webpStream.push(await frame.getWebp())
    }

    webpStream.push(null)

    return new Film(`out/${this.getFileName()}.mkv`, webpStream)
  }
}
