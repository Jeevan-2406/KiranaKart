<div align="center">
  <img src="assets/app-logo.png" alt="KiranaKart Logo" width="120" />

  # KiranaKart
  ### 🛒 A modern inventory + billing app for small retail shops
</div>

---

## 🚀 Getting Started

> **Note**: Ensure you've completed the official [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) before running the app.

---

## 🧱 Project Structure

```

KiranaKart/
├── assets/               # App logo and images
├── src/
│   ├── lib/              # Local storage utilities (AsyncStorage)
│   ├── components/       # Reusable components (e.g., BillModal)
│   └── screens/          # All screens (AllItems, Create, Cart, Account, etc.)
├── App.jsx               # Entry point
└── ...

````

---

## 🔧 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Jeevan-2406/KiranaKart.git
cd KiranaKart
````

2. **Install dependencies:**

```bash
npm install
# or
yarn
```

---

## ▶️ Running the App

### Start Metro

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
# or
yarn android
```

> iOS support is optional and requires macOS + Xcode.

---

## 📦 Features (v1.1.1)

* 🔍 **All Items View**

  * Search bar
  * Sort & filter by name, category, or stock level
  * Empty state messages when no results found

* 🧾 **Create Item Form**

  * Form validation
  * Unit suggestions
  * Minimum quantity configuration

* ⚠️ **Stock Warnings**

  * Color changing boxes for low stock items based on user-defined threshold

* 🛒 **Cart & Billing System**

  * Add/remove multiple items with plus/minus buttons
  * Real-time validation: cannot exceed available stock
  * Dynamic total price calculation
  * Custom **Bill Modal** with:

    * Itemized totals
    * Serial numbers
    * Timestamp
    * App branding
  * "Go to Cart" button appears conditionally

* 🗑️ **Delete Confirmation Modal**

  * Custom modal instead of default alert for safer UX

* 🧑 **Account Management**

  * Edit user info
  * Set preferences for:

    * Theme: Light, Dark, or System
    * Font size for accessibility
    * Minimum stock threshold

* 💾 **Data Persistence**

  * All inventory, settings, and cart data stored using AsyncStorage

---

## 📸 Screenshots

*Screenshots for All Items, Cart, and Bill Modal will be added soon.*

---

## 📁 GitHub Setup Tips

If you're setting up for the first time:

```bash
git remote add origin https://github.com/Jeevan-2406/KiranaKart.git
git branch -M main
git push -u origin main
```

---

## 📜 Changelog

### v1.1.1 – *Cart & Bill System Release*

* ➕ Cart screen with live stock validation
* 🧾 Custom bill generation modal (`BillModal.jsx`)
* 🛑 Delete confirmation modal for safe item deletion
* 📭 Empty state message in All Items
* 🎨 UI & UX polishing across all screens

---

## 🧠 Learn More

* [React Native Docs](https://reactnative.dev/docs/getting-started)
* [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
* [React Navigation](https://reactnavigation.org/)
* [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)

---

## 🛠️ Author

Made with ❤️ by **Jeevan Abhishek Jetti**

---

```

---
