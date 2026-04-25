# CityHomes HRMS — Next.js

Complete HR Management System for CityHomes Property Services, converted from single-file HTML to Next.js.

## Project Structure

```
cityhomes-hrms/
├── components/
│   └── App.js          # Full HRMS application (all components)
├── pages/
│   ├── _app.js         # Global CSS import
│   ├── _document.js    # HTML head (fonts, meta)
│   └── index.js        # Root page → renders App
├── styles/
│   └── globals.css     # All CSS variables, classes, animations
├── public/             # Static assets
├── next.config.js
└── package.json
```

## Setup & Run

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build
npm start
```

## Demo Credentials

| Role        | Email                    | Password  |
|-------------|--------------------------|-----------|
| Super Admin | admin@cityhomes.com      | admin123  |
| HR Manager  | hr@cityhomes.com         | hr123     |
| Employee    | aditi@cityhomes.com      | emp123    |
| Employee    | jitendra@cityhomes.com   | emp123    |

## Tech Stack

- **Next.js 14** — React framework with SSR/SSG
- **React 18** — UI library
- **CSS Variables** — Design system (no external CSS framework)
- **Inter Font** — Google Fonts

## Features

- 🔐 Role-based login (Super Admin, HR Manager, Employee)
- 📊 Dashboard with live attendance & stats
- 🕐 Attendance with selfie + geofence verification
- 📅 Holiday & Week-Off calendar (yearly)
- 💰 Payroll — attendance-based salary calculation
- 📄 Pay slip download (print-ready)
- 🏢 Branch management
- 📝 Leave requests (apply/approve/reject with notifications)
- 💸 Reimbursement with receipt upload & approval
- 🔔 Real-time employee notifications
- 📋 Activity log

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
```
