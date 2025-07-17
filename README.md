# Timles Content Management System

A comprehensive full-stack web application with Next.js frontend and FastAPI backend for content management.

## 🚀 Features

### Frontend Dashboard
- **Modern UI** - Built with Next.js 15.1.6, TypeScript, and Tailwind CSS
- **Responsive Design** - Mobile-first approach with sidebar navigation
- **Content Management** - Complete CMS for managing various content types
- **Dashboard Overview** - Statistics, quick actions, and recent activity
- **Theme Support** - Dark/light mode with next-themes

### Backend API
- **FastAPI Framework** - High-performance Python web framework
- **RESTful API** - Well-structured API endpoints
- **Database Integration** - SQLAlchemy ORM with PostgreSQL support
- **Authentication** - JWT-based user authentication
- **File Upload** - Support for image and file uploads

## 📁 Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions
│   │   └── styles/         # CSS and styling
│   ├── package.json
│   └── tailwind.config.ts
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── crud/           # Database operations
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── requirements.txt
│   └── run.sh
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.1.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React hooks
- **Charts**: ApexCharts
- **Icons**: Custom SVG icon library

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **Validation**: Pydantic schemas
- **File Storage**: Local filesystem

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run the application**
   ```bash
   ./run.sh
   ```

6. **API will be available at**
   ```
   http://localhost:8000
   ```

## 📊 Dashboard Features

### Content Management Sections
- **Dashboard Overview** - Statistics and quick actions
- **Hero Banner Management** - Manage website hero banners
- **Company Info Management** - Company details and information
- **Team Management** - Team member profiles and details
- **Products Management** - Product catalog and inventory
- **Services Management** - Service offerings and descriptions
- **News & Announcements** - News articles and announcements
- **Contacts Management** - Contact information and inquiries

### Dashboard Components
- **Content Overview Cards** - Visual statistics for each content type
- **Quick Actions** - Fast access to common operations
- **System Stats** - Performance metrics and system health
- **Recent Activity** - Latest updates and changes

## 🔧 Development

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend Commands
```bash
uvicorn app.main:app --reload    # Start development server
python -m pytest                # Run tests
python -m app.main              # Run application directly
```

## 🌟 Key Features

### Modern Architecture
- **Server-Side Rendering** with Next.js App Router
- **API-First Design** with FastAPI backend
- **Type Safety** with TypeScript throughout
- **Responsive Design** with Tailwind CSS

### Developer Experience
- **Hot Reload** in development
- **TypeScript** for type safety
- **ESLint** for code quality
- **Modular Components** for reusability

### Production Ready
- **Optimized Builds** with Next.js
- **Database Migrations** with SQLAlchemy
- **Environment Configuration** for different stages
- **Error Handling** and validation

## 📝 API Documentation

When the backend is running, visit:
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For questions and support, please open an issue on GitHub.

---

Built with ❤️ using Next.js and FastAPI
