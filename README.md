# 🌍 GlobeTrotter

> **AI-powered personalized travel planning platform** built for the Odoo × LDCE Hackathon.

GlobeTrotter helps travelers **discover destinations, build multi-city itineraries, manage activities, estimate trip costs, visualize schedules, and share trips** from one place.

The project combines a modern React frontend with a Spring Boot backend, relational data models, JWT authentication, travel utilities, and an AI Trip Assistant.

---

## ✨ Highlights

- 🤖 **AI Trip Assistant** — generate personalized travel plans from destination, duration, budget, travelers, pace, and interests.
- 🗺️ **Multi-city trip planning** — organize trips into destinations/stops and activities.
- 🧳 **Itinerary Builder** — create and manage day-wise travel plans.
- 🔎 **City & Activity Search** — discover destinations and things to do.
- 💰 **Trip Budget** — estimate and visualize transportation, accommodation, food, activities, and other costs.
- 📅 **Trip Calendar / Timeline** — visualize the journey day by day.
- 🌤️ **Weather & travel utilities** — travel-oriented widgets and location functionality.
- 💱 **Currency support** — currency conversion utility for international planning.
- 👥 **Shared Trips** — share a read-only itinerary and copy shared plans.
- 🔐 **Authentication** — signup/login with JWT-based security.
- 👤 **User Profile** — manage profile information and saved travel data.
- 📊 **Admin Dashboard** — platform statistics and administration tools.
- 📱 **Responsive UI** — designed for desktop and mobile experiences.

---

## 🧠 AI Trip Assistant

The AI Trip Assistant is designed as a **travel-planning engine**, rather than a generic chatbot.

Users can provide:

- Destination
- Number of days
- Budget
- Number of travelers
- Travel style
- Trip pace
- Additional preferences

The assistant generates a structured travel plan containing:

- Trip overview
- Day-wise activities
- Estimated costs
- Budget breakdown
- Recommendations
- Travel warnings / planning suggestions

### Intended AI flow

```text
User Preferences
       ↓
React AI Trip Assistant
       ↓
Spring Boot API
       ↓
AI Service / Provider
       ↓
Structured Trip Response
       ↓
Validation
       ↓
Trip Preview
       ↓
Save to GlobeTrotter
       ↓
Trips → Stops → Activities
```

> **Security:** AI provider credentials should remain server-side and must never be committed to the repository or exposed to the browser.

---

## 🏗️ Architecture

```text
GlobeTrotter
│
├── Frontend
│   ├── React 19
│   ├── Vite
│   ├── React Router
│   ├── Framer Motion
│   ├── Recharts
│   └── Lucide React
│
└── Backend
    ├── Spring Boot 3.2
    ├── Spring Data JPA
    ├── Spring Security
    ├── JWT Authentication
    ├── MySQL / H2
    └── REST APIs
```

### Backend layers

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Core domain:

```text
User
  │
  └── Trip
        │
        └── Stop
              │
              └── TripActivity
                    │
                    └── Activity
                          │
                          └── City
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI |
| Vite | Frontend tooling |
| React Router | Routing |
| Tailwind/PostCSS | Styling |
| Framer Motion | Animations |
| Lucide React | Icons |
| Recharts | Charts |
| date-fns | Date handling |

### Backend

| Technology | Purpose |
|---|---|
| Java 17 | Backend language |
| Spring Boot 3.2 | Backend framework |
| Spring Web | REST APIs |
| Spring Data JPA | Persistence |
| Spring Security | Authentication & authorization |
| JWT | Token-based authentication |
| MySQL | Production relational database |
| H2 | Local/test database |
| Maven | Build system |

---

# 🚀 Getting Started

## Prerequisites

Install:

- **Node.js** 18+ recommended
- **npm**
- **Java 17**
- **Maven 3.8+**
- **MySQL** if using MySQL instead of the default local H2 configuration

Verify:

```bash
node --version
npm --version
java --version
mvn --version
```

---

## 📥 Clone the Repository

```bash
git clone https://github.com/AarnavRoy/ODOO-HAckathon-LD.git
cd ODOO-HAckathon-LD
```

---

# ⚙️ Frontend Setup

Install dependencies:

```bash
npm install
```

The frontend uses:

```text
VITE_API_BASE_URL
```

Create a local environment file if required:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> Never place private API keys in `VITE_*` variables. Vite exposes these values to the browser.

Run the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# ☕ Backend Setup

The backend is a Spring Boot application.

Build:

```bash
mvn clean package
```

Run:

```bash
mvn spring-boot:run
```

Backend API:

```text
http://localhost:8080/api
```

The project can use H2 for local development or MySQL through environment-based datasource configuration.

---

# 🗄️ Database Configuration

The application is configured to support a persistent local H2 database by default and can be configured for MySQL.

Example MySQL environment variables:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/globetrotter
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_DATASOURCE_DRIVER=com.mysql.cj.jdbc.Driver
```

