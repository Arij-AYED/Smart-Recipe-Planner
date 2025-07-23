const mongoose = require('mongoose');
//helps the work with monogo in node
const userSchema =new mongoose.Schema({ //how the user should look in the db
    firstname:{ type:String, required:true},
    lastname:{ type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type : String, required: true},
    role:{ type: String, enum: ['user', 'chef','admin'], default: 'user' },
    certificate: { type: String },
    isBanned:{type:Boolean,default:false},
    isChefActive:{type:Boolean,default:false},
    profileImage: { type: String, default: '/uploads/default-avatar.jpg' },
    favorites:[{type:mongoose.Schema.Types.ObjectId,ref:'Recipe'}] //default profile image


}, {timestamps:true});

module.exports=mongoose.model('User',userSchema);