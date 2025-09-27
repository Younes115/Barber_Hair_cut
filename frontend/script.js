// Function called upon successful Google Sign-In
function onSignIn(response) {
    const id_token = response.credential;
    
    console.log("ID Token:", id_token);

    // Send the token to your server for verification
    fetch('/api/auth/google', {
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
        const response = await fetch('/config');
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

// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Define a hardcoded list of services for now
const services = [
  { id: '1', name: 'Groom Package', description: 'Includes full haircut, beard styling, facial, steam treatment, and premium care.', price: 500, icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
  { id: '2', name: 'Classic Haircut Package', description: 'Includes stylish haircut, beard trim, and hair wash with top-quality products.', price: 150, icon: 'https://cdn-icons-png.flaticon.com/512/3064/3064197.png' },
  { id: '3', name: 'Simple Haircut', description: 'A quick and professional haircut to refresh your look.', price: 100, icon: 'https://cdn-icons-png.flaticon.com/512/1000/1000624.png' },
  { id: '4', name: 'Beard Trim & Shape', description: 'Expert trimming and shaping to give your beard the perfect look.', price: 80, icon: 'https://cdn-icons-png.flaticon.com/512/912/912301.png' }
];

// Function to render the services on the package page
function renderPackages() {
    const packagesContainer = document.querySelector('.packages-container');
    if (!packagesContainer) return;

    packagesContainer.innerHTML = services.map(service => `
        <div class="package-box" data-id="${service.id}">
            <img src="${service.icon}" alt="${service.name} Icon" class="package-icon">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <p class="price">Price: ${service.price} EGP</p>
            <button class="btn add-to-cart-btn">Add to Cart</button>
        </div>
    `).join('');

    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const packageBox = event.target.closest('.package-box');
            const serviceId = packageBox.dataset.id;
            const serviceToAdd = services.find(s => s.id === serviceId);

            if (serviceToAdd) {
                addToCart(serviceToAdd);
            }
        });
    });

    // Add event listener for the "Book Now" button
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

// Function to add a service to the cart
function addToCart(service) {
    // Check if the service is already in the cart
    const existingService = cart.find(item => item.id === service.id);
    if (existingService) {
        alert(`${service.name} is already in your cart.`);
    } else {
        cart.push(service);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${service.name} added to cart!`);
        console.log('Current cart:', cart);
    }
}

// Function to render the cart on the booking page
function renderCart() {
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');

    if (!cartItemsList || !cartTotalPriceSpan) {
        return; 
    }

    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsList.innerHTML = ''; 

    let totalPrice = 0;
    if (currentCart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        currentCart.forEach(service => {
            const listItem = document.createElement('li');
            listItem.textContent = `${service.name} - ${service.price} EGP`;
            cartItemsList.appendChild(listItem);
            totalPrice += service.price;
        });
    }
    cartTotalPriceSpan.textContent = totalPrice;
}

// دالة لمعالجة إرسال نموذج الحجز
// دالة لمعالجة إرسال نموذج الحجز
async function handleBookingForm(event) {
    event.preventDefault(); // منع الإرسال الافتراضي للنموذج

    const form = document.getElementById('booking-form');
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const date = form.querySelector('#date').value;
    const time = form.querySelector('#time').value;
    const phone = form.querySelector('#phone').value;

    const token = localStorage.getItem('userToken'); // جلب التوكن من التخزين المحلي
    if (!token) {
        alert("Please log in to make a booking.");
        return;
    }

    // هنا يتم تعريف متغير services بشكل صحيح من localStorage
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
                'Authorization': `Bearer ${token}` // إرسال التوكن في العنوان
            },
            // تأكد من أن 'services' هنا هي نفس المتغير الذي تم تعريفه أعلاه
            body: JSON.stringify({ name, email, date, time, phone, services }), 
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message); // عرض رسالة نجاح
            form.reset(); // تفريغ النموذج بعد الحجز
            localStorage.removeItem('cart'); // Clear the cart after a successful booking
            cart = [];
            renderCart(); // Update the cart display
        } else {
            alert(`Error: ${result.message}`); // عرض رسالة خطأ
        }
    } catch (error) {
        console.error('Failed to submit booking:', error);
        alert('An error occurred. Please try again.');
    }
}

// Main DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    if (currentPage.endsWith('index.html') || currentPage === '/') {
        if (document.getElementById("google-login-button")) {
            initializeGoogleSignIn();
        }
    } else if (currentPage.endsWith('package.html')) {
        renderPackages();
    } else if (currentPage.endsWith('booking.html')) {
        const token = localStorage.getItem('userToken');
        if (!token) {
            alert('Please log in to view this page.');
            window.location.href = './index.html';
        } else {
            renderCart();
            const bookingForm = document.getElementById('booking-form');
            if (bookingForm) {
                bookingForm.addEventListener('submit', handleBookingForm);
            }
        }
    }
});