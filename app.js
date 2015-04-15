var express = require("express"),
    ejs = require("ejs"),
    bodyParser = require("body-parser"),
   	methodOverride = require("method-override"),
   	db = require("./models"),
   	session = require("express-session"),
   	request = require('request'),
   	app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'))

// This defines req.session
app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}))

app.use(express.static('public'));

// this is the login/logout session
app.use("/", function (req, res, next) {

  req.login = function (user) {
      req.session.userId = user.id;
  };

  req.currentUser = function () {
    return db.User.
        find({
            where: {
              id: req.session.userId
            }
        })
        .then(function (user) {
            req.user = user;
            return user;
        })
  };

  req.logout = function () {
      req.session.userId = null;
      req.user = null;
  }

  next(); 
});


app.get('/', function(req,res){
	res.render("index");
});


//this render the signup page
app.get('/signup', function(req,res){
	 res.render("user/signup");
});

// reference signup.ejs
// this will post to the db after you click the signup button
app.post('/signup', function(req,res){
  	var email = req.body.email;
  	var password = req.body.password;
  	db.User.createSecure(email,password)
    	  .then(function(user){
    	  	res.redirect('/profile');
    	  });
});


// reference login.ejs
// this is for the login to account
app.get('/login', function(req,res){
  	req.currentUser().then(function(user){
    		if (user) { //if already logged in, will redirect to profile page
    		  	res.redirect('/profile');
    		} else { // if not logged in, you will be sent to login page
    		  	res.render("user/login");
    		}
  	});
});

// reference login.ejs
// this is to authenticate the login
app.post('/login', function(req,res){
  	var email = req.body.email;
  	var password = req.body.password;
  	db.User.authenticate(email,password)
    	  .then(function(dbUser){
      	  	if(dbUser) {
        	  		req.login(dbUser);
        	  		res.redirect('/profile');
      	  	} else {
      	  	  	res.redirect('/login');
      	  	}
    	  }); 
});

// this route to the profile page
app.get("/profile", function(req,res) {
    req.currentUser()
        .then(function(dbUser) {
          	console.log("profile page works!!");
            res.render('user/profile', {ejsUser: dbUser});
        });
});

//this is to end the session
app.delete('/logout', function(req,res){
  	req.logout();
  	res.redirect('/login');
});

// app.get('/search/:id',function(req,res){
//   var jokeSearch = req.params.js;
//   // if (!jokeSearch) { // this is when you search for an item with no return
//   //   res.render("search", {jokes: [], noJokes: true});
//   // } else { 
//     var url = "http://api.icndb.com/jokes/random/"+jokeSearch; // search movie from API address

//     request(url, function(err, res, body){
//       console.log("I'm in here 2");
//       if (!err && res.statusCode === 200) { // not Error or good = code 200
//         console.log("I'm in here 3");
//         var jsonData = JSON.parse(body); // this convert the JSON objects into something you can display
//         if (!jsonData.Search) {
//           res.render("search", {jokes: [], noJokes: true});
//         }
//         res.render("search", {jokes: jsonData.Search, noJokes: false});
//       }
//     });
//   

app.get('/search', function(req, res){
  // declare a variable for the joke Id that we enter into the search field
  var jokeId = req.query.js;
  // declare a variable for the url that we will pass into the API call
  // which includes the joke Id
  var url = 'http://api.icndb.com/jokes/random/5?='+ jokeId;
  // make the API call
  request(url, function(err, ressponse, body){
    console.log("I AM WORKING!!!");
    // declare a variable which consists of the parsed JSON object
    // specifically, the body
    var jokeData = JSON.parse(body);
    console.log(jokeData);
    // narrow down the content we want to see by focusing on the actual
    // element in the JSON object, in our case, the joke 
    var jokeResults = jokeData.value.joke;
    console.log(jokeResults);
    // response is to render the search.ejs page, with our content that
    // we want to pass into the page, i.e, jokes as jokesResults
    res.render('search', {jokes: jokeResults});
  });
});


// app.get('/search', function(req, res){
//   res.render('search.ejs', {joke: jokeResults});
// });
// // We have our search route that renders our search view
// app.get('/search:', function(req,res) {
// 	  var jokeSearch = req.query.js;
//     var options = "http://api.icndb.com/jokes/id/"

//     if(!jokeSearch) {
//   	    res.render("search", {jokes: [], noJokes: true});
//     } else {
      
//         // var options = {
//         //     url: "https://webknox-jokes.p.mashape.com/jokes/search?category=" + jokeSearch,
//         //     headers: {
//         //         'X-Mashape-Key': 'TXdXq0nIjKmshMYUqcr6krjKGIIXp1I2RFyjsnU6yqrykgONUf'
//         //     }
//         // };

//         request(options, function(err, response, body) {
//           if (!err && response.statusCode == 200) {
//               var jokes = JSON.parse(body); // this convert the JSON objects into something you can display

//               console.log(jokes);

//               if (jokes) {
//                   res.render('search', { jokes: jokes, noJokes: false });
//               } else {
//                   res.render('search', { jokes: [], noJokes: true });
//               }
//           }
//         });
// 	  }
// });

// We have our movie route that renders our movie view
app.get('/joke', function(req,res) {
    res.render('jokePage', {joke: {Category: "I'm the category", Joke: "I'm a joke"}});
});




app.listen(3000, function () {
    console.log("RUN SERVER RUN");
});