const express = require('express');
const port = process.env.PORT || 1000;
const mysql = require('mysql')
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'site'
});

db.connect((err) => {
    if(err){ throw err };
    console.log("MySQL Connected");
});
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/login.html");
})

app.post("/login", async (req, res) => {
    const { user, password } = req.body;

    const sql = `SELECT username FROM logindata WHERE username = "${user}"`
    db.query(sql, async (err, result) => {
        if(err) throw err;
        if (result[0].username == user){

            db.query(`SELECT password FROM logindata WHERE username="${user}"`, async (err, result) => {
                if(await bcrypt.compare(password, result[0].password)){
                    console.log("LOGGED IN");
                } else {
                    console.log("Invalid Password")
                }
            });


        }
    });
})

app.post("/register", async (req, res) => {
    const { user, password } = req.body;

    const sql = `SELECT username FROM logindata WHERE username = "${user}"`
    db.query(sql, async (err, result) =>  {
        if(err) throw err;
        if (result.length > 0) {
            console.log("Username already in use")
            return 
        }
        const hashedPass = await bcrypt.hash(password, 10)
        db.query(`INSERT INTO logindata SET ?`,{username:user, password:hashedPass}, (err, result) => {
            if(err) throw err;
            console.log("REGISTERED")
        });
    });
})

app.listen(port, () => 
console.log(`http://127.0.0.1:${port}`))
