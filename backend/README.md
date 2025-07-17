# CMS Backend API

A FastAPI-based Content Management System backend for managing company website content.

## Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Content Management** - CRUD operations for all content types
- **File Upload** - Image and file upload capabilities
- **Database** - SQLAlchemy ORM with SQLite (dev) / PostgreSQL (prod)
- **API Documentation** - Auto-generated Swagger/OpenAPI docs
- **Activity Logging** - Track all admin actions

## Project Structure

```
backend/
├── app/
│   ├── api/v1/              # API routes
│   ├── core/                # Core functionality (config, database, security)
│   ├── crud/                # Database operations
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── main.py              # FastAPI application
├── uploads/                 # File uploads directory
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── setup.sh                 # Setup script
└── run.sh                   # Development server script
```

## Quick Start

1. **Setup the project:**
   ```bash
   ./setup.sh
   ```

2. **Start the development server:**
   ```bash
   ./run.sh
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Manual Setup

If you prefer manual setup:

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env  # Edit .env with your settings
   ```

4. **Run the development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Content Management
- `GET/POST/PUT/DELETE /api/v1/products` - Products management
- `GET/POST/PUT/DELETE /api/v1/services` - Services management
- `GET/POST/PUT/DELETE /api/v1/news` - News & announcements
- `GET/POST/PUT/DELETE /api/v1/team` - Team members
- `GET/POST/PUT/DELETE /api/v1/hero-banner` - Hero banners
- `GET/POST/PUT/DELETE /api/v1/contact` - Contact inquiries
- `GET/POST/PUT/DELETE /api/v1/users` - User management
- `GET /api/v1/logs` - Activity logs

### Dashboard
- `GET /api/v1/dashboard/stats` - Dashboard statistics

## Database Models

- **User** - Admin users and authentication
- **HeroBanner** - Homepage hero banners
- **Company** - Company information
- **TeamMember** - Team profiles
- **Product** - Products catalog
- **Service** - Services offered
- **News** - News and announcements
- **Contact** - Contact form submissions
- **ActivityLog** - System activity logs

## Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///./cms.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_FOLDER=uploads
```

## Development

1. **Add new models:**
   - Create model in `app/models/`
   - Create schema in `app/schemas/`
   - Create CRUD in `app/crud/`
   - Create API routes in `app/api/v1/`

2. **Database migrations:**
   ```bash
   # Initialize Alembic (first time)
   alembic init alembic
   
   # Create migration
   alembic revision --autogenerate -m "Add new table"
   
   # Apply migration
   alembic upgrade head
   ```

## Production Deployment

1. **Update environment variables for production**
2. **Use PostgreSQL instead of SQLite**
3. **Set up proper file storage (AWS S3, etc.)**
4. **Configure reverse proxy (Nginx)**
5. **Use process manager (PM2, Supervisor)**

## Security

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Role-based access control (admin/user)
- File upload validation
- CORS configuration
- SQL injection protection via SQLAlchemy ORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
