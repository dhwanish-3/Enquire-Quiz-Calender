const express = require("express");
const path = require("path");
const db = require("./routes/db_connection");
const app = express();
const cookie = require("cookie-parser");
const PORT = process.env.PORT || 5000;

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

// to parse url encoded bodies
app.use(express.urlencoded({extended:true}));
// parse json bodies
app.use(express.json());

app.set("view engine", "hbs");

app.use(cookie());

//  checking database connection
db.connect((error)=>{
    if(error)throw error;
    else{console.log("connected");}
});
const pages=require("./routes/pages");
app.use("/", pages.router);

// trying something new above
const uploadRouter=require("./router");
app.use(uploadRouter);


// for login signin
app.use("/auth", require("./routes/auth"));

app.listen(PORT,()=>{
    console.log('server start at '+ PORT);
});

// google login
const session = require('express-session');
const passport = require('passport');
require('./controllers/google_auth');

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/google',
    passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

// for uploading a file locally
// const upload=require('express-fileupload');
// app.use(upload());

// app.post('/upload',(req,res)=>{
//   if(req.files){
//     console.log(req.files);
//     var file=req.files.image;
//     var filename=file.name;
//     console.log(filename);
//     file.mv('./img/'+filename,function(err){
//       if(err){
//         console.log(err);
//       }else{
//         res.send("File Uploaded");
//       }
//     })
//   }
// })