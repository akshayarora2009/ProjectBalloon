
var express = require('express');
var Mailgun = require('mailgun');
var app = express();

var parseExpressCookieSession = require('parse-express-cookie-session');



// App configuration section
app.set('views', 'cloud/views');  // Folder containing view templates
app.set('view engine', 'ejs');    // Template engine
app.use(express.bodyParser());    // Read the request body into a JS object

// In your middleware setup...
app.use(express.cookieParser('abcd'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

var student = false;
var teacher = false;

Mailgun.initialize('trueorfalse.in', 'key-857670dfd53f2737a20af8a90f6cb01f');
/*
app.get('/',function(req,res){
  /*




Mailgun.sendEmail({
  to: "akshayarora2009@gmail.com",
  from: "CTO@akshay.com",
  subject: "Hello from Akshay!",
  text: "Using Parse and Mailgun !! "
}, {
  success: function(httpResponse) {
    console.log(httpResponse);
    res.success("Email sent!");
  },
  error: function(httpResponse) {
    console.error(httpResponse);
    res.error("Uh oh, something went wrong");
  }
});
console.log("reached here..");


  res.render('index',{message:''});
});
*/

app.get('/dashboard',function(req,res){

  console.log(Parse.User);

  if(Parse.User.current())
  {
    // User is logged in
    res.render('dashboard');
  }
  else
  {
    // User is not logged in
    res.redirect('/');
  }


});

app.post('/login',function(req,res){

  var username = req.body.username;
  var password = req.body.password;

  Parse.User.logIn(username,password,{
    success: function(){
      res.redirect('/dashboard');
    },
    error: function(){
      res.render('index',{message:'Invalid Username or Password'});
    }
  })

});


app.get('/begin',function(request,response){

response.render('begin',{message:''});

});

app.post('/begin/login',function(req,res){

    // Login request received
    var username = req.body.username;
    var password = req.body.password;

    Parse.User.logIn(username,password, {

        success: function(user){

           res.redirect('/home');

        },
        error: function(){

            res.render('begin',{message:'Invalid Username or Password'});

        }


    });

});

app.get('/begin/signup',function(req,res){

    res.render('signup',{message: ''});

});

app.post('/begin/signup',function(req,res){

    var username = req.body.username;
    var password = req.body.password;


    var student = Parse.Object.extend("student");
    var studentQuery = new Parse.Query(student);

    studentQuery.equalTo("email",username);
    console.log('reached here');

    studentQuery.find({

        success: function(results){
            console.log('length: ' + results.length);
            if(results.length == 0)
            {

                // Not in student table
                var teacher = Parse.Object.extend("teacher");
                var teacherQuery = new Parse.Query(teacher);

                teacherQuery.equalTo('email',username);
                teacherQuery.find({
                    success:function(r)
                    {
                        if(r.length == 0)
                        {
                            // Not a teacher
                            res.render('signup',{message:'Project Balloon is only meant for registered email ids of students of PEC'});
                        }
                        else
                        {
                            // found a teacher
                            // Check if the account already exists

                            var checkTeacher = new Parse.Query(Parse.User);



                            checkTeacher.equalTo("username",username);
                            checkTeacher.find({

                                success: function(teach){

                                    console.log('as well');
                                    if(teach.length == 0)
                                    {
                                        // teacher already does not exist


                                        var newTeacher = new Parse.User();


                                        console.log(newTeacher);

                                        newTeacher.set("username",username);
                                        newTeacher.set("email",username);
                                        newTeacher.set("password",password);
                                        newTeacher.set("isTeacher",r[0]);



                                        newTeacher.signUp(null,{

                                            success: function(myobj){
                                                console.log('as well22');

                                                r[0].set("map",myobj);

                                                r[0].save({

                                                    success: function(){

                                                        console.log("Teacher sign up successful. Now verify your email.");
                                                        res.send("teacher ok. verify mail");
                                                    },
                                                    error: function(user,err){
                                                        console.log('error: ' + err.code + err.message);
                                                    }


                                                })



                                            },
                                            error: function(user,err){
                                                console.log('error: ' + err.code + err.message);
                                            }

                                        })



                                    }
                                    else
                                    {
                                        // trying to re-register, proceed normally
                                    }


                                }


                            })




                        }
                    }



                })


            }
            else
            {
                // Found in student table

                var user = new Parse.User();



                // Check if somebody already made a request to make this account

                var userQuery = new Parse.Query(user);

                userQuery.equalTo('username',username);
                userQuery.find({
                    success: function(a){

                        console.log('query success');

                        var newUser = new Parse.User();
                        //var pointerOfStudentTable = results[0].id;
                        if(a.length == 0)
                        {
                            // TODO: OK. No account already exists
                            Parse.Cloud.useMasterKey();

                            console.log('no account already exists');

                            newUser.set("username",username);
                            newUser.set("email",username);
                            newUser.set("password",password);
                            newUser.set("isStudent",results[0]);



                            newUser.signUp(null,{
                                success: function(obj){
                                    // Send them to the page containing: todo: please verify your email

                                    results[0].unset("map");
                                    results[0].set("map",obj);
                                    results[0].save({
                                        success:function(){
                                            console.log('done');
                                            res.send("Sign up success. Now verify your email.");
                                        },
                                        error:function(user,err){
                                            console.log('error: ' + err.code + err.message);
                                        }

                                    });


                                },
                                error: function(user,err){
                                    console.log('error: ' + err.code + err.message);
                                    res.send('fatal');
                                }
                            });





                        }
                        else
                        {
                            // Todo: Account already exists. check if email is verified.
                            // Todo: INCOMPLETE!!

                            var ifVerified = a.get('emailVerified');
                            if(ifVerified == false)
                            {
                                // todo: email is not verified. somebody else might have tried to sign up on behalf. proceed normally.
                                a.destroy({
                                    success: function(){
                                        // set the new object




                                        newUser.set("username",username);
                                        newUser.set("email",username);
                                        newUser.set("password",password);
                                        newUser.set("isStudent",pointerOfStudentTable);



                                        newUser.signUp(null,{
                                            success: function(obj){
                                                // Send them to the page containing: todo: please verify your email
                                                results[0].set("map",obj.id);
                                                results[0].save();

                                            }
                                        });

                                    }
                                });

                            }
                            else
                            {
                                // todo: tell the user account already exists.
                                res.render('signup',{message:'Account for the user already exists. Please Login.'})
                            }
                        }



                    }
                })


            }


        },

        error: function(){
            res.send('Internal server error. Something went wrong.');
        }


    });



});


app.get('/home',function(req,res) {

    var currentUser = Parse.User.current();


    Parse.Cloud.useMasterKey();


    if (currentUser) {

        var user = new Parse.User();
        var userQuery = new Parse.Query(user);

        userQuery.equalTo('objectId',currentUser.id);
        userQuery.find({
            success: function(found){


                var isEmailVerified = found[0].get("emailVerified");
                var isStudent = found[0].get("isStudent");
                var isTeacher = found[0].get("isTeacher");
                student = isStudent;
                teacher = isTeacher;

                if(isEmailVerified)
                {
                    if(isStudent)
                    {
                        res.render('student-home');
                    }
                    else if(isTeacher)
                    {
                        res.render('teacher-home',{fullUser:found[0],message:''});
                    }

                }
                else
                {
                    res.send('email not verified');
                }

            },
            error: function(us,err)
            {
                console.log('error: ' + err.code + err.message);
            }
        });

    }
    else
    {
        res.redirect('/begin');
    }






});


// Background job to remove users with unverified accounts

Parse.Cloud.job("removeUnverified",function(request,status){

    console.log('starting job');

    Parse.Cloud.useMasterKey();

    var user = new Parse.User();
    var userQuery = new Parse.Query(user);

    userQuery.each(function(u){

        var createdAt = u.get("createdAt");
        var currentDate = new Date();
        var timeDiff = Math.abs(currentDate.getTime() - createdAt.getTime());
        timeDiff = timeDiff/1000;

        console.log('Time diff is: ' + timeDiff);

        if(u.get("emailVerified") == false){


            if(timeDiff > 1800)
            {
                u.destroy({
                    success:function(){
                     console.log('done');
                    },
                        error: function(us,error){
                    console.log('error: ' + error.code + error.message);
                    }


                });
            }
        }


    }).then(function(){

        status.success("Done");

    },function(error){
        status.error("Something went wrong");

    });




});


app.get('/subscriptions',function(req,res){

    Parse.Cloud.useMasterKey();
    var user = Parse.User.current();
    var fullUser;

    if(!user)
    {
        res.redirect('/begin',{message:''});
        return;
    }

    Parse.User.current().fetch().then(function(us){

        fullUser = us;


    });


    var subData;
    var pendingData;
    var newData;





    var userClass = new Parse.User();
    var userQuery = new Parse.Query(userClass);

    userQuery.equalTo('objectId',user.id);
    userQuery.find({
        success: function(u){
            student = u[0].get("isStudent");
            teacher = u[0].get("isTeacher");
            if(student)
            {
                console.log('found a student');
                var s = Parse.Object.extend("student");
                var stu = new Parse.Query(s);
                stu.equalTo("map",user);
                stu.find({
                    success: function(xyz){

                        var sub = Parse.Object.extend("subscriptions");
                        var subQuery = new Parse.Query(sub);
                        subQuery.equalTo("sub_by",user.get("isStudent"));
                        subQuery.include("sub_to");

                        subQuery.find({
                            success: function(x){

                                subData = x;

                                var pending = Parse.Object.extend("sub_requests");
                                var pendingQuery = new Parse.Query(pending);
                                pendingQuery.equalTo("sub_by",user.get("isStudent")).include("sub_to");

                                pendingQuery.find({
                                    success: function(v){
                                        pendingData = v;

                                        // query for all the teachers

                                        var teach = new Parse.User();
                                        var teachQuery = new Parse.Query(teach);

                                        teachQuery.notEqualTo("isTeacher",null).include("isTeacher");

                                        teachQuery.find({
                                            success: function(w){
                                                newData = w;

                                                res.render('student-subs',{sub_data:subData,pending_data: pendingData,new_data: newData,token:u[0]});


                                            },
                                            error: function(us,err){
                                                console.log('error: ' + err.message);
                                            }
                                        });


                                    },
                                    error: function(us,err){
                                        console.log('reached here');
                                        console.log('error: ' + err.message);
                                    }
                                });




                            },
                            error: function(u,err){
                                console.log('now error');
                                console.log('error: ' + err.message);
                            }
                        });






                    },
                    error: function(u,e){
                        console.log('here error');
                        console.log('error: ' + e.message);
                    }
                });



            }
            else if(teacher)
            {
                // todo: If the login is done by a teacher

                var requ_data;


                var sub_requests = new Parse.Query(Parse.Object.extend("sub_requests"));

                sub_requests.equalTo("sub_to",Parse.User.current().get("isTeacher")).include("sub_by");
                sub_requests.find({
                    success: function(abc){

                        req_data = abc;

                        res.render('teacher-subs',{req_data:req_data,token:fullUser.getSessionToken()});


                    }
                });



            }
        }
    });






});

app.get('/groups',function(req,res){

    if(Parse.User.current())
    {

    Parse.User.current().fetch().then(function(user){

        if(user.get("isTeacher"))
        {
            var groupData = user.get("groups");
            var sessionToken = user.getSessionToken();

            res.render('teacher-groups',{groupData:groupData,token:sessionToken});

        }
        else
        {
            // Not a teacher. Forbidden
            res.redirect('/begin',{message:''});
        }





    });
    }
    else
    {
        res.redirect('/begin');
    }


});

app.get('/logout',function(req,res){

    Parse.User.logOut();
    res.redirect('/begin');

});


app.post('/sendmail',function(req,res){

    var fullUser;
    var pointerUser = Parse.User.current();

    Parse.User.current().fetch().then(function(user){

        fullUser = user;


    }).then(function(){

        var subject = req.body.subject;
        var mailContents = req.body.mailbody;
        var groupName = req.body.groupName;


        // Now send an email to the subscribers using Mailgun

        // Find all the subscribers
        var subQuery = new Parse.Query(Parse.Object.extend("subscriptions"));

        //subQuery.equalTo('sub_to',fullUser.get("isTeacher"));
        subQuery.equalTo('groupName',groupName);
        subQuery.include('sub_by');

        subQuery.find({

            success:function(abc){

                console.log('length: ' + abc.length);

                for(var i = 0 ; i < abc.length; ++i)
                {
                    var sendTo = abc[0].get("sub_by").attributes.email;

                    console.log('sending to : ' + sendTo);

                    Mailgun.sendEmail({
                        to: sendTo,
                        from: "CTO@akshay.com",
                        subject: subject,
                        text: mailContents
                    }, {
                        success: function(httpResponse) {
                            console.log('sending ok');
                            console.log(httpResponse);

                        },
                        error: function(httpResponse) {
                            console.error(httpResponse);
                        }
                    });
                }

                var messageLog = Parse.Object.extend("messageLog");
                var message = new messageLog();

                message.set("content",mailContents);
                message.set("subject",subject);
                message.set("sentBy",pointerUser);
                message.set("sentToGroup",groupName);

                message.save().then(function(){

                    res.render('teacher-home',{fullUser:fullUser,message:'Your message has been sent'})
                });




            },

            error: function(u,err){
                console.log('error: ' + e.message);
            }




        });








    });





});


// Attach the Express app to your Cloud Code
app.listen();
