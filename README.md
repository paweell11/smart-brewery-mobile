# Smart Brewery Mobile 🍺

Smart Brewery Mobile is a comprehensive mobile application designed to monitor and manage the brewing process. The app visualizes data from various sensors, allowing users to track temperature, pH, mass, and environmental conditions to ensure the perfect brew.

## 🛠️ Tech Stack

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/)
[![React Native Paper](https://img.shields.io/badge/React_Native_Paper-6200EE?style=flat-square&logo=materialdesign&logoColor=white)](https://oss.callstack.com/react-native-paper/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query/latest/docs/framework/react/overview)
[![TanStack Form](https://img.shields.io/badge/TanStack_Form-FFC700?style=flat-square&logo=react&logoColor=black)](https://tanstack.com/form/latest/docs/overview)
[![Gifted Charts](https://img.shields.io/badge/Gifted_Charts-4B5563?style=flat-square)](https://gifted-charts.web.app/)

## 🎥 App Demo

See **Smart Brewery Mobile** in action! This video demonstrates the authentication flow, sensor monitoring, and chart interactions.

[**▶️ Watch the Video Demonstration**](https://www.dropbox.com/scl/fi/z63ksjkyc9tcl42gzvy7g/smart-brewery-mobile.mp4?rlkey=c8xk4umjxefqq55rjjdv96vai&st=mo2wnm14&dl=0)

> *Click the link above to watch the walkthrough.*

---

## 📱 UI & Features

The application architecture is divided into two primary zones based on the user's authentication status:

### 1. Unauthenticated Zone (Auth Flow)
This section handles user access and consists of two main screens:

* **Login Screen:**
    * Contains a functional form (Email and Password fields).
    * Includes a submission button and a navigation link to the Registration screen.
* **Registration Screen:**
    * Header button to navigate back to the Login screen.
    * Registration form (First Name, Last Name, Email, Password) with a submit button.

### 2. Authenticated Zone (Main App)
Once logged in, the user gains access to the main dashboard, divided into two subsections: **"Sensors"** and **"More"**.

#### A. Sensors Dashboard
This is the core of the application, designed to visualize measurement data. The presentation is unified across all sensor views:
* **Interactive Line Chart:** The main visual element driven by a control bar allowing the user to select the analysis period (**1 day, 3 days, 1 week, 2 weeks, or 4 weeks**) and toggle data types for multi-parameter modules.
* **Summary Section:** Located below the chart, displaying current numerical values and logical statuses (alerts if values are out of range).

**Available Sensor Modules:**

* **🌡️ Fermentation Temperature:**
    * Analyzes the correlation between conditions inside and outside the tank.
    * **Modes:** Comparative chart (both traces) or Differential chart (delta only).
    * Displays current readings for both sensors and the actual temperature difference.
* **🔥 Internal Temperature:**
    * Displays the key process parameter with safe range visualizations (min-max).
    * Automatically verifies process correctness.
    * **Status Panel:** Current temperature, status (Normal/Out of Range), and deviation from the nearest tolerance limit.
* **🧪 Fermentation pH:**
    * Visualizes solution acidity changes over time.
    * **Info Panel:** Current pH value and change dynamics over the last 24 hours (acidification rate).
* **⚖️ Wort Mass:**
    * Monitors fermentation progress based on mass loss.
    * **Visuals:** Chart showing total set weight.
    * **Data:** Current reading and mass balance compared to the measurement from 24 hours ago.
* **☁️ Environment (Humidity & Pressure):**
    * Aggregates environmental data.
    * **Toggle:** Switch chart between Atmospheric Pressure and Air Humidity.
    * **Summary:** Current values for both parameters and validation of optimal humidity range.

#### B. More (Settings & Profile)
This section allows for app personalization and account management:

* **Theme Selection:**
    * **Automatic:** Follows system settings.
    * **Light:** Forces light mode.
    * **Dark:** Forces dark mode.
* **Menu Options:**
    * **My Profile:** A form pre-filled with the logged-in user's data. All fields are editable; changes are saved via the "Save" button.
    * **About App:** Information screen regarding the application version and details.
    * **Logout:** Securely logs the user out of the application.

---

## 👥 Team & Contributions

### **Michał Lekstan**
* **Backend Communication:** Designed and implemented the communication layer. Initially explored JS WebSocket API (managing connection states), but later migrated to a full **HTTPS** solution.
* **API Integration:** Implemented **TanStack Query** and a custom class utilizing the JS Fetch API for robust data fetching.
* **Authentication & Security:**
    * Created Login and Registration forms.
    * Implemented secure storage of user **Access Tokens** using **SecureStore** (encrypted key-value storage that persists after app closure).
* **Profile Management:** Developed the "My Profile" screen with data editing logic.
* **Branding:** Created the application Logo (AI-assisted) and selected the color palette and icon set.

### **Paweł Kusz**
* **UI/UX Design:** Responsible for the visual layer and navigation logic of the application.
* **Architecture:** Defined the general app schema, view structure, and main screen division ("Sensors" vs. "More").
* **Dashboard Implementation:** Created dedicated tiles for individual sensors ensuring visual consistency.
* **Data Visualization:** Implemented interactive historical data visualization using the **Gifted Charts** library. Focus on readability of line charts and user interaction with time ranges.
