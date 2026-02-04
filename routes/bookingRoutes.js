const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/owner', bookingController.getOwnerBookings);
router.get('/admin/summary', bookingController.getAdminSummary);

router.get('/all', bookingController.getAllBookings); 

router.put('/:id', bookingController.updateBookingStatus);
router.get('/:id', bookingController.getBookingById);

module.exports = router;