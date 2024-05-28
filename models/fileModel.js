const mongoose=require('mongoose');

const fileSchema=mongoose.Schema({
    fileTitle:String,
    fileName:String,
    fileExtension:String,
    uploadedDateTime:{
        type:Date,
        default:Date.now
    }
})

const fileModel=mongoose.model("Files",fileSchema);

module.exports=fileModel;