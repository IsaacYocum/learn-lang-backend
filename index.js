const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.static('texts'))
app.use(cors())

app.get('/api/texts', (req, res) => {
    res.sendFile('sample.txt', {root: './texts'})
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})