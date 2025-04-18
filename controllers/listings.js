const Listing = require("../models/listing");
const capitalize = require("../public/js/capitalize")


module.exports.index = async (req, res)=>{
    let allListing = await Listing.find();
    res.render("listing/index.ejs", {allListing});
};

module.exports.renderNewForm = (req, res)=>{
    res.render("listing/new.ejs");
};

module.exports.showListings = async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate :{path : "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requesed for does not exist!");
        res.redirect("/listings");
    }
    res.render("listing/show.ejs", {listing});
};

module.exports.createListings = async (req, res, next)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.location = capitalize(req.body.listing["location"]);
    newListing.country = capitalize(req.body.listing["country"]);
    newListing.title = capitalize(req.body.listing["title"]);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect('/listings');
};

module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requesed for does not exist!");
        res.redirect("/listings");
    }

    let orignalImageUrl = listing.image.url;
    orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listing/edit.ejs", {listing, orignalImageUrl});
};

module.exports.updateListings = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {... req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    };

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListings = async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect('/listings');
};