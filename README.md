# Admin Panel – Premium Video Control Hub 🎛️

This is the **Admin Panel** for managing the [Architecture Video Learning Platform](https://github.com/AFA06/Arch_website_backend). It allows administrators to manage users, grant or revoke access to premium video courses, and handle platform moderation tasks.

---

## 🔧 Features

- 🔐 **Authentication** – Secure admin login.
- 👤 **User Management**
  - View all registered users
  - Add or delete users
  - Suspend or reactivate users
- 📦 **Course Access Control**
  - Grant users access to specific video categories (e.g., 3D Design, Figma, Direction)
  - Remove access at any time
- 🎬 **Video Category Management**
  - Upload videos and assign them to categories
  - Create, update, or delete course categories
- 🌍 **Multi-language Support**
  - English, Russian, and Uzbek

---

## 💻 Tech Stack

- **Frontend Framework**: React + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Routing**: React Router
- **State Management**: React Query
- **Design Pattern**: Modular & Component-based

---

## 📦 Setup & Development

```bash
# Clone the repo
git clone https://github.com/AFA06/premium-video-control-hub.git

# Navigate into the project
cd premium-video-control-hub

# Install dependencies
npm install

# Start the dev server
npm run dev
