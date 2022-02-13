const express = require('express')
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { resolve } = require('path');

const db = new sqlite3.Database('./db/learn-lang.db')

const app = express()
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname, 'texts')))
app.use(bodyParser.json());

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isEmptyArray(array) {
    return Array.isArray(array) && array.length === 0
}

// Texts endpoints ====================================================================================================
// Get all texts in language
app.get('/api/languages/:language/texts', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();

    let query = db.prepare('SELECT textId, title FROM texts WHERE language = ?')
    query.all([language], (err, rows) => {
        if (err) throw err;
        console.log('texts', rows);
        res.json(rows)
    })
})

// Get text
app.get('/api/texts/:textId', (req, res) => {
    let textId = req.params.textId
    console.log('get', textId)

    if (isNumeric(textId)) {
        let query = db.prepare('SELECT * FROM texts WHERE textId = ? LIMIT 1')
        query.all(textId, (err, rows) => {
            if (err) throw err;
            if (isEmptyArray(rows)) {
                res.sendStatus(404)
            } else {
                res.json(rows[0])
            }
        })
    } else {
        res.status(400)
        res.send('An invalid textId was specified.')
    }
})

// Edit text
app.put('/api/texts/:textId', (req, res) => {
    console.log('put', req.body)
    let query = db.prepare("UPDATE texts SET title = ?, text = ? WHERE textId = ?")
    query.run([req.body.title, req.body.text, req.params.textId], (err) => {
        if (err) throw err;
    })

    res.sendStatus(200)
})

// Delete text
app.delete('/api/texts/:textId', (req, res) => {
    if (req.params.textId) {
        let query = db.prepare("DELETE FROM texts WHERE textId = ?")
        query.run([req.params.textId], (err, rows) => {
            if (err) {
                res.sendStatus(404)
            };

            res.sendStatus(200)
        })
    }
})

app.post('/api/addtext', (req, res) => {
    let query = db.prepare("INSERT INTO texts(title, text, language) VALUES(?, ?, ?)")
    query.run([req.body.title, req.body.text, req.body.language], function (err) {
        if (err) {
            throw err;
        } else {
            res.status(201)
            res.set('Location', "/texts/viewtext/" + this.lastID)
            res.send()
        }
    })
})



// Languages endpoints ================================================================================================
app.get('/api/languages', (req, res) => {
    let query = db.prepare('SELECT * FROM languages')
    query.all((err, rows) => {
        if (err) throw err;
        res.json(rows)
    })
})

app.get('/api/languages/languagesdetails', (req, res) => {
    let query = db.prepare(`SELECT distinct l.language AS id, COUNT(distinct w.word) AS Words, COUNT(distinct t.textId) AS Texts
                            FROM languages l 
                            INNER JOIN words w
                            ON l.language = w.language
                            INNER JOIN texts t
                            ON w.language = t.language
                            GROUP BY l.language
                            ORDER BY l.language`)
    query.all((err, rows) => {
        console.log('language details', rows)
        if (err) {
            res.status(404).send(`404: The language '${language}' does not exist.`)
            throw err;
        }

        res.json(rows)
    })
})

app.get('/api/languages/:language', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();

    let query = db.prepare("SELECT * FROM languages WHERE language = ?")
    query.all(language, (err, rows) => {
        if (err) {
            res.status(404).send(`404: The language '${language}' does not exist.`)
            throw err;
        }

        res.json(rows[0])
    })
})



// Words endpoints ====================================================================================================
app.get('/api/languages/:language/words/:word', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();
    let word = req.params.word.toLocaleLowerCase();

    let query = db.prepare("SELECT * FROM words WHERE word = ? AND language = ?")
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

app.put('/api/languages/:language/words/:word', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();
    let word = req.params.word.toLocaleLowerCase();
    let wordObj = req.body.editedWord
    console.log('update word', word, language)
    console.log('word = ', wordObj)

    let query = db.prepare("UPDATE words SET translation = ?, familiarity = ? WHERE word = ? AND language = ?")
    query.run([wordObj.translation, wordObj.familiarity, wordObj.word.toLowerCase(), word.language], (err) => {
        if (err) {
            throw err;
        } else {
            res.sendStatus(200)
        }
    })
})

app.post('/api/languages/:language/words/:word', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();
    let word = req.params.word.toLocaleLowerCase();
    let wordObj = req.body.editedWord
    console.log('create word', word, language)
    console.log('word = ', wordObj)

    let query = db.prepare("INSERT INTO words(word, language, familiarity, translation) VALUES(?, ?, ?, ?)")
    query.run([word, language, wordObj.familiarity, wordObj.translation], (err) => {
        if (err) {
            throw err;
        } else {
            res.sendStatus(201)
        }
    })
})

app.get('/api/languages/:language/words', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();

    let query = db.prepare("SELECT * FROM words WHERE language = ?")
    query.all(language, (err, rows) => {
        if (err) throw err;
        console.log('words', rows);
        res.json(rows)
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
    let words = req.body.map(word => word.toLowerCase() + '%')
    let language = req.params.language.toLowerCase();
    // console.log(words, words.length)

    // For larger queries, I need to separate the sql query into smaller chunks. Otherwise this error happens
    // SQLite error: FTS expression tree is too large (maximum depth 1000)
    let wordChunks = []
    while (words.length > 0) {
        wordChunks.push(words.splice(0, 500))
    }
    // console.log('wordChunks', wordChunks, wordChunks.length)

    let preparedChunks = []
    wordChunks.forEach((chunk) => {
        let preparedChunk = ''
        chunk.forEach((c, i) => {
            if (i < chunk.length - 1) {
                preparedChunk += 'word LIKE ? OR '
            } else {
                preparedChunk += 'word LIKE ?'
            }
        })
        preparedChunks.push(preparedChunk)
    })
    // console.log('preparedChunks', preparedChunks, preparedChunks.length)
    
    let results = []
    let queryDb = new Promise((resolve, reject) => {
        preparedChunks.forEach((preparedChunk, i) => {
            let query = db.prepare(`SELECT * FROM words WHERE ${preparedChunk} AND language = ?`, [...wordChunks[i], language])
            query.all((err, rows) => {
                if (err) {
                    res.status(500).send(err.message)
                    throw err;
                }

                if (rows) {
                    // console.log('rows', rows, typeof rows)
                    results = results.concat(rows)
                }

                if (i == preparedChunks.length - 1) {
                    resolve()
                }
            })
        })
    })

    queryDb.then(() => {
        console.log('results', results, typeof results)
        res.json(results)
    })
})

// Catch everything else
// Needed for heroku
app.get('*', (req, res) => {
    if (req.originalUrl.includes('ViewTextWindows')) {
        console.log(req)
        res.sendFile(path.join(__dirname + '/build/index.html'));
    }

    res.sendFile(path.join(__dirname + '/build/index.html'));
});

const PORT = 3001
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})