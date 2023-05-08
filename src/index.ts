import ffmpeg from 'fluent-ffmpeg'
import { fileURLToPath } from 'url'
import path from 'path'
import File from './File.js'
import Film from './Film.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
ffmpeg.setFfmpegPath(
  path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg'),
)

const file = new File('song.mp3')
const film = new Film('song')

;(await file.toFilm()).command
  .on('end', async () => {
    const hex_content = await film.toFile('song_copy.mp3')
    console.log(hex_content.length, file.content.length)
  })
  .run()
  
