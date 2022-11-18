const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const textsRoutes = require('./routes/text-routes')
const languagesRoutes = require('./routes/language-routes')
const wordRoutes = require('./routes/word-routes')

const app = express()
// app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname, 'texts')))
app.use(bodyParser.json());

// Load routes
app.use('/api', textsRoutes)
app.use('/api/languages', languagesRoutes);
app.use('/api', wordRoutes);

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