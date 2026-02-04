const API_URL = 'https://autorentpro.onrender.com/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCars();
    updateUIForGuest();
});

function updateUIForGuest() {
    currentUser = null;
    const authSection = document.getElementById('auth-section');
    const mainApp = document.getElementById('main-app');
    
    if(authSection) authSection.classList.add('hidden');
    if(mainApp) mainApp.classList.remove('hidden');

    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = 'Khách';
    
    document.getElementById('btn-login-nav').classList.remove('hidden');
    document.getElementById('btn-logout').classList.add('hidden');

    document.getElementById('nav-item-cars').classList.remove('hidden');
    document.getElementById('nav-item-history').classList.add('hidden');
    document.getElementById('nav-item-admin').classList.add('hidden');

    const heroSection = document.querySelector('.hero-section');
    if(heroSection) heroSection.classList.remove('hidden');

    switchTab('cars');
}

function updateUIForUser(user) {
    currentUser = user;
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    document.getElementById('user-display').innerText = `👤 ${user.fullName}`;
    document.getElementById('btn-login-nav').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');

    if (user.role === 'ADMIN') {
        document.getElementById('nav-item-cars').classList.add('hidden');
        document.getElementById('nav-item-history').classList.add('hidden');
        document.getElementById('nav-item-admin').classList.remove('hidden');

        const heroSection = document.querySelector('.hero-section');
        if(heroSection) heroSection.classList.add('hidden');

        loadAdminDashboard();
    } else {
        document.getElementById('nav-item-cars').classList.remove('hidden');
        document.getElementById('nav-item-history').classList.remove('hidden');
        document.getElementById('nav-item-admin').classList.add('hidden');

        const heroSection = document.querySelector('.hero-section');
        if(heroSection) heroSection.classList.remove('hidden');

        loadCars();
    }
}

function showAuth() {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}

function showMainCars() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
}

