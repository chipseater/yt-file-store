import ffmpeg from 'fluent-ffmpeg'
import { fileURLToPath } from 'url'
import path from 'path'
import File from './File.js'
import Film from './Film.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
ffmpeg.setFfmpegPath(
  path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg'),
)

const file = new File('README.md')
const film = new Film('README')

;(await file.toFilm()).command
  .on('end', () => {
    film.toFile()
  })
  .run()
  
