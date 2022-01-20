const express = require('express')
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const fs = require('fs')

const db = new sqlite3.Database('./db/learn-lang.db')

const app = express()
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname, 'texts')))
app.use(bodyParser.json());

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

app.get('/api/texts/:title', (req, res) => {
    let text = decodeURI(req.params.title.toLocaleLowerCase());
    console.log(text)
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
    let language = req.params.language.toLocaleLowerCase();
    console.log(language)
    db.all(`SELECT * FROM languages
            WHERE language = '${language}'`, (err, rows) => {
        if (err) {
            res.status(404).send(`404: The language '${language}' does not exist.`)
            throw err;
        }

        res.json(rows[0])
    })
})

// Words endpoints

app.get('/api/languages/:language/words', (req, res) => {
    db.all('SELECT * FROM words', (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})


app.get('/api/languages/:language/words/:word', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();
    let word = req.params.word.toLocaleLowerCase();
    // console.log(language, word)
    db.parallelize(() => {
        db.all(`SELECT word, familiarity, translation FROM words
            WHERE word = '${word}' AND language ='${language}'`, (err, rows) => {
            if (err) {
                res.status(500).send(err.message)
                throw err;
            }

            if (rows[0] === undefined) {
                res.status(404).send(`404: The ${language} word '${word}' does not exist.`)
            }

            // console.log(rows[0])
            res.json(rows[0])
        })
    })
})

app.get('/api/languages/:language/words/:word/familiarity', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();
    let word = req.params.word.toLocaleLowerCase();
    // console.log(language, word)
    db.parallelize(() => {
        db.all(`SELECT familiarity FROM words
            WHERE word = '${word}' AND language ='${language}'`, (err, rows) => {
            if (err) {
                res.status(500).send(err.message)
                throw err;
            }

            if (!rows) {
                res.status(404).send(`404: The ${language} word '${word}' does not exist.`)
            }

            res.json(rows[0])
        })
    })
})

app.post('/api/languages/:language/getTextWords', (req, res) => {
    console.log(req.body)
    // let words = `(${req.body.join().toLocaleLowerCase()})`
    let words = `(${req.body.map(word => `'${word.toLocaleLowerCase()}'`).join(',')})`
    console.log(words)
    let language = req.params.language.toLocaleLowerCase();
    // console.log(language, word)
    db.parallelize(() => {
        db.all(`SELECT * FROM words
                WHERE word IN ${words} AND language ='${language}'`, (err, rows) => {
            console.log('db response', rows)
            if (err) {
                res.status(500).send(err.message)
                throw err;
            }

            if (!rows) {
                res.json([])
            }

            // console.log(rows[0])
            if (rows) {
                res.json(rows)

            }
        })
    })
})

app.post('/api/addtext', (req, res) => {
    let title = req.body.title.toLowerCase()
    let text = req.body.text
    fs.writeFileSync(`./texts/${title}.txt`, text, err => {
        if (err) throw (err)
    })

    res.sendStatus(201)
})

app.delete('/api/deletetext/:text', (req, res) => {
    console.log(req.params)
    let textToDelete = req.params.text
    fs.unlinkSync(`./texts/${textToDelete}`, err => {
        if (err) throw (err)
    })

    res.sendStatus(200)
})

// Catch everything else
// Needed for heroku
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

const PORT = 3001
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})