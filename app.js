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
	res.render("index" );
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

// //this route to the profile page
// app.get("/profile", function(req,res) {
//     req.currentUser()
//         .then(function(dbUser) {
//           	console.log("profile page works!!");
//             res.render('user/profile', {ejsUser: dbUser});
//         });
// });



app.get('/profile', function(req,res){
    req.currentUser()
    .then(function(dbUser){
      if (dbUser) {
        db.favoriteJoke.findAll({where: {UserId: dbUser.id}})
          .then(function(joke){
            console.log("test work!");
          res.render('user/profile', {ejsUser: dbUser, thisJoke: joke});
        });
      } else {
       res.redirect('/login');
      }
    });
});


//this is to end the session
app.delete('/logout', function(req,res){
  	req.logout();
  	res.redirect('/login');
});
  

// this will request from the API
app.get('/search', function(req, res){
    // this take the input from profile or index page 
    var number = req.query.number || 1;
    // this var to the API
    var url = 'http://api.icndb.com/jokes/random/' + number;
    // this call to the API
    request(url, function(err, response, body){
      console.log("I AM WORKING!!!");
    // this create a var to parse the JSON file from API
     var thisParseJSON = JSON.parse(body).value;
    // this render on the search page, the second part pass the readable joke to search page
      res.render('search', {parseJSON: thisParseJSON});
    });
});

  
// this will request from the API
app.get('/search2', function(req, res){
    // this take the input from profile or index page 
    var firstName = req.query.firstName;
    var lastName =  req.query.lastName;
    
    // this var to the API
    console.log("first name is ", firstName);
    setTimeout(function() {
      console.log("First timeout name is ", firstName);
    }, 3000);
    var url = 'http://api.icndb.com/jokes/random?firstName=' + firstName + '\&lastName=' + lastName;
    // var url = 'http://api.icndb.com/jokes/random?firstName=Andy&amp;lastName=Pohl'
    // this call to the API
    request(url, function(err, response, body){
      console.log("I AM WORKING!!!");
    // this create a var to parse the JSON file from API
     var thisParseJSON = JSON.parse(body);
     console.log(thisParseJSON);
    // this render on the search page, the second part pass the readable joke to search page
      res.render('search2', {parseJSON: thisParseJSON});
    });
});



// this post to the db
app.post('/favoritejoke', function(req, res) {
   // this is the the selected joke
   var selectedJoke = req.body.joke
   // this put create a favorite joke in db, second part attach it to the current userId
   db.favoriteJoke.create
   // joke reference db colume
      ({joke: selectedJoke, UserId: req.session.userId})
      .then(function(){
      res.redirect('/profile');
  });

});

app.listen((process.env.PORT || 3000), function () {
    console.log("RUN SERVER RUN");
});