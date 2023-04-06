import fs from 'fs'

export default class CustomFile {
    path: string
    content: string

    constructor(path: string) {
        this.path = path
        this.content = fs.readFileSync(this.path, 'hex')
        
    }
}
