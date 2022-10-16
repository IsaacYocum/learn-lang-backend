const express = require('express')
const router = express.Router()
const db = require('../db')
const utils = require('../utils/utils')

// Words endpoints ====================================================================================================
router.get('/languages/:language/words/:word', (req, res) => {
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

router.put('/languages/:language/words/:word', (req, res) => {
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

router.post('/languages/:language/words/:word', (req, res) => {
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

router.get('/languages/:language/words', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();

    let query = db.prepare("SELECT * FROM words WHERE language = ?")
    query.all(language, (err, rows) => {
        if (err) throw err;
        let words = {}
        rows.forEach(row => {
            words[row.word] = row;
        })
        console.log('words', words);
        res.json(words)
    })
})


// app.get('/languages/:language/words/:word/familiarity', (req, res) => {
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
router.post('/languages/:language/getTextWords', (req, res) => {
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

module.exports = router;