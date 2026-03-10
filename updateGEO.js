const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const axios = require("axios");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

// Delay function taaki 429 error na aaye
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function migrateLocations() {
    let listings = await Listing.find({});
    console.log(`Total ${listings.length} listings found. Starting update...`);

    for (let listing of listings) {
        // Sirf unhe update karo jinme geometry nahi hai
        if (!listing.geometry || !listing.geometry.coordinates || listing.geometry.coordinates.length === 0) {
            console.log(`Fetching original loc for: ${listing.location}`);
            try {
                const searchQuery = `${listing.location}, ${listing.country}`;
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, {
                    headers: { 'User-Agent': 'Wanderlust-Final-Fix' }
                });

                if (response.data.length > 0) {
                    listing.geometry = {
                        type: "Point",
                        coordinates: [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)]
                    };
                    await listing.save();
                    console.log(`✅ Success: ${listing.title}`);
                }
                
                // 1.5 second ka break lo har request ke baad (Zaroori hai!)
                await delay(2000); 

            } catch (e) {
                if(e.response && e.response.status === 429) {
                    console.log("❌ Rate limit hit! 5 second wait kar raha hoon...");
                    await delay(5000);
                } else {
                    console.log(`❌ Error for ${listing.title}:`, e.message);
                }
            }
        } else {
            console.log(`⏩ Skipping: ${listing.title} (Already has coordinates)`);
        }
    }
    console.log("Ab sach mein Migration Complete ho gaya!");
    process.exit();
}

migrateLocations();