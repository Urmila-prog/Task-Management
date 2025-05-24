
const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: true,
    },
   desc:{
        type:Boolean,
         default: false,
    },
    important:{
        type:Boolean,
        required:true,
    },
    complete:{
        type:Boolean,
        required:true,
    },
},{
    timestamps:true,
} );

module.exports = mongoose.model('tasks', TaskSchema);