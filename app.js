if (process.env.NODE_ENV != "production"){
    require('dotenv').config()
}


const express = require("express");
let app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const capitalize = require("./public/js/capitalize");


const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const Listing = require('./models/listing');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

const dbUrl = process.env.ATLASDB_URL;

main().then(()=>console.log("connection successful"))
.catch((err)=>console.log(err));


async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", ()=>{
    console.log("ERROR in Mongo Session Store");
});

const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get('/', (req, res)=>{
    res.redirect("/listings");
});


// search route
app.get('/search', async (req, res)=>{
    let {destinations} = req.query;
    let allListing = await Listing.find({location : capitalize(destinations)});
    if(allListing.length == 0){
        req.flash("error", "Destination not found");
        res.redirect("/listings");
    }else{
        res.render("./listing/index.ejs",{allListing});
    }
});

// filters 
app.get('/filters/:category', async(req, res)=>{
    let {category} = req.params;
    let allListing = await Listing.find({category : category});
    res.render("./listing/index.ejs",{allListing});
});


// for demo users 
app.get('/demouser', async (req, res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });

    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});


app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);


//init route
// app.get('/listings/new', (req, res)=>{
//     res.render("listing/new.ejs");
// });

// app.get('/testListing', async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "my home",
//         discription: "by the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful");
// });

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "page not found") );
});

app.use((err, req, res, next)=>{
    let {statusCode = 500, message} = err;
    res.status(statusCode).render("./listing/error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("listening...");
});
