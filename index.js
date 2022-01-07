const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.static('texts'))
app.use(cors())

app.get('/api/texts', (req, res) => {
  const testFolder = './texts/';
  const fs = require('fs');

  fs.readdir(testFolder, (err, files) => {
    if (err) throw err;
    let texts = {
      texts: []
    }
    files.forEach(file => {
      texts['texts'].push(file)
    });
    res.send(texts)
  });
  // res.sendFile('sample.txt', {root: './texts'})
})

app.get('/api/texts/:text', (req, res) => {
  let text = req.params.text;
  res.sendFile(text, {root: './texts'})
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})