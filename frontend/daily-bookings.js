document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
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
});
document.addEventListener('DOMContentLoaded', () => {
    // ... (الكود الأصلي لـ checkLoginStatus و initializeGoogleSignIn) ...

    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('nav ul');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    // ... (باقي كود DOMContentLoaded)
});
