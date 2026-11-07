# BookMe – Full-Stack Appointment Booking Platform

A full-stack appointment booking platform built using the MERN stack, designed to connect service providers with customers through a seamless booking and payment experience.

🌐 **Live Demo:** [BookMe Frontend](https://book-me-frontend-two.vercel.app/)

🔗 **Backend:** [BookMe Backend](https://book-me-backend-ten.vercel.app/)

💻 **Repository:** [GitHub](https://github.com/mathewjebis/BookMe)

---

## 🚀 Features

### 👤 Authentication & User Management
- User registration with OTP verification.
- Secure login using JWT authentication.
- Password hashing with bcrypt.
- Protected routes and role-based access.
- Profile management.

### 📅 Appointment Management
- Service creation and management.
- Provider availability management.
- Appointment booking and rescheduling.
- Booking cancellation and status tracking.
- Server-side validation.

### 💳 Payment & Wallet
- Stripe payment integration.
- Payment status verification.
- Provider wallet management.
- Transaction history.
- Payout and withdrawal workflows.

### 📆 Google Calendar Integration
- Google OAuth authentication.
- Google Calendar connectivity.
- Booking-related calendar workflows.

### 🛠️ Admin Dashboard
- User and booking management.
- Payment and revenue monitoring.
- Wallet and transaction monitoring.
- Withdrawal management.

---

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt, OTP |
| Payments | Stripe |
| Integrations | Google OAuth, Google Calendar API |
| Deployment | Vercel |
| Tools | Git, GitHub, Postman |

---

## 📂 Project Structure

```text
BookMe/
│
├── backend/
│   └── Node.js & Express API
│
├── frontend/
│   └── React.js Application
│
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mathewjebis/BookMe.git
```

### 2. Navigate into the project

```bash
cd BookMe
```

### 3. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Configure the required environment variables for MongoDB, authentication, Stripe and Google integrations before starting the backend.

### 4. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend environment variables required to connect to the backend.

---

## 🌍 Deployment

Both frontend and backend are deployed using Vercel.

- **Frontend:** https://book-me-frontend-two.vercel.app/
- **Backend:** https://book-me-backend-ten.vercel.app/

---

## 👨‍💻 Developer

**S. Mathew Jebis**

MERN Stack Developer

- GitHub: [@mathewjebis](https://github.com/mathewjebis)
- LinkedIn: [S. Mathew Jebis](https://www.linkedin.com/in/mathew-jebis-8353b4313/)

---

⭐ If you find this project interesting, consider giving it a star!
