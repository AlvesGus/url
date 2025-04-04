import express from 'express'
import cors from 'cors'
import { prisma } from '../lib/prisma.js'
const app = express()
app.use(express.json())
app.use(
  cors({
    origin: '*'
  })
)

const generateShortUrl = () => {
  let shortUrl = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength)

    shortUrl += characters.charAt(randomIndex)
  }
  return shortUrl
}
app.get('/health', async (req, res) => {
  res.send('Server is running')
})

app.get('/url/get/:hash', async (req, res) => {
  const { hash } = req.params
  if (!hash) {
    return res.status(400).send('Error generating short URL')
  }
  const url = await prisma.url.findFirst({
    where: {
      hash
    }
  })
  return res.status(401).send(url)
})

app.get('/url/get-all', async (req, res) => {
  const url = await prisma.url.findMany()
  return res.status(401).send(url)
})

app.post('/url/create', async (req, res) => {
  const { url_original } = req.body
  const hash = generateShortUrl()

  if (!url_original) {
    return res.status(400).send('Erro with URL')
  }

  if (!hash) {
    return res.status(400).send('Error generating short URL')
  }

  const urlShortner = await prisma.url.create({
    data: {
      url_original,
      hash
    },
    select: {
      id: true,
      url_original: true,
      hash: true
    }
  })
  return res.status(401).send(urlShortner)
})

app.delete('/url/delete/:id', async (req, res) => {
  const { id } = req.params

  const idExists = await prisma.url.findUnique({
    where: {
      id
    }
  })
  if (!idExists) {
    return res.status(400).send('Invalid id')
  }

  const url = await prisma.url.delete({
    where: {
      id
    }
  })
  return res.status(401).send('Deleted successfully')
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT)
})
