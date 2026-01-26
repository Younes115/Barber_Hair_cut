
# ✂️ Barber Shop Booking System

A full-stack web application designed for a Barber Shop to manage appointments, services, and customer interactions. This system allows customers to view hairstyles, choose service packages, and book appointments online using Google Authentication. It also features a robust Admin Dashboard for managing bookings and services.

## 🚀 Features

### User Features (Frontend)
* **User Authentication:** Secure login using **Google OAuth 2.0**.
* **Service Catalog:** View available haircut packages and prices.
* **Gallery:** Browse a photo gallery of hairstyles.
* **Booking System:** * Add multiple services to a cart.
    * Select date and time slots (with validation to prevent overbooking).
    * Receive booking confirmation.
* **Responsive Design:** Optimized for Desktop, Tablet, and Mobile devices.

### Admin Features (Backend & Protected Routes)
* **Admin Dashboard:** View "Today's Bookings" to manage the daily schedule.
* **Package Management:** * Add new service packages with icons/images.
    * Edit existing packages (price, description, image).
    * Delete packages.
* **Role-Based Access Control:** Middleware ensures only authorized admins can access sensitive endpoints.

## 🛠️ Tech Stack

### Backend
* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) (using Mongoose ODM)
* **Authentication:** Google Auth Library, JSON Web Tokens (JWT)
* **Image Handling:** Multer (for uploading service icons)

### Frontend
* **Languages:** HTML5, CSS3, JavaScript (Vanilla ES6+)
* **Styling:** Custom CSS with Flexbox and Grid layouts.
* **Auth Integration:** Google Identity Services.

## 📂 Project Structure

```text
├── controller/         # Logic for handling API requests (Packages)
├── middleware/         # Auth verification and Admin checks
├── model/              # Mongoose schemas (User, Booking, Package)
├── routers/            # API Route definitions (Auth, Admin, Book)
├── frontend/           # Client-side static files (HTML, CSS, JS)
├── uploads/            # Directory for storing uploaded images
├── server.js           # Entry point of the application
└── .env                # Environment variables

```

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone [https://github.com/Younes115/barber-shop-booking.git](https://github.com/Younes115/barber-shop-booking.git)
cd barber-shop-booking

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Configuration

Create a `.env` file in the root directory and add the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_for_jwt
GOOGLE_CLIENT_ID=your_google_cloud_client_id
ADMIN_EMAIL=admin@example.com

```

*Note: The `ADMIN_EMAIL` is used to automatically assign the Admin role to a specific Google account upon login.*

### 4. Run the Server

```bash
npm start
# OR for development with nodemon
npm run dev

```

The server will start at `http://localhost:3000`.


## 📝 Configuration Note for Frontend

Currently, the frontend JavaScript files fetch data from the production URL (`https://barberhaircut-production.up.railway.app`).

If running locally, search for this URL in `frontend/*.js` and replace it with:
`http://localhost:3000`

## 🛡️ Security

* **CORS:** Enabled to allow cross-origin requests.
* **Input Validation:** Checks for required fields before processing bookings or packages.
* **JWT Protection:** Protected routes verify the token signature and expiration.



