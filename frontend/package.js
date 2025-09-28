// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// دالة لمعالجة تسجيل الخروج
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

// Function to fetch packages from the database
async function fetchPackages() {
    try {
        const response = await fetch('https://barberhaircut-production.up.railway.app/api/packages');
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

// Function to add a service to the cart
function addToCart(service) {
    const existingService = cart.find(item => item._id === service._id);
    if (existingService) {
        alert(`${service.name} is already in your cart.`);
    } else {
        cart.push(service);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${service.name} added to cart!`);
        console.log('Current cart:', cart);
    }
}

// Function to render packages on the page
function renderPackages(packages, isAdmin) {
    const packagesContainer = document.querySelector('.packages-container');
    if (!packagesContainer) return;
    packagesContainer.innerHTML = '';
    
    packages.forEach(service => {
        const packageBox = document.createElement('div');
        packageBox.className = 'package-box';
        packageBox.dataset.id = service._id;
        packageBox.innerHTML = `
          <img src="https://barberhaircut-production.up.railway.app/${service.icon}" alt="${service.name} Icon" class="package-icon">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <p class="price">Price: ${service.price} EGP</p>
            <button class="btn add-to-cart-btn">Add to Cart</button>
        `;

        if (isAdmin) {
            const adminControls = document.createElement('div');
            adminControls.innerHTML = `
                <button class="btn edit-package-btn" data-id="${service._id}">Edit</button>
                <button class="btn delete-package-btn" data-id="${service._id}">Delete</button>
            `;
            packageBox.appendChild(adminControls);
        }

        packagesContainer.appendChild(packageBox);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const packageBox = event.target.closest('.package-box');
            const serviceId = packageBox.dataset.id;
            const serviceToAdd = packages.find(s => s._id === serviceId);
            if (serviceToAdd) addToCart(serviceToAdd);
        });
    });

    if (isAdmin) {
        document.getElementById('admin-package-controls').style.display = 'block';
        
        document.querySelectorAll('.edit-package-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const serviceId = event.target.dataset.id;
                const packageToEdit = packages.find(p => p._id === serviceId);
                showEditModal(packageToEdit);
            });
        });

        document.querySelectorAll('.delete-package-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const serviceId = event.target.dataset.id;
                if (confirm('Are you sure you want to delete this package?')) {
                    handleDeletePackage(serviceId);
                }
            });
        });
        
        document.getElementById('add-package-btn').addEventListener('click', () => {
            document.getElementById('add-package-modal').style.display = 'flex';
        });

        document.getElementById('cancel-add-btn').addEventListener('click', () => {
            document.getElementById('add-package-modal').style.display = 'none';
        });

        document.getElementById('add-package-form').addEventListener('submit', handleAddPackage);
        document.getElementById('edit-package-form').addEventListener('submit', handleEditPackage);
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-package-modal').style.display = 'none';
        });
    }

    const bookNowBtn = document.getElementById('book-now-btn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = './booking.html';
            } else {
                alert("Your cart is empty. Please add services first.");
            }
        });
    }
}

// Show and fill the edit modal
function showEditModal(packageToEdit) {
    const modal = document.getElementById('edit-package-modal');
    modal.style.display = 'flex';
    document.getElementById('edit-package-id').value = packageToEdit._id;
    document.getElementById('edit-package-name').value = packageToEdit.name;
    document.getElementById('edit-package-description').value = packageToEdit.description;
    document.getElementById('edit-package-price').value = packageToEdit.price;
    document.getElementById('edit-package-icon').value = packageToEdit.icon;
}

// Function to handle the form submission for adding a new package
async function handleAddPackage(event) {
    event.preventDefault();
    const form = document.getElementById('add-package-form');
    const name = form.querySelector('#add-package-name').value;
    const description = form.querySelector('#add-package-description').value;
    const price = form.querySelector('#add-package-price').value;
    const iconFile = form.querySelector('#add-package-icon').files[0];

    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("You must be logged in as an admin to add a package.");
        return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('icon', iconFile);

    try {
        const response = await fetch('https://barberhaircut-production.up.railway.app/api/admin/package', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            alert("Package added successfully!");
            form.reset();
            document.getElementById('add-package-modal').style.display = 'none';
            fetchPackages();
        } else {
            const error = await response.json();
            alert(`Error adding package: ${error.message}`);
        }
    } catch (error) {
        console.error('Failed to add package:', error);
        alert('An error occurred. Please try again.');
    }
}
// Function to handle the form submission for editing a package
async function handleEditPackage(event) {
    event.preventDefault();
    const form = document.getElementById('edit-package-form');
    const id = form.querySelector('#edit-package-id').value;
    const name = form.querySelector('#edit-package-name').value;
    const description = form.querySelector('#edit-package-description').value;
    const price = form.querySelector('#edit-package-price').value;
    const icon = form.querySelector('#edit-package-icon').value;

    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("You must be logged in as an admin to edit a package.");
        return;
    }

    try {
       const response = await fetch(`https://barberhaircut-production.up.railway.app/api/admin/package/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, price, icon })
        });

        if (response.ok) {
            alert("Package updated successfully!");
            document.getElementById('edit-package-modal').style.display = 'none';
            fetchPackages();
        } else {
            const error = await response.json();
            alert(`Error updating package: ${error.message}`);
        }
    } catch (error) {
        console.error('Failed to update package:', error);
        alert('An error occurred. Please try again.');
    }
}

// Function to handle deleting a package
async function handleDeletePackage(id) {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("You must be logged in as an admin to delete a package.");
        return;
    }

    try {
       const response = await fetch(`https://barberhaircut-production.up.railway.app/api/admin/package/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Package deleted successfully!");
            fetchPackages();
        } else {
            const error = await response.json();
            alert(`Error deleting package: ${error.message}`);
        }
    } catch (error) {
        console.error('Failed to delete package:', error);
        alert('An error occurred. Please try again.');
    }
}

// Function to check user role and display admin buttons
async function checkAdminStatus() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        return false;
    }

    try {
        const response = await fetch('https://barberhaircut-production.up.railway.app/api/auth/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        
        if (response.ok && user && user.role === 'admin') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Failed to check admin status:", error);
        return false;
    }
}
// Main DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    fetchPackages(); // Fetch packages from the database on page load
    checkLoginStatus(); // التحقق عند تحميل الصفحة
    
    // 1. ربط زر تسجيل الخروج
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // 2. تفعيل قائمة الهمبرغر
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('#navbar ul');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
});