const express = require('express')
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path')

const db = new sqlite3.Database('./db/learn-lang.db')

const app = express()
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname, 'texts')))
app.use(bodyParser.json());

// Texts endpoints ====================================================================================================
app.get('/api/texts', (req, res) => {
    db.all('SELECT textId, title FROM texts', (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})

app.get('/api/texts/:textId', (req, res) => {
    let textId = req.params.textId
    console.log(textId)
    db.all(`SELECT textId, title, text FROM texts
            WHERE textId = '${textId}'
            LIMIT 1`, (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})

app.post('/api/addtext', (req, res) => {
    let query = db.prepare("INSERT INTO texts(title, text, language) VALUES(?, ?, ?)")
    query.run([req.body.title, req.body.text, 'english'], (err) => {
        if (err) throw err;
    })

    res.sendStatus(201)
})

app.put('/api/edittext/:textId', (req, res) => {
    let query = db.prepare("UPDATE texts SET title = ?, text = ?, language = ? WHERE textId = ?")
    query.run([req.body.title, req.body.text, req.body.language, req.body.textId], (err) => {
        if (err) throw err;
    })

    res.sendStatus(200)
})

app.delete('/api/deletetext/:textId', (req, res) => {
    console.log(req.params)
    let query = db.prepare("DELETE FROM texts WHERE textId = ?")
    query.run([req.params.textId])

    res.sendStatus(200)
})

// Languages endpoints ================================================================================================
app.get('/api/languages', (req, res) => {
    db.all('SELECT * FROM languages', (err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})

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

// Words endpoints ====================================================================================================
app.get('/api/languages/:language/words', (req, res) => {
    // db.all('SELECT * FROM words', (err, rows) => {
    let query = db.prepare('SELECT * FROM words')
    query.all((err, rows) => {
        if (err) throw err;
        console.log(rows);
        res.json(rows)
    })
})

app.get('/api/languages/:language/words/:word', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();
    let word = req.params.word.toLocaleLowerCase();

    let query = db.prepare("SELECT word, familiarity, translation FROM words WHERE word = ? AND language = ?")
    query.all(word, language, (err, rows) => {
        if (err) {
            res.status(500).send(err.message)
            throw err;
        }

        if (rows[0] === undefined) {
            res.status(404).send(`404: The ${language} word '${word}' does not exist.`)
        }

        res.json(rows[0])
    })
})

// app.get('/api/languages/:language/words/:word/familiarity', (req, res) => {
//     let language = req.params.language.toLocaleLowerCase();
//     let word = req.params.word.toLocaleLowerCase();
//     // console.log(language, word)
//     db.parallelize(() => {
//         db.all(`SELECT familiarity FROM words
//             WHERE word = '${word}' AND language ='${language}'`, (err, rows) => {
//             if (err) {
//                 res.status(500).send(err.message)
//                 throw err;
//             }

//             if (!rows) {
//                 res.status(404).send(`404: The ${language} word '${word}' does not exist.`)
//             }

//             res.json(rows[0])
//         })
//     })
// })

// Get all known words from the text being viewed
app.post('/api/languages/:language/getTextWords', (req, res) => {
    let words = req.body.map(word => word.toLowerCase())
    let wordMap = words.map(() => "?").join(',')
    // let wordMap2 = words.map(word => `'${word.toLowerCase()}'`).join(',')
    let language = req.params.language.toLowerCase();

    // TODO: figure out how to make language bind correctly
    let query = db.prepare(`SELECT * FROM words WHERE word IN (${wordMap}) AND language = '${language}'`)
    // console.log(query.sql)
    query.all(words, (err, rows) => {
        // db.all(`SELECT * FROM words WHERE word IN (${wordMap2}) AND language = '${language}'`, (err, rows) => {
        if (err) {
            res.status(500).send(err.message)
            throw err;
        }

        if (!rows) {
            res.json([])
        }

        if (rows) {
            res.json(rows)
        }
    })
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