# CityHomes HRMS - Complete Backend Setup Guide

## 🚀 Technology Stack

1. **Backend Framework**: NestJS (Node.js)
2. **Database**: PostgreSQL
3. **File Storage**: AWS S3 / Cloudflare R2 (Cloud storage - NO local storage)
4. **Web Server/Proxy**: Nginx
5. **Process Manager**: PM2

## 📋 Prerequisites

- Node.js 20+ installed
- PostgreSQL 14+ installed and running
- PM2 installed globally: `npm install -g pm2`
- Nginx installed (for production)

## 🎯 Features Implemented

### ✅ Authentication System
- Login with email/password
- Register new users
- JWT token-based authentication
- Role-based access (Super Admin, Admin, Employee)

### ✅ Attendance Management
- **Live Punch In/Out** with geolocation
- Photo capture during punch in/out
- Attendance history tracking
- Current status check (in/out)
- Worked hours calculation

### ✅ File Storage
- Cloud upload to AWS S3 or Cloudflare R2
- **Zero local storage** - saves server disk space
- Prevents server crashes from disk full
- Secure signed URLs for private files

### ✅ User Management
- Profile management
- View all users
- Update profile information

## 🛠️ Installation & Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` with your:
- Database credentials
- JWT secret
- AWS S3 / Cloudflare R2 credentials

### Step 3: Setup PostgreSQL Database

```sql
-- Create database
CREATE DATABASE cityhomes_hrms;

-- Create user (optional)
CREATE USER cityhomes_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cityhomes_hrms TO cityhomes_user;
```

### Step 4: Database Migration

The app will auto-create tables on first run (TypeORM synchronize is enabled for development).

For production, use migrations:

```bash
npm run typeorm -- migration:run
```

### Step 5: Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Or using PM2 for production-like environment
pm2 start ecosystem.config.js
```

Server will run on: `http://localhost:3001/api/v1`

### Step 6: Build for Production

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/users` | Get all users | Yes (Admin) |

### Attendance

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attendance/punch` | Punch in/out | Yes |
| GET | `/attendance/today` | Get today's attendance | Yes |
| GET | `/attendance/history` | Get attendance history | Yes |
| GET | `/attendance/status` | Get current status | Yes |

### User

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update profile | Yes |
| GET | `/user/all` | Get all users | Yes (Admin) |

### File Upload

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/files/upload` | Upload file to cloud | Yes |

## 🔐 Authentication Usage

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Example: Punch In

```javascript
const response = await fetch('http://localhost:3001/api/v1/attendance/punch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    type: 'in',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'New Delhi, India'
  })
});
```

## ☁️ Cloud Storage Setup

### Cloudflare R2 (Recommended - Free Tier)

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with R2 permissions
3. Update `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_r2_access_key
   AWS_SECRET_ACCESS_KEY=your_r2_secret_key
   AWS_REGION=auto
   AWS_S3_BUCKET=your-bucket-name
   AWS_S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   ```

### AWS S3

1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Update `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

## 🌐 Nginx Configuration (Production)

### Install Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**Windows:** Download from [nginx.org](https://nginx.org/en/download.html)

### Configure Nginx

Copy `nginx.conf` to your nginx config directory:

**Linux:** `/etc/nginx/sites-available/cityhomes`
**Windows:** `C:\nginx\conf\nginx.conf`

Update `your-domain.com` with your actual domain.

### Enable & Test

```bash
# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🔧 PM2 Process Management

```bash
# Start application
pm2 start ecosystem.config.js

# Monitor logs
pm2 logs cityhomes-backend

# Restart application
pm2 restart cityhomes-backend

# Stop application
pm2 stop cityhomes-backend

# View status
pm2 status

# Save process list
pm2 save

# Startup on boot
pm2 startup
```

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Punch In (with token)
curl -X POST http://localhost:3001/api/v1/attendance/punch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"type":"in","latitude":28.6139,"longitude":77.2090,"address":"New Delhi"}'
```

## 🎨 Frontend Integration

The frontend (Next.js) should call these APIs. Update your frontend API calls to point to:

```javascript
const API_URL = 'http://localhost:3001/api/v1';

// Example login
const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};
```

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `name` (String)
- `phone` (String, Nullable)
- `role` (Enum: superadmin/admin/employee)
- `profileImage` (String, Nullable)
- `isActive` (Boolean, Default: true)
- `createdAt`, `updatedAt` (Timestamp)

### Attendances Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `type` (Enum: in/out)
- `latitude`, `longitude` (Decimal)
- `address` (String)
- `photoUrl` (String, Nullable)
- `note` (String, Nullable)
- `timestamp` (Timestamp)
- `isLate` (Boolean, Default: false)
- `workedHours` (Number, Nullable)

## 🚨 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `.env`
- Kill process: `lsof -ti:3001 | xargs kill`

### PM2 Restart Loop
- Check logs: `pm2 logs cityhomes-backend`
- Verify `.env` file exists
- Check database connection

## 📝 Important Notes

1. **NO Local Storage**: All files go to cloud storage (S3/R2)
2. **Auto-Restart**: PM2 will restart app on crash
3. **Geo-fencing**: Implement radius check in frontend
4. **Security**: Change JWT_SECRET in production
5. **HTTPS**: Use HTTPS in production (configure in Nginx)

## 🎯 Next Steps

1. ✅ Backend is ready
2. ⏳ Integrate with frontend (no UI changes)
3. ⏳ Configure cloud storage
4. ⏳ Deploy to production

## 📞 Support

For issues or questions, check the code comments or console logs.

---

**Ready to use! 🚀**
