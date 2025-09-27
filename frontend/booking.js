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
            removeBtn.dataset.serviceId = service._id; // استخدم _id للباكدجات من قاعدة البيانات
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

// Function to remove a service from the cart
function removeFromCart(serviceId) {
    let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    currentCart = currentCart.filter(service => service._id !== serviceId);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    renderCart();
}

// Function to handle the booking form submission
async function handleBookingForm(event) {
    event.preventDefault();
    const form = document.getElementById('booking-form');
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const date = form.querySelector('#date').value;
    const time = form.querySelector('#time').value;
    const phone = form.querySelector('#phone').value;
    const token = localStorage.getItem('userToken');

    if (!token) {
        alert("Please log in to make a booking.");
        return;
    }
    const services = JSON.parse(localStorage.getItem('cart')) || [];
    if (services.length === 0) {
        alert("Your cart is empty. Please add services before booking.");
        return;
    }

    try {
        const response = await fetch('/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, date, time, phone, services }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            form.reset();
            localStorage.removeItem('cart');
            renderCart();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Failed to submit booking:', error);
        alert('An error occurred. Please try again.');
    }
}

// Function to generate time options for the dropdown
function generateTimeOptions() {
    const timeSelect = document.getElementById('time');
    if (!timeSelect) return;

    timeSelect.innerHTML = '';
    const startHour = 10;
    const endHour = 26; // 2 AM of the next day (24 + 2)
    const interval = 30;

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += interval) {
            let displayHour = h;
            const period = h >= 12 && h < 24 ? 'PM' : 'AM';
            
            if (displayHour > 12) {
                displayHour -= 12;
            } else if (displayHour === 0 || displayHour === 24) {
                displayHour = 12;
            }

            const minute = String(m).padStart(2, '0');
            const displayTime = `${displayHour}:${minute} ${period}`;
            const valueTime = `${String(h % 24).padStart(2, '0')}:${minute}`;
            
            const option = document.createElement('option');
            option.value = valueTime;
            option.textContent = displayTime;
            timeSelect.appendChild(option);
        }
    }
}

// Main DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert('Please log in to view this page.');
        window.location.href = './index.html';
    } else {
        renderCart();
        generateTimeOptions();
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBookingForm);
        }
    }
});