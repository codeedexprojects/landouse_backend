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
const affiliateRoutes=require('./Routes/Admin/affiliateRoutes')
const overviewRoutes=require('./Routes/Admin/overviewRoutes')
const placeRoutes=require('./Routes/Admin/placeRoutes')
const contactAdminRoutes=require('./Routes/Admin/contactRoutes')
const sellPropertyRoutesAdmin=require('./Routes/Admin/sellPropertyRoutes')

const vendorAuthRoutes=require('./Routes/Vendor/authRoutes')
const vendorPropertyRoutes=require('./Routes/Vendor/propertyRoutes')
const vendorEnquiryRoutes=require('./Routes/Vendor/enquiryRoutes')

const userAuthRoutes=require('./Routes/User/authRoutes')
const enquiryRoutes=require('./Routes/User/enquiryRoutes')
const referralRoutes=require('./Routes/User/referralRoutes')
const favouriteRoutes=require('./Routes/User/favouriteRoutes')
const comparisonRoutes=require('./Routes/User/comparisonRoutes')
const homeLoanRoutes=require('./Routes/User/homeLoanRoutes')
const userPropertyRoutes=require('./Routes/User/propertyRoutes')
const contactRoutes=require('./Routes/User/contactRoutes')
const  sellPropertyRoutes=require('./Routes/User/sellPropertyRoutes')
const affiliateAuthRoutes=require('./Routes/Affiliate/authRoutes')


// admin routes
app.use('/api/admin/auth',adminAuthRoutes)
app.use('/api/admin/property',propertyRoutes)
app.use('/api/admin/vendor',vendorRoutes)
app.use('/api/admin/user',userAdminRoutes)
app.use('/api/admin/enquiry',adminEnquiryRoutes)
app.use('/api/admin/homeloan',homeLoanAdminRoutes)
app.use('/api/admin/affiliate',affiliateRoutes)
app.use('/api/admin/overview',overviewRoutes)
app.use('/api/admin/place',placeRoutes)
app.use('/api/admin/contact',contactAdminRoutes)
app.use('/api/admin/sellproperty',sellPropertyRoutesAdmin)

// vendor routes 
app.use('/api/vendor/auth',vendorAuthRoutes)
app.use('/api/vendor/property',vendorPropertyRoutes)
app.use('/api/vendor/enquiry',vendorEnquiryRoutes)

// user routes
app.use('/api/user/auth',userAuthRoutes)
app.use('/api/user/enquiry',enquiryRoutes)
app.use('/api/user/referral',referralRoutes)
app.use('/api/user/favourite',favouriteRoutes)
app.use('/api/user/compare',comparisonRoutes)
app.use('/api/user/homeloan',homeLoanRoutes)
app.use('/api/user/property',userPropertyRoutes)
app.use('/api/user/contact',contactRoutes)
app.use('/api/user/sellproperty',sellPropertyRoutes)

// affiliate routes
app.use('/api/affiliate/auth',affiliateAuthRoutes)


require('./DB/connection');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Server Configuration
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server started listening at PORT ${PORT}`);
});
