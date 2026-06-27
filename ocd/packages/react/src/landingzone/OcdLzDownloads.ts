/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** TypeScript port of the LZNG `downloads.js` service. Builds an in-browser tar
** archive (USTAR) of the generated files and triggers browser downloads.
*/

const encoder = new TextEncoder()

export interface DownloadFile {
    name: string
    content: string
}

function writeString(target: Uint8Array, offset: number, value: string, length: number): void {
    const bytes = encoder.encode(value)
    target.set(bytes.slice(0, length), offset)
}

function writeOctal(target: Uint8Array, offset: number, value: number, length: number): void {
    const text = value.toString(8).padStart(length - 1, '0') + '\0'
    writeString(target, offset, text, length)
}

function pad512(length: number): number {
    return Math.ceil(length / 512) * 512
}

function tarHeader(name: string, size: number): Uint8Array {
    if (name.length > 100) {
        throw new Error(`Tar file name is too long: ${name}`)
    }

    const header = new Uint8Array(512)
    writeString(header, 0, name, 100)
    writeOctal(header, 100, 0o644, 8)
    writeOctal(header, 108, 0, 8)
    writeOctal(header, 116, 0, 8)
    writeOctal(header, 124, size, 12)
    writeOctal(header, 136, Math.floor(Date.now() / 1000), 12)
    writeString(header, 148, '        ', 8)
    header[156] = '0'.charCodeAt(0)
    writeString(header, 257, 'ustar', 6)
    writeString(header, 263, '00', 2)

    let checksum = 0
    for (const byte of header) checksum += byte
    writeOctal(header, 148, checksum, 8)
    return header
}

export function buildTarBytes(files: DownloadFile[]): Uint8Array<ArrayBuffer> {
    const chunks: Uint8Array[] = []
    for (const file of files) {
        const body = encoder.encode(file.content)
        const padded = new Uint8Array(pad512(body.length))
        padded.set(body)
        chunks.push(tarHeader(file.name, body.length), padded)
    }
    chunks.push(new Uint8Array(512), new Uint8Array(512))

    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const out = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
        out.set(chunk, offset)
        offset += chunk.length
    }
    return out
}

function downloadBlob(name: string, blob: Blob): void {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
}

export function downloadTextFile(name: string, content: string): void {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
    downloadBlob(name, blob)
}

export function downloadTar(name: string, files: DownloadFile[]): void {
    const blob = new Blob([buildTarBytes(files)], { type: 'application/x-tar' })
    downloadBlob(name, blob)
}
