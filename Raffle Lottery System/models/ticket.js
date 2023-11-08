const mongoose= require('mongoose')


const ticketSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        unique:true
    },
    ticket:{
        type:Number,
        min:1,
        max:100
    }
})
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports= Ticket;