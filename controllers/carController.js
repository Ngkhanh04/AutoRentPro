const Car = require('../models/Car');

exports.getAllCars = async (req, res) => {
    try {
        const { page = 1, limit = 10, model, maxPrice } = req.query;

        let filter = {};
        if (model) filter.model = { $regex: model, $options: 'i' };
        if (maxPrice) filter.pricePerDay = { $lte: Number(maxPrice) };

        const cars = await Car.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Car.countDocuments(filter);

        res.status(200).json({
            total: count,
            currentPage: Number(page),
            data: cars
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCar = async (req, res) => {
    try {
        const newCar = new Car(req.body);
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.seedCars = async (req, res) => {
    try {
        const sampleCars = [
            {
                carId: "CAR_001",
                brand: "VinFast",
                model: "VF8 Eco",
                licensePlate: "30H-111.11",
                pricePerDay: 1500000,
                owner: "VinFast Official",
                image: "https://images.unsplash.com/photo-1696522301987-a22675d6540c?q=80&w=2070&auto=format&fit=crop",
                description: "Smart electric SUV with advanced ADAS technology and modern design.",
                status: "AVAILABLE"
            },
            {
                carId: "CAR_002",
                brand: "Mercedes",
                model: "S450 Luxury",
                licensePlate: "51K-222.22",
                pricePerDay: 5000000,
                owner: "Khanh_Admin",
                image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
                description: "The definition of luxury. Top-class interior, smooth ride, VIP experience.",
                status: "AVAILABLE"
            },
            {
                carId: "CAR_003",
                brand: "Porsche",
                model: "911 Carrera",
                licensePlate: "29A-333.33",
                pricePerDay: 12000000,
                owner: "Showroom VIP",
                image: "https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2070&auto=format&fit=crop",
                description: "Legendary sports car. High speed, powerful engine, and emotional driving feel.",
                status: "AVAILABLE"
            },
            {
                carId: "CAR_004",
                brand: "Toyota",
                model: "Vios G 2024",
                licensePlate: "60A-444.44",
                pricePerDay: 800000,
                owner: "Local Partner",
                image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=2070&auto=format&fit=crop",
                description: "Fuel-efficient, durable, and perfect for small family trips.",
                status: "AVAILABLE"
            },
            {
                carId: "CAR_005",
                brand: "Ford",
                model: "Ranger Wildtrak",
                licensePlate: "14C-555.55",
                pricePerDay: 1200000,
                owner: "Showroom",
                image: "https://images.unsplash.com/photo-1551830820-330a71b99659?q=80&w=2070&auto=format&fit=crop",
                description: "King of pickup trucks. Strong engine, high ground clearance, off-road ready.",
                status: "AVAILABLE"
            },
            {
                carId: "CAR_006",
                brand: "Mazda",
                model: "Mazda 3 Sport",
                licensePlate: "51H-666.66",
                pricePerDay: 1100000,
                owner: "Private Owner",
                image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2070&auto=format&fit=crop",
                description: "Youthful KODO design, premium features, and great handling.",
                status: "AVAILABLE"
            }
        ];

        await Car.deleteMany({});

        await Car.insertMany(sampleCars);

        res.status(201).json({
            message: "Database seeded successfully!",
            count: sampleCars.length,
            data: sampleCars
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};