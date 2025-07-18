const mongoose = require('mongoose');
//helps the work with monogo in node
const userSchema =new mongoose.Schema({ //how the user should look in the db
    firstname:{ type:String, required:true},
    lastname:{ type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type : String, required: true},
    role:{ type: String, enum: ['user', 'chef'], default: 'user' },
    certificate: { type: String },
    isBanned:{type:Boolean,default:false},
    isChefActive:{type:Boolean,default:false}


}, {timestamps:true});

module.exports=mongoose.model('User',userSchema);