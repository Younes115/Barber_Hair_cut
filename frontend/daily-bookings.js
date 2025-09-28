// دالة لمعالجة تسجيل الخروج (مدمجة)
function logout() {
    localStorage.removeItem('userToken');
    alert('Logged out successfully!');
    window.location.href = './index.html';
}

// دالة للتحقق من حالة تسجيل الدخول وتحديث الواجهة
function checkLoginStatus() {
    const token = localStorage.getItem('userToken');
    const logoutContainer = document.getElementById('logout-container');

    if (token) {
        if (logoutContainer) logoutContainer.style.display = 'block';
    } else {
        if (logoutContainer) logoutContainer.style.display = 'none';
    }
    return token ? true : false;
}

document.addEventListener('DOMContentLoaded', () => {
    // التحقق من تسجيل الدخول وإعادة التوجيه إذا لزم الأمر
    if (!checkLoginStatus()) {
        alert('Please log in to view this page.');
        window.location.href = './index.html';
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('dailyBookings')) || [];
    const tableBody = document.getElementById('bookings-table-body');

    if (bookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No bookings for today.</td></tr>`;
    } else {
        tableBody.innerHTML = bookings.map(booking => {
            const servicesNames = booking.services.map(s => s.name).join(', ');
            return `
                <tr>
                    <td>${booking.time}</td>
                    <td>${booking.name}</td>
                    <td>${booking.email}</td>
                    <td>${booking.phone}</td>
                    <td>${servicesNames}</td>
                </tr>
            `;
        }).join('');
    }
    
    // Clear localStorage to prevent stale data on future visits
    localStorage.removeItem('dailyBookings');

    // تفعيل الـ logout وزر القائمة (Hamburger Menu)
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('#navbar ul');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
});