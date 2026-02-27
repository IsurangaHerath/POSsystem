# MySQL Installation Guide for POS System

## Step 1: Download MySQL

1. Open your web browser and go to:
   ```
   https://dev.mysql.com/downloads/mysql/
   ```

2. Select your operating system:
   - **Windows** is usually auto-detected
   - Choose **Windows (x86, 64-bit), ZIP Archive** or **MySQL Installer**

3. Click **Download** button
   - You can skip the login/signup by clicking "No thanks, just start my download"

---

## Step 2: Install MySQL

### Option A: Using MySQL Installer (Recommended - Easier)

1. Run the downloaded `.msi` installer file

2. Choose **Developer Default** or **Server only** setup type

3. Click **Next** and follow the wizard

4. When asked for **MySQL Root Password**:
   - Enter a password you'll remember (e.g., `root123` or your own)
   - **IMPORTANT: Write this down!** You'll need it later

5. Complete the installation

6. MySQL should start automatically. If not:
   - Press `Win + R`, type `services.msc`
   - Find **MySQL** service and click **Start**

### Option B: Using ZIP Archive (Manual)

1. Extract the ZIP file to `C:\mysql`

2. Create a `my.ini` file in `C:\mysql\` with:
   ```ini
   [mysqld]
   basedir=C:/mysql
   datadir=C:/mysql/data
   ```

3. Initialize the database:
   ```cmd
   cd C:\mysql\bin
   mysqld --initialize --console
   ```

4. Install as Windows service:
   ```cmd
   mysqld --install MySQL
   net start MySQL
   ```

---

## Step 3: Verify MySQL Installation

Open Command Prompt and run:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p
```

Enter your root password when prompted.

If you see `mysql>` prompt, MySQL is installed correctly!

---

## Step 4: Create the POS Database

Once in MySQL, run these commands:

```sql
CREATE DATABASE pos_system;
SHOW DATABASES;
```

You should see `pos_system` in the list.

---

## Step 5: Run the Database Schema

1. Exit MySQL:
   ```sql
   exit;
   ```

2. Run the schema file:
   ```cmd
   cd c:\Users\CNN COMPUTERS\Desktop\POS
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p pos_system < database\schema.sql
   ```

   **OR** copy and paste the SQL from [`SQL_SCHEMA.md`](SQL_SCHEMA.md) into MySQL Workbench.

---

## Step 6: Insert Demo Data

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p pos_system < database\seed.sql
```

**OR** copy and paste the SQL from [`SEED_DATA.md`](SEED_DATA.md).

---

## Step 7: Configure the Backend

1. Create `.env` file in `backend` folder:
   ```env
   NODE_ENV=development
   PORT=5000
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=pos_system
   DB_USER=root
   DB_PASSWORD=YOUR_PASSWORD_HERE
   
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

2. Replace `YOUR_PASSWORD_HERE` with your MySQL root password

---

## Step 8: Install Dependencies and Run

```cmd
cd c:\Users\CNN COMPUTERS\Desktop\POS\backend
npm install
npm run dev
```

You should see:
```
Database connection established successfully
Server running on port 5000
```

---

## Troubleshooting

### "Access denied for user 'root'"
- Make sure you're using the correct password
- Try resetting the root password

### "Can't connect to MySQL server"
- Check if MySQL service is running:
  - Press `Win + R`, type `services.msc`
  - Find MySQL and click **Start**

### "Unknown database 'pos_system'"
- You forgot to create the database. Run:
  ```sql
  CREATE DATABASE pos_system;
  ```

### MySQL Installer not working
- Try the ZIP Archive method (Option B)
- Or use XAMPP which includes MySQL: https://www.apachefriends.org/

---

## Need More Help?

- MySQL Documentation: https://dev.mysql.com/doc/
- MySQL Tutorial: https://www.w3schools.com/mysql/
