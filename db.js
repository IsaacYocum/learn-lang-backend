const sqlite3 = require('sqlite3').verbose();

// open database in memory
let db = new sqlite3.Database('./db/learn-lang.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

db.get("PRAGMA foreign_keys = ON")

// setup tables
db.serialize(() => {
  db.run(`CREATE TABLE languages(language TEXT PRIMARY KEY)`)
    .run(`INSERT INTO languages(language)
          VALUES ('english'),
                 ('vietnamese')`)
    .each(`SELECT language from languages`, (err, row) => {
      if (err) throw err;
      console.log(row.language)
    })

  db.run(`CREATE TABLE words(wordId INTEGER PRIMARY KEY, 
                             language TEXT,
                             word TEXT,
                             FOREIGN KEY(language) REFERENCES languages(language))`)
    .run(`INSERT INTO words(language, word)
          VALUES ('english', 'the'),
                 ('english', 'boy'),
                 ('english', 'who'),
                 ('english', 'lived')`)
    .each(`SELECT word from words`, (err, row) => {
      if (err) throw err;
      console.log(row.word)
    })
});

// close the database connection
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});