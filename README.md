# MaaFusion

> **Timeless Heritage. Digital Fusion.**
>
> *Where the warmth of a mother’s blessing meets the precision of modern design. Inspired by the legacy of Geeta & Jashi.*

## Overview

**MaaFusion** is a modern, full-stack web application designed to showcase products and manage customer inquiries with a seamless user experience. Built with performance and scalability in mind, it leverages the power of **React**, **TypeScript**, and **Supabase** to deliver a responsive public-facing portfolio and a robust private admin dashboard.

## Key Features

### Modern User Experience
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop using **Tailwind CSS**.
- **Component Library**: Utilizes **shadcn/ui** for accessible, customizable, and consistent UI components.
- **Animations**: Smooth transitions and engaging animations powered by `tailwindcss-animate`.

### Authentication & Security
- **Secure Login**: Robust authentication system integrated with **Supabase Auth**.
- **Session Management**: Custom "Remember Me" functionality with secure storage handling (Local/Session Storage).
- **Protected Routes**: Role-based access control ensuring the Admin Dashboard is accessible only to authorized users.

### Admin Dashboard
- **Dashboard Overview**: Centralized hub for site management.
- **Product Management**: 
    - **Add Products**: Form-based product creation with validation.
    - **Manage Products**: List view with capabilities to edit or delete existing inventory.
- **Inquiry System**: View and manage customer inquiries submitted through the contact form.

### Core Functionality
- **Contact Form**: Integrated inquiry form validated with **React Hook Form** and **Zod**.
- **Gallery**: Visual showcase implemented with optimized image handling.
- **Dynamic Content**: Data fetching and caching managed by **React Query (@tanstack/react-query)** for a snappy feel.

## Tech Stack

### Frontend Core
- **[React](https://react.dev/)**: 18.x - The library for web and native user interfaces.
- **[Vite](https://vitejs.dev/)**: Next Generation Frontend Tooling.
- **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed JavaScript.

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.
- **[shadcn/ui](https://ui.shadcn.com/)**: Beautifully designed components built with Radix UI and Tailwind CSS.
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icons.
- **[Recharts](https://recharts.org/)**: Redefined chart library built with React and D3.

### State & Data Management
- **[TanStack Query](https://tanstack.com/query/latest)**: Powerful asynchronous state management.
- **[Supabase](https://supabase.com/)**: The open source Firebase alternative (Database, Auth).
- **[React Hook Form](https://react-hook-form.com/)**: Performant, flexible and extensible forms with **Zod** validation.

### Routing
- **[React Router](https://reactrouter.com/)**: Declarative routing for React web applications.

## Project Structure

```bash
src/
├── components/         # React components
│   ├── home/           # Homepage specific sections (Hero, Features, etc.)
│   ├── layout/         # Layout components (Navbar, Footer)
│   └── ui/             # Reusable UI primitives (Buttons, Inputs, Modals)
├── data/               # Static data files
├── hooks/              # Custom React hooks (useAuth, useToast, etc.)
├── lib/                # Utilities and configuration
│   ├── supabaseClient.ts # Supabase client initialization
│   └── utils.ts        # Helper functions
├── pages/              # Application Route Components (Views)
│   ├── Admin*.tsx      # Admin Dashboard pages
│   ├── Auth.tsx        # Login/Authentication page
│   └── Index.tsx       # Landing page
├── App.tsx             # Main Application component with Routing
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites
- **Node.js**: v18 or higher is recommended.
- **npm** or **yarn** or **pnpm**.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/maafusion.git
    cd maafusion
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal) to view it in the browser.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Locally preview the production build.

## Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
