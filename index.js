require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json({ limit: "500mb" }));  
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const adminAuthRoutes=require("./Routes/Admin/authRoutes")
const propertyRoutes=require("./Routes/Admin/propertyRoutes")
const vendorRoutes = require('./Routes/Admin/vendorRoutes')
const userAdminRoutes=require('./Routes/Admin/userRoutes')
const adminEnquiryRoutes=require('./Routes/Admin/enquiryRoutes')
const homeLoanAdminRoutes=require('./Routes/Admin/homeLoanRoutes')

const vendorAuthRoutes=require('./Routes/Vendor/authRoutes')
const vendorPropertyRoutes=require('./Routes/Vendor/propertyRoutes')

const userAuthRoutes=require('./Routes/User/authRoutes')
const enquiryRoutes=require('./Routes/User/enquiryRoutes')
const referralRoutes=require('./Routes/User/referralRoutes')
const favouriteRoutes=require('./Routes/User/favouriteRoutes')
const comparisonRoutes=require('./Routes/User/comparisonRoutes')
const homeLoanRoutes=require('./Routes/User/homeLoanRoutes')

// admin routes
app.use('/api/admin/auth',adminAuthRoutes)
app.use('/api/admin/property',propertyRoutes)
app.use('/api/admin/vendor',vendorRoutes)
app.use('/api/admin/user',userAdminRoutes)
app.use('/api/admin/enquiry',adminEnquiryRoutes)
app.use('/api/admin/homeloan',homeLoanAdminRoutes)

// vendor routes 
app.use('/api/vendor/auth',vendorAuthRoutes)
app.use('/api/vendor/property',vendorPropertyRoutes)

// user routes
app.use('/api/user/auth',userAuthRoutes)
app.use('/api/user/enquiry',enquiryRoutes)
app.use('/api/user/referral',referralRoutes)
app.use('/api/user/favourite',favouriteRoutes)
app.use('/api/user/compare',comparisonRoutes)
app.use('/api/user/homeloan',homeLoanRoutes)


require('./DB/connection');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Server Configuration
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server started listening at PORT ${PORT}`);
});
