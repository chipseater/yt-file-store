import fs from 'fs'
import canvas, { Canvas, createCanvas } from 'canvas'

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

  dumpData(path: string, hex_value: string): void {
    this.content = hex_value
    fs.writeFileSync(path, hex_value, { encoding: 'hex' })
  }

  toFrames(width: number = 1280, height: number = 720): Canvas[] {
    const nb_of_pixels = this.content.length / 3
    const nb_of_frames = nb_of_pixels / (width * height)
    const frames: Canvas[] = []

    for (let i = 0; i < nb_of_frames; i++) {
      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const image_data = new ImageData(1, 1)
          const index = x * y * 3
          image_data.data[0] = parseInt(this.content[index], 16) * 16
          image_data.data[1] = parseInt(this.content[index + 1], 16) * 16
          image_data.data[2] = parseInt(this.content[index + 2], 16) * 16
          image_data.data[3] = 255
          ctx.putImageData(image_data, x, y)
        }
      }
    }
    return frames
  }
}
