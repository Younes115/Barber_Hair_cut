
const API_BASE_URL = '';

// Function to render the cart on the booking page
function renderCart() {
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    if (!cartItemsList || !cartTotalPriceSpan) return;

    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsList.innerHTML = '';
    let totalPrice = 0;
    
    if (currentCart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        currentCart.forEach(service => {
            const listItem = document.createElement('li');
            listItem.textContent = `${service.name} - ${service.price} EGP`;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-btn';
            removeBtn.dataset.serviceId = service._id; 
            listItem.appendChild(removeBtn);
            cartItemsList.appendChild(listItem);
            totalPrice += service.price;
        });
    }
    cartTotalPriceSpan.textContent = totalPrice;

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const serviceId = event.target.dataset.serviceId;
            removeFromCart(serviceId);
        });
    });
}

function removeFromCart(serviceId) {
    let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    currentCart = currentCart.filter(item => item._id !== serviceId);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    renderCart();
}

function generateTimeOptions() {
    const timeSelect = document.getElementById('time');
    if (!timeSelect) return;
    timeSelect.innerHTML = '';
    for (let hour = 10; hour <= 22; hour++) {
        const timeValue = `${hour}:00`;
        const option = document.createElement('option');
        option.value = timeValue;
        option.textContent = timeValue;
        timeSelect.appendChild(option);
    }
}


async function handleBookingForm(event) {
    event.preventDefault();

    const token = localStorage.getItem('userToken');
    if (!token) {
        alert('You must be logged in to book.');
        return;
    }

    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (currentCart.length === 0) {
        alert('Your cart is empty. Please add services before booking.');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    // Client-side validation helpers
    if (!name || name.length < 2) {
        alert('Please enter your name (at least 2 characters).');
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    if (!phone || !/^\d{8,15}$/.test(phone)) {
        alert('Phone must contain only digits (8-15 digits). No spaces, dashes, or +.');
        return;
    }
    if (!date) {
        alert('Please select a date.');
        return;
    }

    const bookingData = {
        name,
        email,
        phone,
        date,
        time,
        services: currentCart.map(item => ({ name: item.name, price: item.price })),
        totalPrice: parseFloat(document.getElementById('cart-total-price').textContent)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Booking successful!');
            localStorage.removeItem('cart');
            window.location.href = './index.html';
        } else {
            // Show field-level validation errors if available
            if (data.errors && Array.isArray(data.errors)) {
                const details = data.errors.map(e => `• ${e.field}: ${e.message}`).join('\n');
                alert(`Booking failed:\n${details}`);
            } else {
                alert(`Booking failed: ${data.message || 'Unknown error'}`);
            }
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('An error occurred. Please try again later.');
    }
}

function logout() {
    localStorage.removeItem('userToken');
    alert('Logged out successfully!');
    window.location.href = './index.html';
}

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
    if (!checkLoginStatus()) {
        alert('Please log in to view this page.');
        window.location.href = './index.html';
        return;
    }

    renderCart();
    generateTimeOptions();

    // Set date input min to today to prevent past dates
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingForm);
    }

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