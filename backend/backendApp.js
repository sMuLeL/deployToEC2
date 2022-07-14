const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
const { stringify } = require('querystring');
const app = express();

const pool = new Pool({
    user: "postgres",
    host: "danelon-simulazione2.c9nj1x2p6gk5.eu-west-1.rds.amazonaws.com",
    database: "itsdb",
    password: "Vmware1!",
    port: "5432"
});

let formInput = 'Nessun dato ancora inserito';

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
          <h2>PROVA ITS</h2>
          <h3>Valore inserito: ${formInput}</h3>
        </section>
        <form action="/save" method="POST">
          <div class="form-control">
            <label>Text</label>
            <input type="text" name="astring">
            <label>Number</label>
            <input type="number" name="anum">
          </div><br>
          <button>Acquisci il testo</button>&nbsp;
          <button><a style='color:#FFFFFF' href=http://localhost:80/find>CERCA</a></button>&nbsp;
          <button><a style='color:#FFFFFF' href=http://localhost:80/list>VISULIZZA TUTTI</a></button>
        </form>
      </body>
    </html>
  `);
});

app.post('/save', (req, res) => {
    const enteredText = req.body.astring;
    const enteredNumber = req.body.anum;
    console.log('valori inseriti: ' + enteredText + ',' + enteredNumber);
    const url = "/";
    formInput = enteredText + ' - ' + enteredNumber;


    pool.query(
        "INSERT INTO prova(nome, numero)VALUES('" + enteredText + "','" + enteredNumber + "')",
        (err, res) => {
            var errorMessage = "";
            if (err) {
                errorMessage = "Insertion in db failed";
            }
            console.log(err, res, errorMessage);
        }
    );

    res.redirect(url);

});

app.get("/list", async(req, res) => {

    let myresult = '<table><tr><td><h3>NOME</h3></td><td><h3>NUMERO</h3></td></tr>';
    const rows = await pool.query('SELECT * FROM prova');
    for (let i = 0; i < rows.rowCount; i++) {
        ajson = JSON.parse(JSON.stringify(rows.rows[i]));
        console.log(ajson.nome);
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
      <h2>PROVA ITS</h2>
      <h3>Valori inseriti</h3>
       ${myresult}
       <button><a style='color:#FFFFFF' href=http://localhost:80>HOME</a></button>&nbsp;
       <button><a style='color:#FFFFFF' href=http://localhost:80/find>CERCA</a></button>
      
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
        <h2>PROVA ITS</h2>
        <h3>RICERCA PER NOME</h3>
      </section>
      <form action="/mysearch" method="POST">
        <div class="form-control">
          <label>Testo di ricerca</label>
          <input type="text" name="astring">
        </div>
        <button>Cerca</button>&nbsp;
        <button><a style='color:#FFFFFF' href=http://localhost:80>HOME</a></button>&nbsp;
        <button><a style='color:#FFFFFF' href=http://localhost:80/list>VISULIZZA TUTTI</a></button>
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
    let myresult = '<table><tr><td><h3>NOME</h3></td><td><h3>NUMERO</h3></td></tr>';
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
      <h2>PROVA ITS</h2>
      <h3>RISULTATO DELLA RICERCA per ${enteredText}</h3>
       ${myresult}
      <button><a style='color:#FFFFFF' href=http://localhost:80/>HOME</a></button>&nbsp;
      <button><a style='color:#FFFFFF' href=http://localhost:80/find>FAI UN'ALTRA RICERCA</a></button>
      <button><a style='color:#FFFFFF' href=http://localhost:80/list>VISULIZZA TUTTI</a></button>

    </section>
      </body>
    </html>
    `);
});

//res.redirect('/search');

app.listen(80);

//pool.end();