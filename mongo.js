const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config()
const usersSchema = new Schema({
    username:  String, // String is shorthand for {type: String}
        
  });

  const exerciseSchema = new Schema({
    user_id: String, 
    description: String,
    duration: Number,
    date: { type: Date, default: Date.now },

  })
  const userModel = mongoose.model('Users', usersSchema);
  const userExerciseModel = mongoose.model('UserExercises', exerciseSchema);
/* mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('MongoDB connected!!');
}).catch(err => {
    console.log('Failed to connect to MongoDB', err);
});; */

const connectToDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected!!');
    } catch (error) {
        console.log('Failed to connect to MongoDB', err);
    }
    
}

const createUser = async(username) =>{
    const user= new userModel({username:username})
    savedModel = await user.save();
    console.log(savedModel);
    return savedModel;

}

const findUser = async(username)=>{
    try {
        user = await userModel.findOne({username:username});
        return user;
    } catch (error) {
        console.log(err);
        return null;
        
    }
    
    return user;
}

const findUserById = async(userId)=>{
    
    user = await userModel.findOne({_id:userId});
    return user;
}

const findAllUsers = async()=>{
    users= await userModel.find({});
    return users;
}
const addUserExercise = async(user)=>{

    const exerciselog = { user_id:user.userId,description:user.description,duration:user.duration,date:user.date };   
    const userExercise= new userExerciseModel(exerciselog);
    savedExercise= await userExercise.save();
    return savedExercise;
}

const findExerciseLog= async(userId)=>{
    
    const exerciseLog = await userExerciseModel.find({user_id:userId});
    return exerciseLog;
}


module.exports.connectToDB= connectToDB;
module.exports.createUser= createUser;
module.exports.findUser= findUser;
module.exports.addUserExercise=addUserExercise;
module.exports.findUserById=findUserById;
module.exports.findAllUsers=findAllUsers;
module.exports.findExerciseLog=findExerciseLog;