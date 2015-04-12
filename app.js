var express = require("express"),
    ejs = require("ejs"),
    bodyParser = require("body-parser"),
   	methodOverride = require("method-override"),
   	db = require("./models"),
   	session = require("express-session"),
   	app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'))

app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
}))


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

//this render the signup page
app.get('/signup', function(req,res){
	res.render("user/signup");
});

// reference login.ejs
// this is for the login to account
app.get('/login', function(req,res){
	req.currentUser().then(function(user){
		if (user) { //if already logged in, will redirect to profile page
			res.redirect('user/profile');
		} else { // if not logged in, you will be sent to login page
			res.render("user/login");
		}
	});
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
// this will compare with the db data
app.post('/login', function(req,res){
	var email = req.body.email;
	var password = req.body.password;
	db.User.authenticate(email,password)
	  .then(function(dbUser){
	  	if(dbUser) {
	  		req.login(dbUser);
	  		res.redirect('user/profile'); // redirect to user profile
	  	} else {
	  		res.redirect('user/login');
	  	}
	  }); 
});


app.get("/profile", function(req,res) {
  req.currentUser()
      .then(function(dbUser) {
      	console.log("profile page works!!")
        res.render('user/profile', {ejsUser: dbUser});
      });
});




// // where the user submits the sign-up form
// app.post("/users", function (req, res) {
// 	var email = req.body.email;
// 	var password = req.body.password;
// 	db.User.createSecure(email,password)
// 	  .then(function(user){
// 	  	res.redirect('/profile');
// 	  });
// });

//   // create the new user
//   db.User.
//     createSecure(user.email, user.password).
//     then(function(){
//         res.send("SIGNED UP!");
//       });
// });








app.listen(3000, function () {
  console.log("RUN SERVER RUN");
});