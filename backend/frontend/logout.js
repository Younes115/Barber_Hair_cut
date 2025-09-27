// Function to handle logout
function logout() {
    localStorage.removeItem('userToken');
    alert('Logged out successfully!');
    window.location.href = './index.html';
}

// Function to check login status and update UI
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

// Main DOMContentLoaded event listener (يجب أن يكون موجوداً بالفعل)
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // التحقق عند تحميل الصفحة
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // ... باقي الكود الخاص بهذه الصفحة (initializeGoogleSignIn, fetchPackages, إلخ.)
});