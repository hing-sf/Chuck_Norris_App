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
  

app.get('/search', function(req, res){
    // declare a variable for the joke Id that we enter into the search field
    var number = req.query.number || 1;
    // declare a variable for the url that we will pass into the API call
    // which includes the joke Id
    var url = 'http://api.icndb.com/jokes/random/' + number;
    // make the API call
    request(url, function(err, response, body){
      console.log("I AM WORKING!!!");
      // declare a variable which consists of the parsed JSON object
      // specifically, the body
      var jokes = JSON.parse(body).value;
      // response is to render the search.ejs page, with our content that
      // we want to pass into the page, i.e, jokes as jokesResults
      res.render('search', {jokes: jokes});
    });
});



// // We have our movie route that renders our movie view
// app.get('/joke', function(req,res) {
//     res.render('jokePage', {joke: {Category: "I'm the category", Joke: "I'm a joke"}});
// });




app.listen(process.env.PORT || 3000), function () {
    console.log("RUN SERVER RUN");
};