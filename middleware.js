const Listing=require("./models/listing");
const Review=require("./models/review");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req,res,next)=>{
if(!req.isAuthenticated()){
    //redirectURL is stored in session to redirect after login
        req.session.redirectURL=req.originalUrl;
        req.flash('error','You must be logged in to create a listing!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectURL=async(req,res,next)=>{
    if(req.session.redirectURL){
       res.locals.redirectURL=req.session.redirectURL;
    }
    next();
};

module.exports.isOwner=async(req,res,next)=> {
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the owner of this listing");
         return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing=(req,res,next)=>{
     let {error}= listingSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map(el => el.message).join(',');
    throw new ExpressError(400,errMsg);
  } else {
    next();
  }
};

module.exports.validateReview=(req,res,next)=>{
     let {error}= reviewSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map(el => el.message).join(',');
    throw new ExpressError(400,errMsg);
  } else {
    next();
  }
};

module.exports.isreviewAuthor=async(req,res,next)=> {
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the author of this review");
         return res.redirect(`/listings/${id}`);
    }
    next();
}
