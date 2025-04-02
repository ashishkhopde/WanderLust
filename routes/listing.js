const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isOwner, validateListing} = require("../middleware");
const listingController = require("../controllers/listings");
const multer  = require("multer");
const {storage} = require("../cloudConfig");
const upload = multer({storage});

router.route('/')
// index route 
.get(wrapAsync(listingController.index))
//Create route
.post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListings));


//New route
router.get('/new', isLoggedIn, listingController.renderNewForm);

router.route('/:id')
//show route
.get(wrapAsync (listingController.showListings))

//update route
.put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync (listingController.updateListings))

//Destroy route
.delete(isLoggedIn, isOwner, wrapAsync (listingController.destroyListings));


//Edit route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync (listingController.renderEditForm));


module.exports = router;
