const express = require('express')
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')
const app = express();
const port = 4000;


app.set('view engine','ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('data.db',(err)=>{
    if(err){
        console.log('error creating database '+err)
    }else{
        console.log('Database created successfully')
    }
})

const query = 'DROP TABLE isrealgabriel';

db.run(query,(err,rows)=>{
    console.log(rows)
})