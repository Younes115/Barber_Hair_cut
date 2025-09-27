const mongoose =require ("mongoose");

const packageSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    icon:{
        type : String
    }
});


module.exports = mongoose.model("Package",packageSchema);