async function registerUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;

    if (!username || !email) return alert("Vui lòng nhập Username và Email!");

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, fullName, password: '123', role: 'CUSTOMER' })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Xin chào ${data.fullName}!`);
            updateUIForUser(data);
        } else {
            alert("Lỗi: " + (data.message || "Email có thể đã tồn tại."));
        }
    } catch (err) { console.error(err); alert("Lỗi kết nối server"); }
}

const btnLogout = document.getElementById('btn-logout');
if(btnLogout) {
    btnLogout.addEventListener('click', function () {
        updateUIForGuest();
    });
}

async function loadCars() {
    const model = document.getElementById('searchModel').value;
    const maxPrice = document.getElementById('maxPrice').value;

    let query = `?page=1&limit=100`;
    if (model) query += `&model=${model}`;
    if (maxPrice) query += `&maxPrice=${maxPrice}`;

    try {
        const res = await fetch(`${API_URL}/cars${query}`);
        const result = await res.json();
        const cars = result.data || result;
        const container = document.getElementById('car-list');
        container.innerHTML = '';

        if (!cars || cars.length === 0) {
            container.innerHTML = `<div class="text-center py-5 text-muted col-12"><i class="fas fa-car-crash fs-1 mb-3"></i><p>Không tìm thấy xe nào hợp lý cả!</p></div>`;
            return;
        }

        cars.forEach((car, index) => {
            const statusColor = car.status === 'AVAILABLE' ? 'success' : 'secondary';
            const statusText = car.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đã thuê';

            let carIcon = 'fa-car';
            if (car.brand && car.brand.toLowerCase().includes('vinfast')) carIcon = 'fa-bolt';
            if (car.brand && car.brand.toLowerCase().includes('mercedes')) carIcon = 'fa-star';

            let carImageDisplay = `<div class="car-img-wrapper"><i class="fas ${carIcon} car-img-placeholder"></i><span class="badge bg-${statusColor} badge-status">${statusText}</span></div>`;

            if (car.image) {
                carImageDisplay = `
                    <div class="car-img-wrapper">
                        <span class="badge bg-${statusColor} badge-status">${statusText}</span>
                        <img src="${car.image}" alt="${car.model}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                `;
            } else {
                carImageDisplay = `
                    <div class="car-img-wrapper">
                         <span class="badge bg-${statusColor} badge-status">${statusText}</span>
                        <i class="fas ${carIcon} car-img-placeholder"></i>
                    </div>
                `;
            }

            const delay = index * 0.1;

            const html = `
                <div class="col-md-6 col-lg-4" style="animation-delay: ${delay}s">
                    <div class="car-card h-100 d-flex flex-column">
                        ${carImageDisplay}
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <small class="text-uppercase text-muted fw-bold" style="font-size: 0.75rem;">${car.brand}</small>
                                    <h5 class="card-title fw-bold text-dark mb-0">${car.model}</h5>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <span class="badge bg-light text-dark border me-1"><i class="fas fa-id-card me-1"></i> ${car.licensePlate}</span>
                                <span class="badge bg-light text-dark border"><i class="fas fa-gas-pump me-1"></i> Xăng/Điện</span>
                            </div>

                            <p class="card-text text-muted small flex-grow-1 line-clamp-2">
                                ${car.description || 'Nội thất sang trọng, trải nghiệm lái tuyệt vời.'}
                            </p>

                            <div class="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                                <div class="text-start">
                                    <small class="text-muted d-block" style="font-size: 0.8rem;">Giá thuê / ngày</small>
                                    <div class="car-price">${car.pricePerDay ? car.pricePerDay.toLocaleString() : 0} ₫</div>
                                </div>
                                <button onclick="openBookingModal('${car._id}', '${car.model}')" 
                                    class="btn btn-gradient shadow-sm" ${car.status !== 'AVAILABLE' ? 'disabled' : ''}>
                                    ${car.status === 'AVAILABLE' ? 'Đặt Xe' : 'Đã Hết'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });

    } catch (err) { console.error("Load cars error:", err); }
}

let selectedCarId = null;

function openBookingModal(carId, carName) {
    if (!currentUser) {
        if (confirm("Bạn cần đăng nhập để đặt xe. Đến trang đăng nhập ngay?")) {
            showAuth();
        }
        return;
    }

    selectedCarId = carId;
    document.getElementById('modal-car-name').innerText = carName;
    document.getElementById('modal-car-id').value = carId;

    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';

    new bootstrap.Modal(document.getElementById('bookingModal')).show();
}

async function submitBooking() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) return alert("Vui lòng chọn đầy đủ ngày giờ!");

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) return alert("Ngày trả phải sau ngày nhận!");

    try {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: currentUser._id,
                carId: selectedCarId,
                startDate,
                endDate
            })
        });

        if (res.ok) {
            alert("✅ Đặt xe thành công! Check lịch sử nha.");
            const modalEl = document.getElementById('bookingModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            if (currentUser.role !== 'ADMIN') {
                loadHistory();
            }
        } else {
            const err = await res.json();
            alert("Lỗi: " + err.message);
        }
    } catch (err) { alert("Lỗi hệ thống khi đặt xe"); }
}

async function loadHistory() {
    switchTab('history');
    if (!currentUser) return;

    try {
        const res = await fetch(`${API_URL}/users/${currentUser._id}/bookings`);
        const bookings = await res.json();

        const tbody = document.getElementById('history-list');
        tbody.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Bạn chưa có đơn hàng nào!</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const carName = booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Xe đã bị xóa';

            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);

            const formatTime = (date) => {
                return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
            };

            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const pricePerDay = booking.car ? booking.car.pricePerDay : 0;
            const totalPrice = diffDays * pricePerDay;

            const row = `
                <tr>
                    <td><small class="text-muted">#${booking._id.substring(booking._id.length - 6)}</small></td>
                    <td class="fw-bold text-primary">${carName}</td>
                    <td>
                        <small class="d-block text-nowrap">Từ: ${formatTime(start)}</small>
                        <small class="d-block text-nowrap">Đến: ${formatTime(end)}</small>
                        <small class="text-muted fst-italic">(${diffDays} ngày)</small>
                    </td>
                    <td class="fw-bold text-success">
                        ${totalPrice.toLocaleString('vi-VN')} ₫
                    </td>
                    <td><span class="badge bg-warning text-dark">${booking.status}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (err) { console.error(err); }
}

