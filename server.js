const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const crypto = require("crypto");
const BAD_REQUEST=400;
const GOOD_REQUEST=200;
const ERROR=500;
var mongooseLib = require('./mongo');
const Joi = require('joi');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))


// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



//Function to send response
function sendResponse(status,payload,res) {
  res.status(status).json(payload);
}

//Function to handle creation of New User
const handleNewUser = async(req,res)=>{
  //Connect to the Database
  mongooseLib.connectToDB();
  var username = req.body.username;
  //Find a User
  user = await mongooseLib.findUser(username);
  if(user==null){
    //If Username is not found Create a New User and Send Response
    console.log('Username not found');
    newuser = await mongooseLib.createUser(username);
    payload={'username':username,'_id':newuser._id};
    sendResponse(GOOD_REQUEST,payload,res);
  }else{
    //If Username exists send Error message saying User is already taken
    payload={'error':'Username already taken'}
    console.log('Username already exists');
    sendResponse(status,payload,res);
  }
}
app.post('/api/exercise/new-user', (req,res)=>{
  var username = req.body.username;
  //Set default Status
  status=BAD_REQUEST;
  //If username is empty
  if(username==''){
        payload={'error':'Username is blank'}
        sendResponse(status,payload,res); 

  }else{
        //Call the New User Handler Function
        handleNewUser(req,res);       
      }
   
});


//This function receives exercise data and either finds the user
//and inserts or sends an error message if user is not found
const handleExerciseData = async(data,res)=>{
  mongooseLib.connectToDB();
  var userId = data.userId;
  //Find a User
  user = await mongooseLib.findUserById(userId);
  if(user==null){
    //If Username is not found Send Error Response
    console.log('User not found');
    payload={'error':'User not found'};
    sendResponse(BAD_REQUEST,payload,res);
  }else{
    //User is found, Update User Info and Send Response
    updatedUser= await mongooseLib.addUserExercise(data)
    payload=updatedUser;
    sendResponse(GOOD_REQUEST,payload,res);
  }
 
}

//This method is to handle adding exercises
app.post('/api/exercise/add', (req,res)=>{

  //Schema to validate input body
  const schema = Joi.object().keys({
    userId: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.number().integer().required(),
    date:Joi.date().max('now').iso().optional()
    //date: Joi.alternatives().conditional('date',{is:Joi.exist(), then: Joi.date().max('now').iso(), otherwise:Joi.optional()   })  //.date().max('now').iso()
  });
  //Schema to validate Date
  const dateschema = Joi.object().keys({
    date: Joi.date().max('now').iso()
});


  const data = req.body;
  //Handling Date Separately
  //If date is empty set it to current date
  if(data.date==''){
    console.log('Date is empty');
    var currdate=(new Date()).toISOString().split('T')[0];
    data.date= currdate;
  }
  
  //Validate Body
  const validation = schema.validate(data);
  if(validation.error){
    //Send Error Message
    sendResponse(BAD_REQUEST,{'message':validation.error.details[0].message},res);
  }else{
    //console.log(data)
    //Handle Request since form is valid
    handleExerciseData(data,res);
  }
  
});

//Service that Handles Request to get all Users
const handleListAllUsers = async (res)=>{
  mongooseLib.connectToDB();
  const userslist = await mongooseLib.findAllUsers();
  sendResponse(GOOD_REQUEST,userslist,res);
}
//Get all Users Request Handler
app.get('/api/exercise/users',(req,res)=>{
  handleListAllUsers(res);
});


//Utitlity Function that Gets the Exercise Data for a Given User
const  handleGetExerciseData = async (userId,res) =>{
  mongooseLib.connectToDB();
   //Find a User
   var id =userId;
  console.log('Looking for User: ',userId); 
  user = await mongooseLib.findUserById(id);
  if(user==null){
    //If Username is not found Send Error Response
    console.log('User not found');
    payload={'error':'User not found'};
    sendResponse(BAD_REQUEST,payload,res);
  }else{
    exercises = await mongooseLib.findExerciseLog(userId)
    
    //Removing Non Required Properties
    pruned=[]
    for (ex of exercises){
      dateToAdd = new Date(ex.date).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
      obj ={'description':ex.description, 'duration':ex.duration, 'date':dateToAdd}
      pruned.push(obj)
    }  
    //Packaging the Payload
    payload = {_id:userId, username: user.username, count:exercises.length,log:pruned}
    //console.log(payload)
    sendResponse(GOOD_REQUEST,payload,res);
  }
}

//Handler Function that handles requests for the exercise logs
app.get('/api/exercise/log',(req,res)=>{
  const { userId: _id, from, to } = req.query;
  if((_id=='')||(_id==undefined)){
    sendResponse(BAD_REQUEST,{'error':'UserId is required'},res);
  }else{
    handleGetExerciseData(_id,res);
  }
  
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
