# How to Run the POS System - Step by Step Guide

## Quick Start (Backend Only)

The backend server is already running. Here's how to start it yourself:

### Step 1: Open Terminal

Open Command Prompt or PowerShell in the project folder:
```
c:\Users\CNN COMPUTERS\Desktop\POS
```

### Step 2: Navigate to Backend Folder

```cmd
cd backend
```

### Step 3: Start the Server

```cmd
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════════════╗
║                    POS System Backend Server                    ║
╠════════════════════════════════════════════════════════════════╣
║  Environment: development                                       ║
║  Port:        5000                                              ║
║  URL:         http://localhost:5000                             ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Testing the API

### Option 1: Using Browser

Open your browser and go to:
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api/docs

### Option 2: Using Postman

1. Download Postman from: https://www.postman.com/downloads/
2. Create a new request:
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
   ```json
   {
       "username": "admin",
       "password": "password123"
   }
   ```
3. Click Send - you should receive a token

### Option 3: Using curl (Command Line)

```cmd
curl http://localhost:5000/api/health
```

Login test:
```cmd
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"password123\"}"
```

---

## Full Setup (If Starting Fresh)

If you need to set up everything from scratch:

### Step 1: Ensure MySQL is Running

```cmd
sc query MySQL96
```

If not running:
```cmd
net start MySQL96
```

### Step 2: Create Database (if not exists)

```cmd
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql" -u root -psql.1234 -e "CREATE DATABASE IF NOT EXISTS pos_system;"
```

### Step 3: Run Schema

```cmd
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql" -u root -psql.1234 pos_system < database\schema.sql
```

### Step 4: Run Seed Data

```cmd
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql" -u root -psql.1234 pos_system < database\seed.sql
```

### Step 5: Install Dependencies

```cmd
cd backend
npm install
```

### Step 6: Start Server

```cmd
npm run dev
```

---

## Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Admin (full access) |
| manager | password123 | Manager (limited access) |
| cashier | password123 | Cashier (basic access) |

---

## Available API Endpoints

### Public Endpoints (No Login Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/docs` | API documentation |
| POST | `/api/auth/login` | User login |

### Protected Endpoints (Login Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/products` | List all products |
| GET | `/api/categories` | List categories |
| GET | `/api/sales` | List sales |
| GET | `/api/inventory` | View inventory |
| GET | `/api/suppliers` | List suppliers |
| GET | `/api/reports` | View reports |
| GET | `/api/dashboard` | Dashboard stats |

### Using Protected Endpoints

1. First, login to get a token:
   ```cmd
   curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"password123\"}"
   ```

2. Copy the `accessToken` from the response

3. Use the token in your request:
   ```cmd
   curl http://localhost:5000/api/users -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Troubleshooting

### "Port 5000 already in use"
The server is already running. Check:
```cmd
netstat -ano | findstr :5000
```

### "Cannot connect to database"
1. Check MySQL is running:
   ```cmd
   sc query MySQL96
   ```
2. Check your password in `backend\.env`

### "Module not found"
Reinstall dependencies:
```cmd
cd backend
npm install
```

### "Access denied for user 'root'"
Update the password in `backend\.env`:
```
DB_PASSWORD=your_correct_password
```

---

## Project Files Overview

```
POS/
├── backend/
│   ├── .env              # Your database config (already created)
│   ├── server.js         # Start the server
│   └── src/
│       ├── routes/       # API endpoints
│       ├── controllers/  # Business logic
│       └── models/       # Database models
│
├── database/
│   ├── schema.sql        # Database tables (already run)
│   └── seed.sql          # Demo data (already run)
│
└── docs/
    ├── QUICK_START.md    # Quick start guide
    └── MYSQL_INSTALLATION.md  # MySQL setup
```

---

## Next Steps

1. **Test the API** using the endpoints above
2. **Build the Frontend** (React + Electron) - not yet created
3. **Add more features** as needed

The backend is fully functional and ready to use!
