var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();
app.set('port', 9000);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000,
		httpOnly: false
    }
}));

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/signup.html');
    })
    .post((req, res) => {
		res.redirect('/login');
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;
			
			if(password == 123){
				
				req.session.user = username;
				res.cookie('userName', username, { maxAge: 900000, httpOnly: false});
                res.redirect('/dashboard');
			}else{
				 res.redirect('/login');
			}
    });


app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
		console.log(req.cookies.userName);
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
		res.clearCookie('userName');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});


app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));
