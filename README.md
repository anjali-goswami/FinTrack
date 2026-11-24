# 💰 FinTrack – Expense Tracker & Budget Management System

FinTrack is a personal expense tracking and budget management application designed to help users manage their daily expenses, create budgets, monitor spending habits, and maintain better control over their finances.

The application provides an intuitive dashboard, budget tracking, expense management, and visual financial reports to help users understand where their money goes.

## ✨ Features

### 📊 Dashboard
- View total budget.
- Monitor total expenses.
- Track remaining budget.
- View active budgets.
- Visualize spending trends.
- Get an overview of financial activity.

### 💳 Expense Management
- Add new expenses.
- Edit existing expenses.
- Delete expenses.
- Categorize expenses.
- Search and filter transactions.
- Associate expenses with specific budgets.

### 🎯 Budget Management
- Create custom budgets.
- Set spending limits.
- Edit and delete budgets.
- Monitor budget utilization.
- Track remaining budget.
- Receive overspending alerts.
- View spending progress through visual indicators.

### 📈 Reports & Analytics
- Category-wise expense breakdown.
- Monthly spending trends.
- Budget utilization reports.
- Visual charts and graphs.
- Identify high-spending categories.

### 🔐 User Authentication
- User registration.
- User login.
- Secure password handling.
- User-specific financial data.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS
- React Router DOM
- Recharts
- Axios

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB
- Mongoose

**Authentication & Security**
- JWT
- bcryptjs
- dotenv

**Development Tools**
- Visual Studio Code
- Postman
- Git
- GitHub

## 📁 Project Structure

```text
FinTrack/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

*The folder structure may evolve as backend development progresses.*

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anjali-goswami/FinTrack.git
```

### 2. Navigate to the Project

```bash
cd FinTrack
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will generally run at:

```text
http://localhost:5173
```

### 4. Backend Setup

Open another terminal:

```bash
cd server
npm install
```

Create a `.env` file inside the server directory.

Add your own configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

The backend will generally run at:

```text
http://localhost:5000
```

## 🧮 Budget Calculation

FinTrack uses the following calculations:

**Total Budget**

Sum of all created budget limits.

**Total Spent**

Sum of expenses assigned to budgets.

**Remaining Budget**

```text
Remaining Budget = Total Budget - Total Spent
```

**Budget Utilization**

```text
Budget Utilization = (Amount Spent / Budget Limit) × 100
```

Each expense is associated with its selected budget so that spending is calculated accurately.

## 🔒 Security

- Environment variables are stored in `.env`.
- Sensitive credentials should never be committed to GitHub.
- Passwords should be hashed before database storage.
- Protected API routes should require valid authentication.

## 🚀 Future Enhancements

- Advanced spending analytics.
- Recurring expense tracking.
- Downloadable financial reports.
- Expense reminders.
- Budget recommendations.
- Improved mobile experience.

## 👩‍💻 Author

**Anjali Goswami**

GitHub: https://github.com/anjali-goswami

## 📄 License

This project is developed for educational and portfolio purposes.
