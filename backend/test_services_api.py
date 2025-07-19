#!/usr/bin/env python3
"""
Test script for Services API endpoints
"""

import requests
import json
from typing import Dict, Any


BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"


def test_services_endpoints():
    """Test all services endpoints"""
    print("🧪 Testing Services API endpoints...")
    
    # Test 1: Get all services
    print("\n1. Testing GET /services")
    response = requests.get(f"{API_BASE}/services")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Total services: {data.get('total', 0)}")
        print(f"   Services returned: {len(data.get('services', []))}")
    
    # Test 2: Get featured services
    print("\n2. Testing GET /services/featured")
    response = requests.get(f"{API_BASE}/services/featured")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"   Featured services: {len(services)}")
    
    # Test 3: Get services by category
    print("\n3. Testing GET /services/category/development")
    response = requests.get(f"{API_BASE}/services/category/development")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"   Development services: {len(services)}")
    
    # Test 4: Search services
    print("\n4. Testing GET /services/search?q=web")
    response = requests.get(f"{API_BASE}/services/search?q=web")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"   Search results: {len(services)}")
    
    # Test 5: Get service by slug
    print("\n5. Testing GET /services/slug/web-development")
    response = requests.get(f"{API_BASE}/services/slug/web-development")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        service = response.json()
        print(f"   Service name: {service.get('name')}")
    
    # Test 6: Get service by ID
    print("\n6. Testing GET /services/1")
    response = requests.get(f"{API_BASE}/services/1")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        service = response.json()
        print(f"   Service name: {service.get('name')}")
    
    # Test 7: Get related services
    print("\n7. Testing GET /services/1/related")
    response = requests.get(f"{API_BASE}/services/1/related")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"   Related services: {len(services)}")
    
    print("\n✅ Services API testing completed!")


def test_with_authentication():
    """Test endpoints that require authentication"""
    print("\n🔐 Testing authenticated endpoints...")
    
    # First, try to get a token (you'll need to adjust this based on your auth setup)
    print("Note: Authentication tests require valid credentials")
    print("Endpoints requiring auth:")
    print("  - POST /services (create service)")
    print("  - PUT /services/{id} (update service)")
    print("  - PATCH /services/{id}/status (update status)")
    print("  - POST /services/{id}/image (upload image)")
    print("  - POST /services/{id}/gallery (upload gallery image)")
    print("  - DELETE /services/{id}/gallery/{index} (delete gallery image)")
    print("  - DELETE /services/{id} (delete service)")
    print("  - GET /services/stats (get statistics)")


def check_server_status():
    """Check if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Server is running")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running or not accessible")
        return False


if __name__ == "__main__":
    print("🚀 Services API Test Suite")
    print(f"Testing against: {BASE_URL}")
    
    if check_server_status():
        test_services_endpoints()
        test_with_authentication()
    else:
        print("Please start the server first with: ./run.sh")
