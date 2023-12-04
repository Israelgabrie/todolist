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
var tableName = '';

function createTodoTable(tableAndemail,name,password){
    var aindex;
    for(var i=0;i<tableAndemail.length;i++){
        if(tableAndemail[i] == '@'){
            var aindex = i;
        }
    }

    tableName = tableAndemail.substring(0,aindex)
    const createTodoTable = `CREATE TABLE IF NOT EXISTS ${tableName}(id INTEGER PRIMARY KEY AUTOINCREMENT,todo TEXT)`;
    db.run(createTodoTable,(err)=>{
        if(err){
            console.log('Error creating Table '+err)
        }else{
            console.log(`Table ${tableName} created successfully`)
        }
    })
}



 const createUserQuery ='CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT ,name TEXT ,email TEXT ,password TEXT)';
 db.run(createUserQuery,(err)=>{
    if(err){
        console.log('error creating Table Users '+err)
    }else{
        console.log('user Tablecreated successfully')
    }
})


 function createUser(name,email,password,res){
    const addUser = 'INSERT INTO users(name,email,password) VALUES(?,?,?)';
    db.run(addUser,[name,email,password],(err)=>{
        if(err){
            console.log('New table entry not successful'+err)
        }else{
            res.render('login')
            console.log('New table entry successful')
        }
    })
}


 
app.get('/login',(req,res)=>{
   res.render('login')
})

app.get('/index',(req,res)=>{
    if(isLoggedIn){
        res.render('index')
    }else{
        res.render('register')
    }
})


app.get('/register',(req,res)=>{
    res.render('register')
})
 function emailIsInUse(name,email,password,res){
    const emailQuery = 'SELECT * FROM users WHERE email = ?';
    db.get(emailQuery,[email],(err,rows)=>{
        if(err){
            console.log('Error validating email '+err)
        }else{
            if(rows){
                res.render('usedEmail')
            }else{
                createUser(name,email,password,res)
            }
        }
    })
 
}


app.get('/',(req,res)=>{
    res.render('register')
})

var isLoggedIn= false;
var accountName = '';
var accountPassword = '';
app.post('/index',(req,res)=>{
if(req.body.password){
    const {name,email,password} = req.body;
    const validationQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(validationQuery,[email,password],(err,rows)=>{
        if(err){
            console.log('Error validating query '+err)
        }else{
            if(rows){
                 const {name,email,password} = rows;
                 createTodoTable(email,name,password);
                 isLoggedIn = true;
                 accountName = name;
                res.render('index')
            }else{
                res.render('noAccount')
            }
        }
    })
}else{
    //do nothing for now 
}
})

app.post('/deleteTodo',(req,res)=>{
    const {deleteTodoId} = req.body;
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
    db.run(deleteQuery,[deleteTodoId],(err)=>{
        if(err){
            console.log('error deleting the rows '+err)
        }else{
            if(this.changes ===0){
                console.log(`Could not find item with id ${deleteTodoId}`)
            }
            const updateQuery  = `SELECT * FROM ${tableName}`;
            db.all(updateQuery,[],(err,rows)=>{
                if(err){
                    console.log('err fetching data from table in delete request '+err)
                }else{
                    res.send(rows)
                }
            })
        }
    })

})


app.post('/login',(req,res)=>{
    const {name,email,password} = req.body;
    emailIsInUse(name,email,password,res)
})

app.get('/getTodo',(req,res)=>{
  if(req.originalUrl == '/getTodo'){
    console.log(tableName)
    selectQuery = `SELECT * from ${tableName}`;
    db.all(selectQuery,[],(err,rows)=>{
        if(err){
            console.log(`Error selcting ${accountName} todos `+err)
        }else{
            res.send([accountName,rows,tableName])
            console.log('Todo collected  sucessfully')
        }
    })
  }else{
    res.render('noPage')
  }
})


app.post('/addTodo',(req,res)=>{
    const insertQuery = `INSERT INTO ${tableName}(todo) VALUES(?)`;
    const selectQuery = `SELECT * FROM ${tableName}`
   db.run(insertQuery,[req.body.todo],(err)=>{
    if(err){
        console.log('Error Inserting todo '+err)
    }else{
        console.log('Todo inserted sucessfully')
    }
   })

   db.all(selectQuery,[],(err,rows)=>{
    if(err){
    }else{
        if(rows){
            res.send(rows)
            console.log('Todo collected  sucessfully')
        }else{
            console.log('No data in table')
        }
    }


   })
})


app.get('/:id',(req,res)=>{
    res.render('noPage')
})








app.listen(port,()=>{
    console.log('App is listening on port '+port)
})