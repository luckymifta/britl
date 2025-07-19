#!/usr/bin/env python3
"""
Database migration script to create the services table
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import Base
from app.models import service  # Import to register the model


def run_migration():
    """Run the database migration"""
    print("🔧 Creating services table...")
    
    # Create engine
    engine = create_engine(settings.database_url)
    
    try:
        # Create all tables (including services)
        Base.metadata.create_all(bind=engine)
        print("✅ Services table created successfully!")
        
        # Add some sample data if needed
        with engine.connect() as conn:
            # Check if we need to add sample services
            result = conn.execute(text("SELECT COUNT(*) FROM services")).scalar()
            if result == 0:
                print("📝 Adding sample services...")
                
                sample_services = [
                    {
                        'name': 'Web Development',
                        'slug': 'web-development',
                        'short_description': 'Custom web applications and websites',
                        'description': 'We build modern, responsive websites and web applications using the latest technologies.',
                        'category': 'development',
                        'status': 'active',
                        'is_featured': True,
                        'price_range': '$2,000 - $10,000',
                        'duration': '2-8 weeks',
                        'sort_order': 1
                    },
                    {
                        'name': 'Mobile App Development',
                        'slug': 'mobile-app-development',
                        'short_description': 'iOS and Android mobile applications',
                        'description': 'Native and cross-platform mobile apps for iOS and Android devices.',
                        'category': 'development',
                        'status': 'active',
                        'is_featured': True,
                        'price_range': '$5,000 - $25,000',
                        'duration': '3-12 weeks',
                        'sort_order': 2
                    },
                    {
                        'name': 'UI/UX Design',
                        'slug': 'ui-ux-design',
                        'short_description': 'User interface and experience design',
                        'description': 'Beautiful and user-friendly design for web and mobile applications.',
                        'category': 'design',
                        'status': 'active',
                        'is_featured': False,
                        'price_range': '$1,500 - $5,000',
                        'duration': '1-4 weeks',
                        'sort_order': 3
                    },
                    {
                        'name': 'Digital Marketing',
                        'slug': 'digital-marketing',
                        'short_description': 'SEO, SEM, and social media marketing',
                        'description': 'Comprehensive digital marketing strategies to grow your business online.',
                        'category': 'marketing',
                        'status': 'active',
                        'is_featured': False,
                        'price_range': '$1,000 - $5,000/month',
                        'duration': 'Ongoing',
                        'sort_order': 4
                    }
                ]
                
                for service_data in sample_services:
                    conn.execute(text("""
                        INSERT INTO services (
                            name, slug, short_description, description, category, 
                            status, is_featured, price_range, duration, sort_order
                        ) VALUES (
                            :name, :slug, :short_description, :description, :category,
                            :status, :is_featured, :price_range, :duration, :sort_order
                        )
                    """), service_data)
                
                conn.commit()
                print("✅ Sample services added!")
        
        print("🎉 Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise


if __name__ == "__main__":
    run_migration()
