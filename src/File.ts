export default class CustomFile {
    name: string
    type: string
    size: number
    content: string

    constructor(path: string, type: string, size: number) {
        this.name = path
        this.type = type
        this.size = size
        this.content = this.getContent()
    }

    getContent() {
        const file = new Blob(['hello world']); // your file


        const fr = new FileReader();
        fr.addEventListener('load', function () {
            var u = new Uint8Array(this.content),
                a = new Array(u.length),
                i = u.length;
            while (i--) // map to hex
                a[i] = (u[i] < 16 ? '0' : '') + u[i].toString(16);
            u = null; // free memory
            console.log(a); // work with this
        })
        fr.readAsArrayBuffer(file);
    }
}
