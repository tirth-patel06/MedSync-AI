# Alchemist's Grimoire (Insight-X)

## 🧙‍♂️ Introduction

**Alchemist's Grimoire** is a modern solution to a timeless problem: medication adherence. A staggering 50% of medications for chronic diseases are not taken as prescribed, leading to severe health consequences. Our application tackles this by providing an intelligent, user-friendly platform for managing medications, tracking adherence, and gaining valuable health insights through AI-powered assistants.

This repository is a monorepo containing both the client-side (frontend) and server-side (backend) of the application.

---

## 🚀 Overall Project Flow

The application follows a classic client-server architecture. The user interacts with the React-based frontend, which makes API calls to the Express.js backend. The backend handles business logic, interacts with the MongoDB database, and communicates with external AI services.

Here's a simplified flow:

1.  **Authentication:** The user signs up or logs in. The backend verifies the credentials and returns a JWT token.
2.  **Dashboard:** The frontend uses the JWT token to fetch the user's medication schedule and adherence statistics from the backend.
3.  **Medication Management:** The user can add new medications. The frontend sends the medication details to the backend, which stores them in the database.
4.  **Notifications:** The backend includes a scheduler that creates and sends notifications to the user about upcoming or missed doses.
5.  **AI Agents:** The user can chat with various AI health assistants. The frontend sends the user's query to a specific backend endpoint, which then uses LangChain and a designated AI model (like Google's Generative AI or Groq) to generate a response.

---

## Client-Side

The client-side is a modern, responsive React application built with Vite. It provides a beautiful and intuitive interface for users to manage their health.

### ✨ Features

* **Secure Authentication:** JWT-based login and signup.
* **Intuitive Dashboard:** At-a-glance view of today's medication schedule, adherence rate, and streak.
* **Medication Management:** Easily add, view, and update medication schedules.
* **Smart Notifications:** A dedicated page to view all medication reminders and alerts.
* **AI-Powered Health Agents:** A multi-agent chat interface to interact with specialized AI assistants for medical knowledge, personal health tracking, medication information, and emergency triage.
* **Health Profile:** A section for users to manage their personal health information.

### 🛠️ Tech Stack

* **Framework:** React 19
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Routing:** React Router
* **HTTP Client:** Axios
* **Icons:** Lucide React
* **State Management:** React Context API (for medication and notification data)

### 🚀 Getting Started

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### 📂 Project Structure & Flow

The client-side is organized into pages, components, and contexts, following modern React best practices.

* `src/pages`: Contains the main views of the application, such as `Dashboard.jsx`, `Login.jsx`, `addMedication.jsx`, and `agents.jsx`.
* `src/components`: Contains reusable UI components like `ProtectedRoute.jsx` and `Navbar.jsx`.
* `src/context`: Manages the application's state.
    * `medicationContext.jsx`: Handles state related to medications, including adding new medications and fetching today's schedule.
    * `notificationContext.jsx`: Manages notification-related state and interactions with the notification API.
* `src/App.jsx`: The main application component that sets up the routing using `react-router-dom`.

The flow of the client application is as follows:

1.  The user lands on the `landingPage.jsx`, where they can either log in or sign up.
2.  Upon successful authentication, they are redirected to the `Dashboard.jsx`, which is a protected route.
3.  The `Dashboard.jsx` uses the `medicationContext` to fetch and display the user's medication for the day.
4.  From the dashboard, the user can navigate to other pages like `addMedication.jsx` to add a new medication, or `agents.jsx` to interact with the AI assistants.
5.  The `agents.jsx` page provides a seamless multi-agent chat experience, allowing the user to switch between different specialized AI models on the fly.

---

## Server-Side

The server-side is a robust Node.js and Express.js application that serves as the backbone of the Alchemist's Grimoire. It handles all the business logic, from user authentication to interacting with the AI models.

### ✨ Features

* **RESTful API:** A well-structured API for all frontend functionalities.
* **User Authentication:** Secure user registration and login using JWT.
* **Medication Management:** CRUD operations for medications.
* **Notification System:** A scheduler to create and manage user notifications for medication adherence.
* **AI Agent Integration:** A multi-agent system that leverages LangChain to interact with various large language models (LLMs) for different health-related queries.
* **Health Profile Management:** API endpoints for creating and updating user health profiles.
* **Reporting:** An endpoint to generate health reports (implementation details in `reportController.js`).

### 🛠️ Tech Stack

* **Framework:** Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** JSON Web Tokens (JWT), bcrypt.js
* **AI Integration:** LangChain, `@langchain/google-genai`, `@langchain/groq`
* **Real-time Notifications:** `node-notifier` (for local testing)
* **Environment Variables:** dotenv

### 🚀 Getting Started

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server will be running on `http://localhost:8080`.

### 📂 Project Structure & Flow

The server-side is organized by features into routes, controllers, models, and utility functions.

* `src/routes`: Defines the API endpoints. For example, `medicineRoutes.js` defines the routes for medication-related actions.
* `src/api`: Contains the controllers that handle the logic for each route. For instance, `addMedicineController.js` contains the logic for adding a new medication to the database.
* `src/models`: Defines the Mongoose schemas for the database collections (`User.js`, `medicineModel.js`, `HealthProfile.js`, etc.).
* `src/utils`: Contains utility functions, most notably the AI model handlers (`medical_model.js`, `emergency_model.js`, etc.). These files use LangChain to create prompts and interact with the LLMs.
* `src/middlewares`: Contains middleware functions, such as `authMiddleware.js` for verifying JWT tokens.
* `src/index.js`: The entry point of the server application.

The flow of the server application is as follows:

1.  A request comes in from the client to a specific endpoint (e.g., `/api/medicine/add`).
2.  The request is routed through `index.js` to the appropriate route file (e.g., `medicineRoutes.js`).
3.  The route file maps the endpoint to a controller function (e.g., `addMedication`).
4.  If the route is protected, the `authMiddleware` is called first to verify the user's JWT token.
5.  The controller function in the `api` directory then executes the business logic. This may involve validating the request body, interacting with the database through a Mongoose model, or calling a utility function (like an AI model handler).
6.  For AI-related requests, the controller calls one of the model handlers in the `utils` directory. This handler formats a prompt, sends it to the respective AI service (e.g., Groq), and receives the response.
7.  Finally, the controller sends a JSON response back to the client.
