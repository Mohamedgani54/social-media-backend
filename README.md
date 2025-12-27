# Social Media Backend (Tasks 1–6)

This repository contains the **backend implementation** of a social media platform developed as part of an internship assignment.  
The project focuses on **API design, authentication, business logic, and database integration** using Node.js and MongoDB.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JWT, Email OTP  
- **Utilities:** Nodemailer, bcrypt  
- **Version Control:** Git & GitHub  

---

## 📂 Project Structure

social-media-backend/
│
├── server.js
├── package.json
├── .gitignore
│
├── models/
│ ├── User.js
│ ├── Post.js
│ └── Answer.js
│
├── routes/
│ ├── auth.js
│ ├── user.js
│ ├── post.js
│ ├── friend.js
│ ├── question.js
│ ├── answer.js
│ ├── points.js
│ ├── reward.js
│ ├── payment.js
│ └── language.js
│
├── middleware/
│ └── auth.js
│
└── src/utils/
├── generateOtp.js
├── passwordGenerator.js
├── postLimitHelper.js
├── rewardHelper.js
├── sendEmailOtp.js
├── sendSmsOtp.js
└── sendInvoiceEmail.js

---

## ✅ Implemented Tasks Overview

### Task 1 – Authentication & User Management
- User registration and login
- JWT-based authentication
- Email OTP for secure login
- Password hashing using bcrypt

### Task 2 – Forgot Password & OTP
- Forgot password via email OTP
- One request allowed per day
- Auto-generated password (uppercase + lowercase only)

### Task 3 – Public Posting Rules
- Users can post only if they have friends
- Daily posting limits based on friend count

### Task 4 – Friends & Social Connections
- Send and accept friend requests
- Friend-based access control

### Task 5 – Rewards & Points System
- Points earned for activities
- Reward calculation helpers
- Reward history tracking

### Task 6 – Payments & Language Support
- Payment-related API structure
- Language preference support
- Modular and extensible design

---

## 🔐 Environment Variables

Create a `.env.social` file in the root directory:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/social_app
JWT_SECRET=your_jwt_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

yaml
Copy code

---

## ▶️ How to Run the Project

```bash
npm install
node server.js
Server will start on:

arduino
Copy code
http://localhost:5000
🧪 API Testing
APIs tested using Postman

RESTful structure with proper status codes

📝 Notes
This is a backend-only submission

No frontend code included as per assignment scope

Code is modular and production-ready

👤 Author
Mohamed Gani
GitHub: https://github.com/Mohamedgani54
