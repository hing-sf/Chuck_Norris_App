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
      }).
      then(function (user) {
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
      	console.log("profile page works!!")
        res.render('user/profile', {ejsUser: dbUser});
      });
});

//this is to end the session
app.delete('/logout', function(req,res){
	req.logout();
	res.redirect('/login');
});


// We use the request module to make a request to
// jokes.p.mashape.com. We pass in a callback that takes in three
// parameters, error, response, and body.
request('https://webknox-jokes.p.mashape.com/jokes/search', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("THIS IS THE RESPONSE", response);
      console.log(body); // Show the HTML for the jokes site. 
    }
});


// We have our search route that renders our search view
app.get('/search', function(req,res) {
  res.render('search', {joke: []});
});

// We have our movie route that renders our movie view
app.get('/joke', function(req,res) {
  res.render('movie', {joke: {Category: "I'm a movie", Joke: "I'm a plot"}});
});




app.listen(3000, function () {
  console.log("RUN SERVER RUN");
});