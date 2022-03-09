const express = require('express');
const mysql = require('mysql')
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');

const port = process.env.PORT || 1000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'site'
});

db.connect((err) => {
    if(err){ throw err };
    console.log("MySQL Connected");
});

app.get("/", (req, res) => {
    console.log(__dirname)
    res.sendFile(__dirname + "/static/home.html");
})
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/static/login.html");
})
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/static/register.html");
})

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if(req.body.length < 2 ) {return res.status(400).json({err:"Empty fields"})}
    username = sanitizeHtml(username,{allowedTags: [], allowedAttributes: {}})
    password = sanitizeHtml(password,{allowedTags: [], allowedAttributes: {}})

    verify(secret, token)
    .then((data) => {
        if (data.success === true) {
        console.log('success!', data);
        } else {
        console.log('verification failed');
        }
    })
    .catch(console.error);

    db.query("SELECT username FROM logindata WHERE username = ?",[username], async (err, result) => {
        if(err) throw err;
        if (result.length > 0){

            db.query("SELECT password FROM logindata WHERE username=?",[username], async (err, result) => {
                if(await bcrypt.compare(password, result[0].password)){
                    console.log("LOGGED IN");
                    return res.redirect("/login")
                } else {
                    console.log("Invalid Password")
                }
            });
        }
    });
    return res.status(400).json({err:"Invalid username or password"})
})

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if(req.body.length < 2 ) {return res.status(400).json({err:"Empty fields"})}
    username = sanitizeHtml(username,{allowedTags: [], allowedAttributes: {}})
    password = sanitizeHtml(password,{allowedTags: [], allowedAttributes: {}})

    db.query("SELECT username FROM logindata WHERE username = ?",[username], async (err, result) =>  {
        if(err) throw err;
        if (result.length > 0) {
            console.log("Username already in use")
            return res.status(400).json({err:"User already exists"})
        }
        const hashedPass = await bcrypt.hash(password, 10)
        db.query("INSERT INTO logindata SET ?",[{username:username, password:hashedPass}], (err, result) => {
            if(err) throw err;
            console.log("REGISTERED")
            res.redirect("/login")
        });
    });
})

app.listen(port, () => 
console.log(`http://127.0.0.1:${port}`))
