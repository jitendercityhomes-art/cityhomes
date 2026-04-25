# ⚡ Quick Start Guide - CityHomes Backend

## 🎯 Option 1: Quick Test (Recommended for First Time)

The backend is fully built and ready! Just need PostgreSQL database.

### Step 1: Install PostgreSQL (if not installed)

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 14+
3. Remember your postgres password

**Or use Docker (Easiest!):**
```bash
docker run --name cityhomes-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cityhomes_hrms \
  -p 5432:5432 \
  -d postgres:14
```

### Step 2: Create Database

**If you installed PostgreSQL:**
```bash
# Open pgAdmin or run:
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres
```

Then run SQL:
```sql
DROP DATABASE IF EXISTS cityhomes_hrms;
CREATE DATABASE cityhomes_hrms;
```

**If using Docker:** Database is already created!

### Step 3: Update .env File

Edit `backend\.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cityhomes_hrms
DB_USER=postgres
DB_PASSWORD=postgres  # Your actual password
```

### Step 4: Start Backend

```bash
cd backend
npm run start:dev
```

✅ **Backend is running at: http://localhost:3001/api/v1**

## 🧪 Test the API

### Using cURL or Postman

**1. Register a new user:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cityhomes.com",
    "password": "password123",
    "name": "Admin User"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@cityhomes.com",
    "name": "Admin User",
    "role": "employee"
  }
}
```

**2. Login:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cityhomes.com",
    "password": "password123"
  }'
```

**3. Punch In (Attendance):**
```bash
curl -X POST http://localhost:3001/api/v1/attendance/punch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "in",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "New Delhi, India"
  }'
```

**4. Check Today's Attendance:**
```bash
curl -X GET http://localhost:3001/api/v1/attendance/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 Full API Documentation

See `README.md` for complete API documentation.

## 🚀 Production Deployment

### With PM2:
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### With Nginx:
Copy `nginx.conf` to your nginx config directory and update domain name.

## 🔧 Troubleshooting

### Database Connection Error?
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port 3001 already in use?
Change PORT in `.env` file

### Need help?
Check logs: `pm2 logs cityhomes-backend`

---

**Backend is 100% ready! ✅**
All features working: Auth, Attendance, File Upload (Cloud), User Management