Create the database before starting the backend if using MySQL:

```sql
CREATE DATABASE globetrotter;
```

> Do not commit database passwords, JWT secrets, or AI API keys.

---

# 🔐 JWT Configuration

The backend uses JWT authentication.

Example local configuration:

```env
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRATION_MS=86400000
```

Use a strong secret in real deployments.

---

# 🤖 AI API Configuration

If the AI Trip Assistant is configured to use an external AI provider, keep the provider key **only on the backend**.

Example:

```env
AI_API_KEY=your_api_key
AI_MODEL=your_model
```

Do not commit the real key.

Recommended:

```text
.env
.env.local
```

and verify that secrets are excluded by `.gitignore`.

---

# ▶️ Run the Full Application

The repository includes a unified startup script:

```bash
./start.sh
```

This starts:

```text
Spring Boot Backend → :8080
        +
Vite Frontend → :5173
```

Then open:

```text
http://localhost:5173
```

### Windows

If the Bash script is unavailable in your environment, run the services separately:

**Terminal 1**

```bash
mvn spring-boot:run
```

**Terminal 2**

```bash
npm run dev
```

---

# 🧭 Main Application Areas

| Area | Purpose |
|---|---|
| Dashboard | Overview, recent trips, recommendations and budget |
| AI Trip Assistant | AI-assisted trip generation |
| Create Trip | Create a new travel plan |
| My Trips | View and manage saved trips |
| Itinerary Builder | Add stops and activities |
| Itinerary View | Review the complete itinerary |
| City Search | Discover destinations |
| Activity Search | Discover activities |
| Trip Budget | Review estimated expenses |
| Trip Calendar | Visualize the itinerary |
| Shared View | Public/read-only trip sharing |
| Profile | User profile and preferences |
| Admin Dashboard | Platform administration and analytics |

---

# 🔌 API Structure

The frontend API layer is organized by feature:

```text
src/api/
├── activities.js
├── admin.js
├── ai.js
├── auth.js
├── budget.js
├── cities.js
├── client.js
├── location.js
├── stops.js
├── travel.js
└── trips.js
```

The backend follows a similar separation:

```text
controller/
service/
repository/
model/
dto/
security/
config/
```

This keeps frontend and backend responsibilities modular.

---

# 🧪 Testing

Run backend tests:

```bash
mvn test
```

The project includes integration testing for important application flows.

Frontend build:

```bash
npm run build
```

Frontend lint:

```bash
npm run lint
```

---

# 📁 Project Structure

```text
ODOO-HAckathon-LD/
│
├── public/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── src/main/java/com/globetrotter/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── loader/
│   ├── model/
│   ├── repository/
│   ├── security/
│   └── service/
│
├── src/main/resources/
│   ├── application.properties
│   └── data.sql
│
├── src/test/
│
├── package.json
├── pom.xml
├── start.sh
└── README.md
```

---

# 🔒 Security Notes

Before deploying:

- Never commit `.env` files containing secrets.
- Never expose AI provider keys through frontend environment variables.
- Use a strong JWT secret.
- Restrict CORS to trusted frontend origins.
- Protect admin endpoints with proper authorization.
- Validate ownership when users edit/delete trips.
- Validate all user and AI-generated input server-side.
- Do not expose stack traces or internal exceptions through API responses.

---

# 🎯 Hackathon Focus

GlobeTrotter is designed around the idea of making travel planning:

**Personalized → Intelligent → Structured → Collaborative**

The core experience is:

```text
Discover
   ↓
Plan
   ↓
Personalize with AI
   ↓
Build itinerary
   ↓
Calculate budget
   ↓
Visualize journey
   ↓
Share
```

---

# 🌟 Future Improvements

Potential extensions include:

- 🧭 Smart Trip Optimizer
- 👥 Collaborative group planning and voting
- 🧳 AI-generated packing lists
- 💸 Advanced expense splitting
- 🌦️ Weather-aware itinerary optimization
- 🚨 Schedule and trip-risk detection
- 🗺️ Route optimization
- ✨ Alternative Budget / Balanced / Premium trip versions
- 📸 AI travel memories and journals

---

## 👥 Team

**GlobeTrotter — Odoo × LDCE Hackathon**

Built with ❤️ for smarter travel planning.

---

## 📄 License

This project was created as a hackathon project.
