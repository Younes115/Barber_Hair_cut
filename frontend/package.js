// 1. Dynamic API Base URL detection
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' 
    : 'https://barberhaircut-production.up.railway.app';

// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    alert('Logged out successfully!');
    window.location.href = './index.html';
}

// Check login status and update navbar
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

// Fetch packages from the database
async function fetchPackages() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/packages`); 
        if (!response.ok) {
            throw new Error('Failed to fetch packages from the database.');
        }
        const packages = await response.json();
        const isAdmin = await checkAdminStatus();
        renderPackages(packages, isAdmin);
    } catch (error) {
        console.error('Error fetching packages:', error);
    }
}

// Check if user is admin to show controls
async function checkAdminStatus() {
    const token = localStorage.getItem('userToken');
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        
        if (response.ok && user && user.role === 'admin') {
            // Show the admin controls container
            const adminControls = document.getElementById('admin-package-controls');
            if (adminControls) adminControls.style.display = 'block';
            return true;
        }
        return false;
    } catch (error) {
        console.error("Failed to check admin status:", error);
        return false;
    }
}

// Render package cards in the container
function renderPackages(packages, isAdmin) {
    const packageContainer = document.querySelector('.packages-container');
    if (!packageContainer) return;
    packageContainer.innerHTML = '';

    packages.forEach(pkg => {
        const packageCard = document.createElement('div');
        packageCard.className = 'package-card';
        packageCard.innerHTML = `
            <h3>${pkg.name}</h3>
            <p>${pkg.description}</p>
            <span>${pkg.price} EGP</span>
            <button class="book-btn" data-id="${pkg._id}" data-name="${pkg.name}" data-price="${pkg.price}">Add to Cart</button>
        `;
        packageContainer.appendChild(packageCard);
    });

    // Attach click events to "Add to Cart" buttons
    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const service = {
                _id: e.target.dataset.id,
                name: e.target.dataset.name,
                price: parseFloat(e.target.dataset.price)
            };
            addToCart(service);
        });
    });
}

// Add selected package to local storage cart
function addToCart(service) {
    const existingService = cart.find(item => item._id === service._id);
    if (existingService) {
        alert('This package is already in your cart.');
    } else {
        cart.push(service);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${service.name} added to cart!`);
    }
}

// DOM Content Loaded - Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
    fetchPackages();
    checkLoginStatus(); 

    // Admin Modal Elements
    const addPackageBtn = document.getElementById('add-package-btn');
    const addPackageModal = document.getElementById('add-package-modal');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const addPackageForm = document.getElementById('add-package-form');

    // Open Add Package Modal
    if (addPackageBtn) {
        addPackageBtn.addEventListener('click', () => {
            addPackageModal.style.display = 'block';
        });
    }

    // Close Add Package Modal
    if (cancelAddBtn) {
        cancelAddBtn.addEventListener('click', () => {
            addPackageModal.style.display = 'none';
        });
    }

    // Handle Adding New Package
    if (addPackageForm) {
        addPackageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('userToken');
            
            const formData = new FormData();
            formData.append('name', document.getElementById('add-package-name').value);
            formData.append('description', document.getElementById('add-package-description').value);
            formData.append('price', document.getElementById('add-package-price').value);
            formData.append('icon', document.getElementById('add-package-icon').files[0]);

            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/package`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    alert('Package added successfully!');
                    location.reload();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (err) {
                console.error(err);
                alert('Failed to add package');
            }
        });
    }

    // Navigate to Booking Page
    const bookNowBtn = document.getElementById('book-now-btn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', () => {
            window.location.href = './booking.html';
        });
    }

    // Logout and Menu Toggles
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