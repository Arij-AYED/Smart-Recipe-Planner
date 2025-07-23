const multer=require('multer');
const path = require('path');

//Set storage engine
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/uploads/'); //images will go here
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname); //unique name
    }
    
})
const upload =multer({storage});
module.exports=upload;