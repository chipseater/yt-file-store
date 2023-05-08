import { createCanvas, ImageData } from 'canvas'
import sharp from 'sharp'

export default class {
  height: number
  width: number
  content: string

  constructor(content: string, width: number = 1280, height: number = 720) {
    this.content = content
    this.width = width
    this.height = height
  }

  async getImage() {
    const frame = createCanvas(this.width, this.height)
    const ctx = frame.getContext('2d')

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        // One byte per color channel
        const image_data = new ImageData(1, 1)
        const index = 6 * (y * this.width + x)
        if (this.content.length > index) {
          const segment = this.content
            .slice(index, index + 6)
            .split('')
            .map((item) => parseInt(item, 16))
          image_data.data[0] = segment[0] * 16 + segment[1]
          image_data.data[1] = segment[2] * 16 + segment[3]
          image_data.data[2] = segment[4] * 16 + segment[5]
          if (segment.length == 6) image_data.data[3] = 255
          if (segment.length == 4) image_data.data[3] = 200
          if (segment.length == 2) image_data.data[3] = 150
          // console.log(segment)
        } else {
          image_data[0] = 0
          image_data[1] = 0
          image_data[2] = 0
          image_data[3] = 0
        }
        ctx.putImageData(image_data, x, y)
      }
    }

    return await sharp(frame.toBuffer('image/png'))
      .png({
        compressionLevel: 0,
        adaptiveFiltering: false,
      })
      .toBuffer()
  }

  async writeToFile(path: string, image: Buffer) {
    sharp(image)
      .toFile(path)
      .catch((err) => console.warn(err))
  }
}
