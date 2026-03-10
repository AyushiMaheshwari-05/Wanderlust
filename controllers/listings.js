const Listing=require("../models/listing");
const axios=require('axios');

module.exports.index=async(req,res) => {
    const allListings=await Listing.find({})
    res.render('listings/index.ejs',{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render('listings/new.ejs');
};


 module.exports.showListing = async (req,res)=> {
let {id}=req.params;
    const listing= await Listing.findById(id)
    .populate({path:'reviews',
        populate:{
            path:"author",
        },
    })
    .populate('owner'); 
    if(!listing){
        req.flash('error','Listing you requested does not exist!');
       return res.redirect('/listings');
    }
    console.log(listing);
    res.render('listings/show.ejs',{listing});  
};

module.exports.createListing = async (req, res, next) => {
    let { location, country } = req.body.listing;
    
    // Search query ko specific banayein: "City, Country"
    const searchQuery = `${location}, ${country}`;
    const geoURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;

    try {
        const response = await axios.get(geoURL, {
            headers: { 'User-Agent': 'Wanderlust-Project-App' }
        });

        // DEFAULT: Agar API fail ho jaye (India Center)
        let lat = 20.5937;
        let lon = 78.9629;

        // CHECK: Kya API ne kuch return kiya?
        if (response.data && response.data.length > 0) {
            lat = parseFloat(response.data[0].lat);
            lon = parseFloat(response.data[0].lon);
            console.log(`Found Location: ${lat}, ${lon}`); // Terminal mein check karo
        } else {
            console.log("Location not found, using defaults");
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url: req.file.path, filename: req.file.filename };
        
        // GEOMETRY SAVE: [Longitude, Latitude] format mein
        newListing.geometry = {
            type: "Point",
            coordinates: [lon, lat] 
        };

        await newListing.save();
        res.redirect("/listings");

    } catch (err) {
        console.error("Geocoding Error:", err.message);
        next(err);
    }
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash('error','Listing you requested does not exist!');
       return res.redirect('/listings');
    }
     let originalImageUrl = listing.image.url;
    // Hum "/upload" ke baad Cloudinary ki transformation string (w_250) add kar rahe hain
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render('listings/edit.ejs',{listing,originalImageUrl})
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
   let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

   if(typeof req.file!== "undefined"){
     let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
   }
   req.flash('success','Successfully updated the listing!');
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing =async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    console.log('Deleted Successfully');
    req.flash('success','Successfully deleted the listing!');
    res.redirect('/listings');
};