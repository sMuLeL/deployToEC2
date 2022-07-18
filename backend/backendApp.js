const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
const { stringify } = require('querystring');
const app = express();

const pool = new Pool({
    user: "itsuser",
    host: "dev-postgres",
    database: "itsdb",
    password: "itsuser01",
    port: "5432"
});



let formInput = 'Inserire il primo record';

app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);

app.use(express.static('asset'));

app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <section>
          <h2>HOME PAGE - ESAME FINALE ITS: corso DEVO</h2>
          <h3>Valore inserito: ${formInput}</h3>
        </section>
        <form action="/save" method="POST">
          <div class="form-control">
            <label>Una stringa</label>
            <input type="text" name="astring"><br>
            <label>Un numero</label>
            <input type="number" name="anum"><br>
            <label>Un item della lista</label>
            <select name="country">
            <option>Italy</option>
            <option>Germany</option>
            </select>           
          </div><br>
          <button>INSERISCI DATI</button>&nbsp;
          <button><a style='color:#FFFFFF' href=http://localhost:8080/find>CERCA</a></button>&nbsp;
          <button><a style='color:#FFFFFF' href=http://localhost:8080/list>VISULIZZA TUTTI</a></button>
        </form>
      </body>
    </html>
  `);
});

app.post('/save', (req, res) => {
    const enteredText = req.body.astring;
    const enteredNumber = req.body.anum;
    const enteredCountry = req.body.country
    console.log('valori inseriti: ' + enteredText + ',' + enteredNumber + ',' + enteredCountry);
    const url = "/";
    formInput = enteredText + ' - ' + enteredNumber + ' - ' + enteredCountry;


    pool.query(
        "INSERT INTO prova(nome, numero, country)VALUES('" + enteredText + "','" + enteredNumber + "','" + enteredCountry + "')",
        (err, res) => {
            const errorMessage = "";
            if (err) {
                errorMessage = "Insertion in db failed";
            }
            console.log(err, res, errorMessage);
        }
    );

    res.redirect(url);

});

app.get("/list", async(req, res) => {

    let myresult = '<table><tr><td><h3>NOME</h3></td><td><h3>NUMERO</h3></td><td><h3>ITEM</h3></td></tr>';
    const rows = await pool.query('SELECT * FROM prova');
    for (let i = 0; i < rows.rowCount; i++) {
        ajson = JSON.parse(JSON.stringify(rows.rows[i]));
        console.log(ajson.nome);
        myresult += "<tr><td>" + ajson.nome + "</td><td>" + ajson.numero + "</td><td>" + ajson.country + "</td></tr>";
    }
    myresult += '</table><br>';


    res.status(200).send(`
    <html>
      <head>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
      <section>
      <h2>ESAME FINALE ITS: corso DEVO</h2>
      <h3>Elenco record inseriti</h3>
       ${myresult}
       <button><a style='color:#FFFFFF' href=http://localhost:8080>HOME</a></button>&nbsp;
       <button><a style='color:#FFFFFF' href=http://localhost:8080/find>CERCA</a></button>
      
    </section>
      </body>
    </html>
    `);


});
app.get("/find", async(req, res) => {
    res.send(`
  <html>
    <head>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <section>
        <h2>RICERCA - ESAME FINALE ITS: corso DEVO</h2>
        <h3>RICERCA PER STRINGA</h3>
      </section>
      <form action="/mysearch" method="POST">
        <div class="form-control">
          <label>Testo di ricerca (nome)</label>
          <input type="text" name="astring">
        </div>
        <button>Cerca</button>&nbsp;
        <button><a style='color:#FFFFFF' href=http://localhost:8080>HOME</a></button>&nbsp;
        <button><a style='color:#FFFFFF' href=http://localhost:8080/list>VISULIZZA TUTTI</a></button>
      </form>
    </body>
  </html>
`);
});

app.post('/mysearch', async(req, res) => {
    const enteredText = req.body.astring;
    formInput = enteredText;
    // let query = 'SELECT * FROM prova WHERE nome ilike(\'%' + enteredText + '%\')';
    let query = 'SELECT * FROM prova WHERE nome = \'' + enteredText + '\'';
    console.log(query);
    let myresult = '<table><tr><td><h3>NOME</h3></td><td><h3>NUMERO</h3></td><td><h3>ITEM</h3></td></tr>';
    const rows = await pool.query(query);
    for (let i = 0; i < rows.rowCount; i++) {
        ajson = JSON.parse(JSON.stringify(rows.rows[i]));
        console.log(ajson.nome, rows);
        myresult += "<tr><td>" + ajson.nome + "</td><td>" + ajson.numero + "</td></tr>";
    }
    myresult += '</table><br>';

    res.status(200).send(`
    <html>
      <head>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
      <section>
      <h2>ESAME FINALE ITS: corso DEVO<</h2>
      <h3>RISULTATO DELLA RICERCA per ${enteredText}</h3>
       ${myresult}
      <button><a style='color:#FFFFFF' href=http://localhost:8080/>HOME</a></button>&nbsp;
      <button><a style='color:#FFFFFF' href=http://localhost:8080/find>FAI UN'ALTRA RICERCA</a></button>
      <button><a style='color:#FFFFFF' href=http://localhost:8080/list>VISULIZZA TUTTI</a></button>

    </section>
      </body>
    </html>
    `);
});

//res.redirect('/search');

app.listen(80);

//pool.end();