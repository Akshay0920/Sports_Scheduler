# Sports Scheduler - Full Stack Capstone Project

This is a full-stack web application built as a capstone project. It allows users to sign up, create, and join sports sessions, with separate roles and permissions for regular players and administrators.

## Live Demo

You can view the live, deployed application here: **[Sport Scheduler](https://sport-scheduler-app.onrender.com)**
---

---

## Features

### Public & User Authentication
- **Professional UI:** A modern, two-column, full-screen interface for authentication with a custom theme and animations.
- **Secure Signup & Login:** Users can create an account and log in securely.
- **Session Management:** The application uses sessions to keep users logged in.
- **Password Visibility:** Users can toggle password visibility on all forms for a better UX.

### Player Features
- **Dashboard:** View a dynamic list of all available, upcoming sports sessions.
- **My Sessions:** Dedicated pages to view sessions the user has joined and sessions they have created.
- **Create Session:** A form to create a new session, choosing from available sports, and setting the venue, time, and number of players.
- **Join/Cancel Session:** Dynamic buttons on session cards allow users to join open sessions or cancel sessions they have created.
- **User Profile:** A tabbed profile page where users can update their name and change their password securely.
- **Advanced Validation:** The system prevents users from joining sessions that conflict with their existing schedule.

### Admin Features
- **Admin Role:** Admins have all the capabilities of a regular player.
- **Create Sports:** An admin-only page to add new sports to the platform.
- **Admin Dashboard:** A dedicated menu in the navbar for admin-specific actions.
- **View Reports:** A protected page where admins can generate reports on session counts and sport popularity within a selected date range.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Frontend:** EJS (Embedded JavaScript), Bootstrap 5
- **Authentication:** JWT for the backend API, Express Sessions for the server-rendered frontend.
- **Deployment:** Render

---


## Setup and Installation

Follow these steps to run the project locally.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Akshay0920/Sports_Scheduler
    cd sports-scheduler
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Database:**
    Make sure you have PostgreSQL installed and running. Create a new database for the project.

4.  **Set up your `.env` file:**
    Create a `.env` file in the root directory and add the following variables:
    ```
    # Secrets for JWT and sessions (use a random string generator)
    JWT_SECRET=your_jwt_secret_key_here
    SESSION_SECRET=your_session_secret_key_here
    ```
5.  **Configure the Database Connection:**
    Open the `config/config.json` file and update the `development` section with your local PostgreSQL credentials.

6.  **Run database migrations:**
    ```bash
    npx sequelize-cli db:migrate
    ```

7.  **Start the server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## Creating an Admin User
To use the admin features, you must manually promote a user.
1.  Sign up for a new user account through the application's UI.
2.  Connect to your database using a tool like `psql` or DBeaver.
3.  Run the following SQL command:
    ```sql
    UPDATE "Users" SET role = 'admin' WHERE email = 'your_user_email@example.com';
    ```
