const express= require('express')
const path = require('path')
const fs = require('fs')
const cron = require('node-cron')
const app =express()
//body-parser help us to store files in express
const bodyparser = require('body-parser')
const mongoose= require('mongoose')
const { colours } = require('nodemon/lib/config/defaults')
const port=1180
let chooseOne = [];
let winner=["NULL","NULL","NULL"];
cron.schedule("0 16 * * *",async()=>{
    let r=Math.random()
    var len = chooseOne.length
    let ind = Math.floor(r*len)

    const userName = await Ticket.findOne({ticket:chooseOne[ind]})
    
    //update winners array to  be updated in winners list displayed
    winner[2]=winner[1];
    winner[1]=winner[0];
    winner[0]=userName.name;  
    //reset chooseOne daily after finding the winner for that day
    chooseOne=[];
    
    //free tickets in Ticket database daily so that those tickets become available for next day
    await Ticket.deleteMany();
    console.log("All tickets freed")
})

mongoose.connect('mongodb://localhost/raffleLottery',{
    useNewUrlParser: true,useUnifiedTopology:true
}).then(()=>console.log("connection successful..."))
.catch((err)=>console.log(err));


// //mongoose model
const Register = require("./models/register.js") 
const Ticket = require("./models/ticket.js") 
const res = require('express/lib/response')


//for serving static files
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.urlencoded())

//for serving template engine as pug
app.set('view engine', 'pug')


//set the views directory
app.set('views', path.join(__dirname,'views'))



//ENDPOINTS  
// difference between get and post request
// -> Get- data from form s passed in url form
// -> POST- data from form is passed from inside Message. This is more safe
//GET
app.get('/',(req,res)=>{
    res.status(200).render('home')
})
app.get('/winners',(req,res)=>{
    res.status(200).render('winners',{winners:winner})
})

app.get('/login',(req,res)=>{
    res.status(200).render('login')
})

app.get('/register',(req,res)=>{
    res.status(200).render('register')
})

app.get('/takeLottery',(req,res)=>{
    res.status(200).render('takeLottery')
})


// POST- req.body will pass values of form
app.post('/login',async(req,res)=>{
    try {
        const name = req.body.name;
        const password = req.body.password;
        const userEmail = await Register.findOne({name:name})
        if (userEmail.password === password) {
            console.log(`User ${name} has logged in with password ${password}`)
            res.status(200).render("homeLoggedIn")
        } else {
            res.send("Wrong password")
        }

    } catch (error) {
        res.status(400).send("Invalid Credentials")
    }
})

app.post('/register',async(req,res)=>{
    //make new Register data with help of request

    const myData = new Register({
        name:req.body.name,
        phone:req.body.phone,
        email:req.body.email,
        password:req.body.password,
        confirmpassword:req.body.confirmpassword
    });

        if (myData.password===myData.confirmpassword) {
            try {
                await myData.save();
                res.send("Item saved ")   
            } catch (error) {
                res.send("Existing data used data "+error)
            }
 
        } else {
            res.send("Confirm password not same as password")
        }

})

app.post('/takeLottery',async(req,res)=>{
    //make new Register data with help of request
    let name = req.body.name;
    let password = req.body.password;
    let ticket = req.body.ticket;
    try {
        const myData = new Ticket({
            name:name,
            ticket:ticket
        });
            const userName = await Register.findOne({name:name})
            if (password===userName.password) {
                try {
                    await myData.save();
                    chooseOne.push(ticket)
                    console.log(`${name} has taken ticket number ${ticket}`)   
                    res.send(`You have taken ticket number ${ticket}`)   
                } catch (error) {
                    res.send("Existing data used data "+error)
                }
     
            } else {
                res.send("Wrong password")
            }
    } catch (error) {
        res.send("Invalid credentials")
    } 

})

// //start server
app.listen(port, ()=>{
    console.log(`The application has started successfully on port ${port}`)
})
