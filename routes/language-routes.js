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

router.get('/:language', (req, res) => {
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

module.exports = router;