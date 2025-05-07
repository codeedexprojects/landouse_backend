const express = require("express");
const { registerAdmin, loginAdmin, updateAdminProfile, getAdminProfile } = require("../../Controller/Admin/authController");
const {upload} = require('../../Middlewares/multerMiddleware'); 


const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.patch('/profile/:id',upload.single('profileImage'), updateAdminProfile);
router.get('/profile/view/:id', getAdminProfile);


module.exports = router;
