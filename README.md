# Laundry Service Management System - Moulali

A beginner-friendly mini project using HTML, CSS, JavaScript, PHP and MySQL.

## Features
- Add and view customers
- View washing, ironing and dry-cleaning services
- Create laundry orders
- Update order status (Pending, Processing, Ready, Completed)
- Record payments and view payment history
- Dashboard totals

## Database tables
1. `customers`: customer_id, name, phone, email, address
2. `services`: service_id, service_name, price_per_kg, description
3. `laundry_orders`: order_id, customer_id, service_id, clothes_weight, order_date, delivery_date, status
4. `payments`: payment_id, order_id, amount, payment_date, payment_method, status

## Requirements
- XAMPP (Apache, PHP and MySQL)
- Web browser

## Run locally
1. Install and open XAMPP. Start **Apache** and **MySQL**.
2. Copy this project folder into `C:/xampp/htdocs/`.
3. Open `http://localhost/phpmyadmin`.
4. Import `database.sql` using the Import tab.
5. If your MySQL username/password is different, edit the connection values at the top of `api.php`.
6. Open `http://localhost/Laundry_Service_Management_System_Moulali/`.

## GitHub upload
1. Sign in to GitHub and create a new repository named `laundry-service-management-system-moulali`.
2. Open the project folder in VS Code.
3. Open Terminal in that folder and run:

```bash
git init
git add .
git commit -m "Initial laundry management system project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/laundry-service-management-system-moulali.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Do not upload database passwords or private customer data.
