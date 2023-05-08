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
    const imageStream = new Readable()
    
    for (let i = 0; i <= this.content.length / (6 * width * height); i++) {
      const startIndex = i * 6 * width * height
      const endIndex = (i + 1) * 6 * width * height
      const frame = new Frame(this.content.slice(startIndex, endIndex), width, height)
      const image = await frame.getImage()
      await frame.writeToFile(`out/frames/frame${i}.png`, image)
      imageStream.push(image)
    }

    imageStream.push(null)

    return new Film(this.getFileName(), imageStream)
  }
}
