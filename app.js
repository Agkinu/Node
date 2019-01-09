var express = require("express");
var request = require ("request");
var mongoose = require("mongoose");
var passwordValidator = require('password-validator');
var mysql = require("mysql");
var url = require('url');
var bodyPArser = require("body-parser");

var app = express();
app.use(bodyPArser.urlencoded({extended:true}));
app.set("view engine","ejs");
// mongoose.connect('mongodb+srv://shlomoartzi7:YUhackm3@clusterginali-z4ujn.mongodb.net/movies?retryWrites=true', {useNewUrlParser: true});

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "YUhackm3",
  database: "movies"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  //create database
  // con.query("CREATE DATABASE movies", function (err, result) {
  //   if (err) throw err;
  //   console.log("Database created");
  // });

  //create table
  // var sql = "CREATE TABLE movies (_id name VARCHAR(255), year VARCHAR(255))";
  // con.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("Table created");
  // });
});

app.get("/",function(req,res){
  res.render("home");
});

app.get("/register", function(req,res){
  var show = "";
  // if(req.query.valid!=null){
  //   show = req.query.valid;
  // }
  res.render("register",{data:show});
});

app.post("/registeruser",function(req,res){
  var schema = new passwordValidator();
  var username = req.body.username;
  var password = req.body.password;
  schema.is().min(8).has().digits().has().not().spaces();
  if(schema.validate(password)){
    var sql = "INSERT INTO users (username, password) VALUES ('"+username+"','"+password+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("record inserted");
    });
    res.redirect("/");
  }else{
    var display = "Please use a password that has at least one digit and seven figures";
    res.render("register",{data:display});
  }

});

app.get("/results", function(req, res){

    var sql = "DELETE FROM movies";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Deleted");
    });

    var movie = req.query.search;
    var url = "http://www.omdbapi.com/?s="+movie+"&apikey=57c9014d";
    request(url, function (error, response, body){
    if(!error && response.statusCode == 200){
      var data = JSON.parse(body);
      var movies = [];
      var show = [];
      data["Search"].forEach(function(movie){
        movies.push([movie["Title"], movie["Year"]]);
      });

      //data insert
      var sql = "INSERT INTO movies (name, year) VALUES ?";
        con.query(sql,[movies], function (err, result) {
          if (err) throw err;
          console.log("record inserted");
      });

      //data extract
      con.query('SELECT * FROM movies', function (error, results, fields) {
        var myMovie = {
          id:"",
          name:"",
          year:""
        }
        results.forEach(function(result){
          myMovie = {id:result["id"], name:result["name"], year:result["year"]};
          show.push(myMovie);
        });
        res.render("results", {data: show});
      });


      // mongodb code
      // var movieSchema = new mongoose.Schema({
      //   name: String ,
      //   year: Number,
      // });
      // var Movie = mongoose.model("Movie",movieSchema);
      // var movie = new Movie({
      //   name:data["Search"][0]["Title"],
      //   year: 1990
      // });
      // movie.save(function(err, cat){
      //   if (err){
      //     console.log(err);
      //   }
      //   else{
      //     console.log("Added to db");
      //     console.log(cat);
      //   }
      // });
    }
    });
});


app.listen(3000, function(){
  console.log("server has started");
});
