import { createCanvas, ImageData } from 'canvas'
import fs from 'fs'
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

  async getWebp() {
    const frame = createCanvas(this.width, this.height)
    const ctx = frame.getContext('2d')

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        // One byte per color channel
        const image_data = new ImageData(1, 1)
        const index = y * this.width + x
        if (this.content.length > index) {
          image_data.data[0] = parseInt(this.content[index], 16) * 16
          image_data.data[1] = parseInt(this.content[index + 1], 16) * 16
          image_data.data[2] = parseInt(this.content[index + 2], 16) * 16
        } else {
          image_data.data[0] = 255
          image_data.data[1] = 255
          image_data.data[2] = 255
        }
        image_data.data[3] = 255
        ctx.putImageData(image_data, x, y)
      }
    }

    return await sharp(frame.toBuffer('image/png'))
      .png({
        compressionLevel: 0, // set compression level to 0 for lossless compression
        adaptiveFiltering: false, // disable adaptive filtering for lossless compression
      })
      .toBuffer()
  }

  async writeToFile(path: string) {
    sharp(await this.getWebp())
      .toFile(path)
      .then(res => {console.log('hi');console.log(res)})
      .catch(err => console.warn(err))
  }
}
