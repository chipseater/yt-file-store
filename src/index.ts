import File from './File.js'
import Film from './Film.js'

const file = new File('song.mp3')
const film = new Film('song')

// ;(await file.toFilm()).command.run()
film.toFile()
