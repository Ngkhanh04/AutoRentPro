const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    carId: { type: String, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    pricePerHour: { type: Number }, // Giá thuê theo giờ (tùy chọn)
    owner: { type: String, default: 'Showroom' },
    image: { type: String }, // URL ảnh
    description: { type: String },
    status: { type: String, default: 'AVAILABLE' }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);