const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
  updateUserByAdmin,
  deleteUserByAdmin
} = require('../../Controller/Admin/userController');
const {upload} = require('../../Middlewares/multerMiddleware')


router.get('/view', getAllUsers);
router.get('/view/:id', getSingleUser);
router.patch('/update/:id',upload.single('profileImage'), updateUserByAdmin);
router.delete('/delete/:id', deleteUserByAdmin);

module.exports = router;