async function loadAdminDashboard() {
    switchTab('admin');

    try {
        const res = await fetch(`${API_URL}/bookings/all`);
        const bookings = await res.json();

        const tbody = document.getElementById('admin-list');
        tbody.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Chưa có đơn hàng nào cần xử lý.</td></tr>';
            return;
        }

        bookings.forEach(booking => {
            const customerName = booking.customer ? booking.customer.fullName : 'Unknown';
            const carName = booking.car ? booking.car.model : 'Unknown Car';

            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const formatTime = (date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');

            let statusBadge = `<span class="badge bg-secondary">${booking.status}</span>`;
            if (booking.status === 'Pending') statusBadge = `<span class="badge bg-warning text-dark">⏳ Pending</span>`;
            if (booking.status === 'Confirmed') statusBadge = `<span class="badge bg-success">✅ Confirmed</span>`;
            if (booking.status === 'Cancelled') statusBadge = `<span class="badge bg-danger">❌ Cancelled</span>`;

            let actions = '';
            if (booking.status === 'Pending') {
                actions = `
                    <button onclick="updateBookingStatus('${booking._id}', 'Confirmed')" class="btn btn-sm btn-success rounded-pill me-1" title="Duyệt">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="updateBookingStatus('${booking._id}', 'Cancelled')" class="btn btn-sm btn-outline-danger rounded-pill" title="Hủy">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else {
                actions = `<small class="text-muted">Đã xử lý</small>`;
            }

            const row = `
                <tr>
                    <td class="ps-4 fw-bold text-dark">${customerName}</td>
                    <td>${carName}</td>
                    <td>
                        <small class="d-block text-nowrap">Từ: ${formatTime(start)}</small>
                        <small class="d-block text-nowrap">Đến: ${formatTime(end)}</small>
                    </td>
                    <td>${statusBadge}</td>
                    <td class="text-end pe-4">${actions}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (err) { console.error(err); alert("Failed to load admin data"); }
}

async function updateBookingStatus(bookingId, newStatus) {
    if (!confirm(`Bạn chắc chắn muốn chuyển sang trạng thái: ${newStatus}?`)) return;

    try {
        const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            loadAdminDashboard();
        } else {
            alert("Update failed!");
        }
    } catch (err) { console.error(err); }
}

function switchTab(tabName) {
    const btnCars = document.getElementById('btn-cars');
    const btnHistory = document.getElementById('btn-history');
    const btnAdmin = document.getElementById('btn-admin');

    const divCars = document.getElementById('tab-cars');
    const divHistory = document.getElementById('tab-history');
    const divAdmin = document.getElementById('tab-admin');

    if(divCars) divCars.classList.add('hidden');
    if(divHistory) divHistory.classList.add('hidden');
    if(divAdmin) divAdmin.classList.add('hidden');

    if (btnCars) btnCars.classList.remove('active');
    if (btnHistory) btnHistory.classList.remove('active');
    if (btnAdmin) btnAdmin.classList.remove('active');

    if (tabName === 'cars') {
        if(divCars) divCars.classList.remove('hidden');
        if (btnCars) btnCars.classList.add('active');
    } else if (tabName === 'history') {
        if(divHistory) divHistory.classList.remove('hidden');
        if (btnHistory) btnHistory.classList.add('active');
    } else if (tabName === 'admin') {
        if(divAdmin) divAdmin.classList.remove('hidden');
        if (btnAdmin) btnAdmin.classList.add('active');
    }
}