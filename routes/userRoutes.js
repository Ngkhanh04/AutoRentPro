const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);

router.get('/:id/bookings', bookingController.getUserBookings);

module.exports = router;