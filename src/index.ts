import File from './File.js'
import Film from './Film.js'

const file = new File('song.mp3')
const film = new Film('out/song.mp4')

// console.log(file.content)
// file.toFilm().command.run()

film.toFile()
