// 1. تحديد رابط السيرفر الأساسي بناءً على مكان التشغيل
const API_BASE_URL = '';

// دالة تسجيل الدخول عبر جوجل
function onSignIn(response) {
    const id_token = response.credential;
    
    console.log("ID Token:", id_token);

    // استخدام الرابط الديناميكي للإرسال للباك آند
    fetch(`${API_BASE_URL}/api/auth/google`, {
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

// دالة تهيئة زر جوجل وجلب الـ Client ID
async function initializeGoogleSignIn() {
    try {
        // جلب الإعدادات من السيرفر المحلي أو المرفوع
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) {
            throw new Error('Failed to fetch Google Client ID from server.');
        }
        const config = await response.json();
        const googleClientId = config.googleClientId;

        if (!googleClientId) {
            console.error('Google Client ID not found in server response.');
            return;
        }

        // Guard: ensure Google Identity Services script has loaded
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            console.error('Google Identity Services script not loaded. Check your internet connection or ad-blocker.');
            const container = document.getElementById('google-login-button');
            if (container) container.innerHTML = '<p style="color:#f0b400;">Google login unavailable. Please refresh or check your connection.</p>';
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
        const container = document.getElementById('google-login-button');
        if (container) container.innerHTML = '<p style="color:#f0b400;">Failed to load Google Sign-In. Please refresh the page.</p>';
    }
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('userToken');
    alert('Logged out successfully!');
    window.location.href = './index.html';
}

// التحقق من حالة الدخول وتحديث شكل الواجهة
function checkLoginStatus() {
    const token = localStorage.getItem('userToken');
    const loginButton = document.getElementById('google-login-button');
    const logoutContainer = document.getElementById('logout-container');

    if (token) {
        if (loginButton) loginButton.style.display = 'none';
        if (logoutContainer) logoutContainer.style.display = 'block';
    } else {
        if (loginButton) loginButton.style.display = 'block';
        if (logoutContainer) logoutContainer.style.display = 'none';
    }
}

// التحقق مما إذا كان المستخدم "أدمن" لإظهار أزرار التحكم
async function checkAdminStatus() {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        if (user && user.role === 'admin') {
            const adminContainer = document.getElementById('admin-bookings-btn-container');
            if (adminContainer) adminContainer.style.display = 'block';
        }
    } catch (error) {
        console.error("Failed to check admin status:", error);
    }
}

// جلب حجوزات اليوم (خاص بالأدمن)
async function getDailyBookings() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("Please log in.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/booking/today`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        const bookings = await response.json();
        localStorage.setItem('dailyBookings', JSON.stringify(bookings));
        window.location.href = './daily-bookings.html';
    } catch (error) {
        alert("Error fetching bookings: " + error.message);
    }
}

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("google-login-button")) {
        initializeGoogleSignIn();
    }
    checkLoginStatus(); 
    checkAdminStatus(); 
    
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    const viewBookingsBtn = document.getElementById('view-bookings-btn');
    if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener('click', getDailyBookings);
    }
    
    // قائمة الموبايل (Hamburger Menu)
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('#navbar ul');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
});