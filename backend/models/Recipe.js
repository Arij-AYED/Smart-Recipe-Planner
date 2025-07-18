const mongoose=require('mongoose');

const recipeSchema = new mongoose.Schema({
    title:String,
    ingredients:[String],
    steps:[String],
    image:String,
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    approved:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now},
})

module.exports=mongoose.model('Recipe',recipeSchema);