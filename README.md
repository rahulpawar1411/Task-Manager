# Founders Activity Assignment

Assign private activities from founders to team members or other founders.  
Only the **assigner** and the **assignee** can see each activity.

## Stack

- **Backend:** PHP + MySQL
- **Frontend:** React (Vite)

## Setup

### 1. Database

1. Start MySQL (XAMPP / WAMP / local MySQL).
2. Import `database/schema.sql` (phpMyAdmin or CLI):

```bash
mysql -u root < database/schema.sql
```

3. If needed, edit DB credentials in `backend/config/database.php`.

### 2. Backend (PHP)

PHP is required. With XAMPP, use its PHP, or install PHP and enable `pdo_mysql`.

From the `backend` folder:

```bash
php -S localhost:8000 router.php
```

API base: `http://localhost:8000`

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`  
Vite proxies `/api` to `http://localhost:8000`.

## Demo logins

Password for all users: `password`

| Email | Role |
|-------|------|
| aarav@company.com | Founder |
| priya@company.com | Founder |
| rohan@company.com | Team Member |
| neha@company.com | Team Member |

## Features

- Founders assign activities (title, description, assignee, priority, due date)
- List shows only activities assigned **to you** or **by you**
- Detail view + status updates (Pending / In Progress / Completed)
- Completion date set automatically when status becomes Completed
- Team members cannot create assignments
