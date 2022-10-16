const express = require('express')
const router = express.Router()
const db = require('../db')
const utils = require('../utils/utils')

// Texts endpoints ====================================================================================================
// Get all texts in language
router.get('/languages/:language/texts', (req, res) => {
    let language = req.params.language.toLocaleLowerCase();

    let query = db.prepare('SELECT textId, title FROM texts WHERE language = ?')
    query.all([language], (err, rows) => {
        if (err) throw err;
        console.log('texts', rows);
        res.json(rows)
    })
})

// Get text
router.get('/texts/:textId', (req, res) => {
    let textId = req.params.textId
    console.log('get', textId)

    if (utils.isNumeric(textId)) {
        let query = db.prepare('SELECT * FROM texts WHERE textId = ? LIMIT 1')
        query.all(textId, (err, rows) => {
            if (err) throw err;
            if (utils.isEmptyArray(rows)) {
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
router.put('/texts/:textId', (req, res) => {
    console.log('put', req.body)
    let query = db.prepare("UPDATE texts SET title = ?, text = ? WHERE textId = ?")
    query.run([req.body.title, req.body.text, req.params.textId], (err) => {
        if (err) throw err;
    })

    res.sendStatus(200)
})

// Delete text
router.delete('/texts/:textId', (req, res) => {
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

router.post('/addtext', (req, res) => {
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

module.exports = router;