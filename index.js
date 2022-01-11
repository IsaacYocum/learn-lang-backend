const express = require('express')
const app = express()
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/learn-lang.db')

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
    res.sendFile(text, { root: './texts' })
})

// Languages endpoints
app.get('/api/languages', (req, res) => {
    db.all('SELECT * FROM languages', (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})

// Languages endpoints
app.get('/api/languages/:language', (req, res) => {
    let language = req.params.language;
    console.log(language)
    db.all(`SELECT * FROM languages
            WHERE language = '${language}'`, (err, rows) => {
        if (err) {
            res.status(404).send(`404: The language '${language}' does not exist.`)
            throw err;
        }
    
        res.json(rows)
    })
})

// Languages endpoints
app.get('/api/languages/:language/words', (req, res) => {
    db.all('SELECT * FROM words', (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})

// Languages endpoints
app.get('/api/languages/:language/words', (req, res) => {
    let language = req.params.language;
    console.log(language)
    db.all(`SELECT * FROM words
            WHERE word = '${language}'`, (err, rows) => {
        if (err) {
            res.status(404).send(`404: The language '${language}' does not exist.`)
            throw err;
        }
    
        res.json(rows)
    })
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})