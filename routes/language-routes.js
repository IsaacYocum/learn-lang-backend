const express = require('express')
const router = express.Router()
const db = require('../db')

// Languages endpoints ================================================================================================
router.get('/', (req, res) => {
    let query = db.prepare('SELECT * FROM languages')
    query.all((err, rows) => {
        if (err) throw err;
        res.json(rows)
    })
})

// Get language
router.get('/:language', (req, res) => {
    let query = db.prepare('SELECT * FROM languages WHERE language = ?')
    query.all([req.params.language], (err, rows) => {
        if (err) throw err;
        res.json(rows[0])
    })
})

// Create language
router.post('/', (req, res) => {
    let query = db.prepare(`INSERT INTO languages(
            language, 
            dictionary1Uri, 
            dictionary2Uri, 
            googleTranslateUri, 
            regExpSplitSentences, 
            exceptionsSplitSentences, 
            regExpWordCharacters
        ) 
        VALUES(?, ?, ?, ?, ?, ?, ?)`)
    console.log(req.body)
    query.run([
        req.body.language, 
        req.body.dictionary1Uri,
        req.body.dictionary2Uri,
        req.body.googleTranslateUri, 
        req.body.regExpSplitSentences,
        req.body.exceptionsSplitSentences,
        req.body.regExpWordCharacters
    ], function (err) {
        if (err) throw err;
    })
    res.sendStatus(201)
})

// Edit language 
router.put('/:language', (req, res) => {
    console.log('put', req.body)
    let query = db.prepare(`UPDATE languages SET 
            dictionary1Uri = ?,
            dictionary2Uri = ?,
            googleTranslateUri = ?,
            regExpSplitSentences = ?,
            exceptionsSplitSentences = ?,
            regExpWordCharacters = ?
        WHERE language = ?`)
    query.run([
        req.body.dictionary1Uri,
        req.body.dictionary2Uri,
        req.body.googleTranslateUri, 
        req.body.regExpSplitSentences,
        req.body.exceptionsSplitSentences,
        req.body.regExpWordCharacters,
        req.params.language
    ], (err) => {
        if (err) throw err;
    })

    res.sendStatus(200)
})

// Delete language 
router.delete('/:language', (req, res) => {
    console.log('delete', req.params.language)
    let query = db.prepare("DELETE FROM languages WHERE language = ?")
    query.run([req.params.language], (err) => {
        if (err) throw err;
    })

    res.sendStatus(200)
})

router.get('/languagesdetails', (req, res) => {
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

module.exports = router;

