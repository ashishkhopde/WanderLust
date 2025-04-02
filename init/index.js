let mongoose = require("mongoose");
let initData = require("./data.js");
let Listing = require("../models/listing.js");


main().then(()=>console.log("connection successful"))
.catch((err)=>console.log(err));


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: '67dc2d27e78da0878d82fa89'}));
    await Listing.insertMany(initData.data);
    console.log("data was initilazed");
}

initDB();