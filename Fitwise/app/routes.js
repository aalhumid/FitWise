var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

// app/routes.js
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});



	app.get('/auth/facebook',
  	passport.authenticate('facebook'));

	app.get('/auth/facebook/callback',
 	 passport.authenticate('facebook', { failureRedirect: '/' }),
 	 function(req, res) {
 	   // Successful authentication, redirect home.
 	   res.redirect('/profile');
 	 });

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	app.get('/trainerlogin', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('trainerlogin.ejs', { message: req.flash('loginMessage') });
	});

	// process the traine login form
	app.post('/trainerlogin', passport.authenticate('local-trainerlogin', {
            successRedirect : '/trainerprofile', // redirect to the secure profile section
            failureRedirect : '/trainerlogin', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/trainersignup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('trainersignup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/trainersignup', passport.authenticate('local-trainersignup', {
		successRedirect : '/trainerprofile', // redirect to the secure profile section
		failureRedirect : '/trainersignup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		var queryString = 'SELECT * FROM routines WHERE userName = ?';
		
		connection.query(queryString, [req.user.username],function(err, rows, fields) {
			
		res.render('profile.ejs', {
			user : req.user,
			userInfo: req.userInfo, // get the user out of session and pass to template
			routines: rows
	});
		});
	});

	// add new machine
	app.get('/addmachine', isLoggedIn, function(req, res) {
		
		res.render('addmachine.ejs', {
			user : req.user,
		});
	});

	app.post('/deletemachine', isLoggedIn, function(req, res) {		
		var machines = req.param('machineName'); 
		
		if(Array.isArray(machines))	
		for(var i=0 ; i < machines.length ; i++){
			
        	connection.query("DELETE FROM machineInfo WHERE name = ?", [machines[i]], function(err, result){
  				if(err) throw err;
			});
			connection.query("DELETE FROM routines WHERE machineName = ?", [machines[i]], function(err, result){
  				if(err) throw err;
			});
    	}
    	else{
			connection.query("DELETE FROM machineInfo WHERE name = ?", [machines], function(err, result){
  				if(err) throw err;
			});
			connection.query("DELETE FROM routines WHERE machineName = ?", [machines], function(err, result){
  				if(err) throw err;
			});
    	}

		res.redirect('/trainerprofile');
	});

	app.post('/addmachine', isLoggedIn, function(req, res) {		
					
                    connection.query("INSERT INTO machineInfo SET ? ",[{
                    		QRCode: req.param('code'),
                            name: req.param('name'),
                            //email : newUserMysql.email,
                            videoLink: req.param('vLink'),
                            picLink: req.param('pLink')
                    }]);
                   
		res.redirect('/trainerprofile');
	});

	app.get('/trainerprofile', isLoggedIn, function(req, res) {		
		var queryString = 'SELECT * FROM machineInfo';
		connection.query(queryString, function(err, rows, fields) {
    	if (err) throw err;

 		
    	res.render('trainerprofile.ejs', {
			trainer : req.user,
			machines : rows
		});

		});
		
	});

	// edit user profile
	app.get('/editprofile', isLoggedIn, function(req, res) {
		res.render('editprofile.ejs', {
			user : req.user,
			userInfo: req.userInfo // get the user out of session and pass to template
		});
	});

	app.post('/editprofile', isLoggedIn, function(req, res) {		
		var userInfo = {
                            fName: req.param('fName'),
                            lName: req.param('lName'),
                            //email : newUserMysql.email,
                            weight: req.param('weight'),
                            gender: req.param('gender')
                    };
                    connection.query("UPDATE users SET ? WHERE ?",[{
                            fName: req.param('fName'),
                            lName: req.param('lName'),
                            weight: req.param('weight'),
                            gender: req.param('gender')
                    },{email: req.user.email}]);

		res.redirect('/profile');
	});

	// Add routine
	app.get('/addroutine', isLoggedIn, function(req, res) {
		var queryString = 'SELECT * FROM machineInfo';
		connection.query(queryString, function(err, rows, fields) {

    	if (err) throw err;
		res.render('addroutine.ejs', {
			user : req.user,
			userInfo: req.userInfo, // get the user out of session and pass to template
			machines: rows,
			search: false
		});

		});
	});

	app.post('/addroutine', isLoggedIn, function(req, res) {	
		 var machines = req.param('machineName');

		 for(var i=0 ; i < machines.length ; i++){
        connection.query("INSERT INTO routines SET ? ",[{
                    		name: req.param('routineName'),
                    		userName: req.user.username,
                    		QRCOde: "",
                            machineName: machines[i]
                            //email : newUserMysql.email,
                            
                    }]);

    }
		res.redirect('/profile');
	});

	app.post('/deleteroutine', isLoggedIn, function(req, res){
		var routines = req.param('routineName'); 
		
		if(Array.isArray(routines))
			for(var i=0 ; i < routines.length ; i++){
			
        		connection.query("DELETE FROM routines WHERE name = ? AND userName = ?", [routines[i], req.user.username], function(err, result){
  					if(err) throw err;
				});
    		}
    	else{
			connection.query("DELETE FROM routines WHERE name = ? AND userName = ?", [routines, req.user.username], function(err, result){
  				if(err) throw err;
			});
    	}

		res.redirect('/profile');
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}