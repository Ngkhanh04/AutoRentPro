const Booking = require('../models/Booking');
const Car = require('../models/Car');

// 1. Tạo đơn
exports.createBooking = async (req, res) => {
    try {
        const { customerId, carId, startDate, endDate, bookingType = 'Daily' } = req.body;

        // 1. Chuyển đổi sang định dạng Date để so sánh
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate cơ bản: Ngày trả phải sau ngày nhận
        if (start >= end) {
            return res.status(400).json({ message: "Ngày trả xe phải sau ngày nhận xe!" });
        }

        // 2. CHECK TRÙNG LỊCH (QUAN TRỌNG)
        const conflict = await Booking.findOne({
            car: carId,
            status: { $in: ['Pending', 'Confirmed'] },
            $and: [
                { startDate: { $lte: end } },
                { endDate: { $gte: start } }
            ]
        });

        if (conflict) {
            return res.status(400).json({
                message: "❌ Xe này đã kẹt lịch trong khoảng thời gian bạn chọn! Vui lòng chọn ngày khác."
            });
        }

        // Fetch Car info for price calculation
        const carInfo = await Car.findById(carId);
        if (!carInfo) return res.status(404).json({ message: "Xe không tồn tại" });

        let calculatedPrice = 0;
        if (bookingType === 'Hourly') {
            if (!carInfo.pricePerHour) {
                return res.status(400).json({ message: "Xe này không hỗ trợ thuê theo giờ" });
            }
            const hours = Math.ceil((end - start) / (1000 * 60 * 60));
            calculatedPrice = hours * carInfo.pricePerHour;
        } else {
            // Default to Daily
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            calculatedPrice = days * carInfo.pricePerDay;
        }

        // 3. Nếu không trùng thì mới cho tạo đơn
        const newBooking = new Booking({
            customer: customerId,
            car: carId,
            startDate,
            endDate,
            bookingType,
            totalPrice: calculatedPrice,
            status: 'Pending'
        });

        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);

    } catch (err) { res.status(400).json({ message: err.message }); }
};
// 2. Lấy đơn theo ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'fullName email phone')
            .populate('car');
        if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn" });
        res.status(200).json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Lấy đơn của user
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.params.id })
            .populate('car')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 4. Lấy đơn của Owner (cho demo cũ)
exports.getOwnerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer', 'fullName')
            .populate('car');
        res.status(200).json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. Admin thống kê
exports.getAdminSummary = async (req, res) => {
    try {
        const total = await Booking.countDocuments();
        const breakdown = await Booking.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ total, breakdown });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

//  6. QUAN TRỌNG: Hàm lấy TẤT CẢ đơn (Admin Dashboard dùng cái này)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer', 'fullName email')
            .populate('car', 'brand model');
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//  7. QUAN TRỌNG: Hàm duyệt đơn (Admin Dashboard dùng cái này)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        if (!updatedBooking) return res.status(404).json({ message: "Không tìm thấy đơn này" });
        res.status(200).json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};