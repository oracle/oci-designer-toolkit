import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [, , rootArg, portArg] = process.argv
const root = rootArg ? path.resolve(rootArg) : path.resolve(fileURLToPath(import.meta.url), '../../..')
const port = Number.parseInt(portArg ?? '4173', 10)
const indexPath = path.join(root, 'index.html')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.wasm', 'application/wasm'],
])

function sendFile(res, filePath) {
  const ext = path.extname(filePath)
  const stream = fs.createReadStream(filePath)

  res.writeHead(200, {
    'Content-Type': contentTypes.get(ext) ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  })

  stream.pipe(res)
}

function resolveStaticPath(requestUrl) {
  const parsedUrl = new URL(requestUrl, `http://localhost:${port}`)
  const decodedPath = decodeURIComponent(parsedUrl.pathname)
  const candidate = path.resolve(root, `.${decodedPath}`)

  if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== root) {
    return null
  }

  return candidate
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid port: ${portArg}`)
}

if (!fs.existsSync(indexPath)) {
  throw new Error(`Static app index.html not found at ${indexPath}`)
}

const server = http.createServer((req, res) => {
  const candidate = resolveStaticPath(req.url ?? '/')

  if (!candidate) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  fs.stat(candidate, (statError, stat) => {
    if (!statError && stat.isFile()) {
      sendFile(res, candidate)
      return
    }

    sendFile(res, indexPath)
  })
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Serving ${root} at http://127.0.0.1:${port}\n`)
})
