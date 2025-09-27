// Function for Google Sign-In
function onSignIn(response) {
    const id_token = response.credential;
    
    console.log("ID Token:", id_token);

    fetch('https://barberhaircut-production.up.railway.app/api/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: id_token }),
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { 
                throw new Error(err.message || 'Login failed on server side.');
            });
        }
        return res.json();
    })
    .then(data => {
        console.log('Server response:', data);
        if (data.jwtToken) {
            localStorage.setItem('userToken', data.jwtToken);
            alert('Login successful!');
             window.location.reload();
        } else {
            alert('Login failed. No token received from server.');
        }
    })
    .catch((error) => {
        console.error('Error sending token to server:', error);
        alert(`Login failed: ${error.message}`);
    });
}

// Function to initialize Google Sign-In and fetch the client ID
async function initializeGoogleSignIn() {
    try {
        const response = await fetch('https://barberhaircut-production.up.railway.app/config');
        if (!response.ok) {
            throw new Error('Failed to fetch Google Client ID from server.');
        }
        const config = await response.json();
        const googleClientId = config.googleClientId;

        if (!googleClientId) {
            console.error('Google Client ID not found in server response.');
            return;
        }

        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: onSignIn
        });
        
        google.accounts.id.renderButton(
            document.getElementById("google-login-button"),
            {
                type: "standard",
                size: "large",
                theme: "outline",
                text: "sign_in_with"
            }
        );
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

// Function to check user role and display admin buttons
async function checkAdminStatus() {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
        const response = await fetch('https://barberhaircut-production.up.railway.app/api/auth/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        if (user && user.role === 'admin') {
            document.getElementById('admin-bookings-btn-container').style.display = 'block';
        }
    } catch (error) {
        console.error("Failed to check admin status:", error);
    }
}

// Function to fetch and display today's bookings
async function getDailyBookings() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("Please log in.");
        return;
    }

    try {
        const response = await fetch('https://barberhaircut-production.up.railway.app/api/admin/booking/today', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        const bookings = await response.json();
        
        // حفظ بيانات الحجوزات في localStorage
        localStorage.setItem('dailyBookings', JSON.stringify(bookings));
        
        // نقل المستخدم إلى صفحة عرض الحجوزات
        window.location.href = './daily-bookings.html';
        
    } catch (error) {
        alert("Error fetching bookings: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("google-login-button")) {
        initializeGoogleSignIn();
    }
    checkAdminStatus(); 
    const viewBookingsBtn = document.getElementById('view-bookings-btn');
    if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener('click', getDailyBookings);
    }
});