const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let dbFilePath = './db/learn-lang.db';

// open database in memory
let db = new sqlite3.Database('./db/learn-lang.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

if (!fs.existsSync(dbFilePath)) {
  db.get("PRAGMA foreign_keys = ON")

  // setup tables
  db.serialize(() => {
    db.run(`CREATE TABLE settings(
        settingsId INTEGER PRIMARY KEY,
        settings TEXT
    )`).run(`INSERT INTO settings(settings)
            VALUES ('{"test": "globalSettings"}')`)
          .each(`SELECT * from settings`, (err, row) => {
              if (err) throw err;
              console.log(row)
          })

    db.run(`CREATE TABLE languages(
        language TEXT PRIMARY KEY,
        dictionary1Uri TEXT,
        dictionary2Uri TEXT,
        googleTranslateUri TEXT,
        regExpSplitSentences TEXT,
        exceptionsSplitSentences TEXT,
        regExpWordCharacters TEXT
    )`)
      .run(`INSERT INTO languages(language, dictionary1Uri, dictionary2Uri, googleTranslateUri, regExpSplitSentences, exceptionsSplitSentences, regExpWordCharacters)
            VALUES ('english', '', '', '', '', '', ''),
                   ('vietnamese', '', '', '', '', '', '')`)
      .each(`SELECT * FROM languages`, (err, row) => {
        if (err) throw err;
        console.log(row)
      })
  
    db.run(`CREATE TABLE texts(textId INTEGER PRIMARY KEY,
                               language TEXT,
                               title TEXT,
                               text TEXT,
                               FOREIGN KEY(language) REFERENCES languages(language))`)
      .run(`INSERT INTO texts(title, text, language)
            VALUES ('sample title1', 'sample text1', 'vietnamese'),
                   ('sample title2', 'sample text2', 'english')`)
      .each(`SELECT * FROM texts`, (err, row) => {
        if (err) throw err;
        console.log(row)
      })
  
    db.run(`CREATE TABLE words(word TEXT PRIMARY KEY, 
                               language TEXT,
                               familiarity INTEGER,
                               translation TEXT,
                               FOREIGN KEY(language) REFERENCES languages(language))`)
      .run(`INSERT INTO words(word, language, familiarity, translation)
            VALUES ('the', 'english', 5, 'the translation'),
                   ('and', 'vietnamese', 5, 'and translation'),
                   ('boy', 'english', 4, 'boy translation'),
                   ('who', 'english', 3, 'who translation'),
                   ('lived', 'english', 2, 'lived translation')`)
      .each(`SELECT word FROM words`, (err, row) => {
        if (err) throw err;
        console.log(row.word)
      })
  });
}

// close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });

module.exports = db;
