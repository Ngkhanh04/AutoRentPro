const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

router.post('/seed', carController.seedCars);
router.get('/', carController.getAllCars);
router.post('/', carController.createCar);

module.exports = router;