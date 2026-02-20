import requests
import sys
import json
from datetime import datetime

class EcommerceAPITester:
    def __init__(self, base_url="https://ben-web-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test_session_{datetime.now().strftime('%H%M%S')}"
        self.created_product_id = None
        self.created_order_id = None
        self.auth_token = None
        self.test_user_id = None
        self.test_email = f"test{datetime.now().strftime('%H%M%S')}@example.com"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    resp_data = response.json()
                    if isinstance(resp_data, list):
                        print(f"   Response: List with {len(resp_data)} items")
                    elif isinstance(resp_data, dict):
                        if 'id' in resp_data:
                            print(f"   Response ID: {resp_data.get('id')}")
                        elif 'message' in resp_data:
                            print(f"   Message: {resp_data.get('message')}")
                    return success, resp_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_seed_data(self):
        """Seed initial data"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_get_categories(self):
        """Test get all categories"""
        return self.run_test("Get Categories", "GET", "categories", 200)

    def test_get_products(self):
        """Test get all products"""
        return self.run_test("Get All Products", "GET", "products", 200)

    def test_get_featured_products(self):
        """Test get featured products"""
        return self.run_test("Get Featured Products", "GET", "products?featured=true", 200)

    def test_get_products_by_category(self):
        """Test get products by category"""
        return self.run_test("Get Products by Category", "GET", "products?category_id=cat-furniture", 200)

    def test_get_single_product(self):
        """Test get single product"""
        return self.run_test("Get Single Product", "GET", "products/prod-sofa-grey", 200)

    def test_get_nonexistent_product(self):
        """Test get nonexistent product (should return 404)"""
        return self.run_test("Get Nonexistent Product", "GET", "products/nonexistent", 404)

    def test_create_product(self):
        """Test create new product"""
        product_data = {
            "name_fr": "Test Produit",
            "name_tr": "Test Ürün",
            "name_en": "Test Product",
            "description_fr": "Description française de test",
            "description_tr": "Test Türkçe açıklama",
            "description_en": "Test English description",
            "price": 299.99,
            "category_id": "cat-furniture",
            "images": ["https://via.placeholder.com/400"],
            "stock": 5,
            "featured": False
        }
        success, response = self.run_test("Create Product", "POST", "products", 200, product_data)
        if success and response.get('id'):
            self.created_product_id = response['id']
        return success, response

    def test_update_product(self):
        """Test update product"""
        if not self.created_product_id:
            print("⚠️ Skipping update test - no product created")
            return False, {}
        
        update_data = {
            "name_fr": "Test Produit Modifié",
            "name_tr": "Test Ürün Güncellenmiş",
            "name_en": "Test Product Updated",
            "description_fr": "Description française modifiée",
            "description_tr": "Test Türkçe açıklama güncellenmiş",
            "description_en": "Test English description updated",
            "price": 399.99,
            "category_id": "cat-furniture",
            "images": ["https://via.placeholder.com/400"],
            "stock": 10,
            "featured": True
        }
        return self.run_test("Update Product", "PUT", f"products/{self.created_product_id}", 200, update_data)

    def test_empty_cart(self):
        """Test get empty cart"""
        return self.run_test("Get Empty Cart", "GET", f"cart/{self.session_id}", 200)

    def test_add_to_cart(self):
        """Test add item to cart"""
        cart_item = {
            "product_id": "prod-sofa-grey",
            "quantity": 2
        }
        return self.run_test("Add to Cart", "POST", f"cart/{self.session_id}/add", 200, cart_item)

    def test_get_cart_with_items(self):
        """Test get cart with items"""
        return self.run_test("Get Cart with Items", "GET", f"cart/{self.session_id}", 200)

    def test_update_cart_quantity(self):
        """Test update cart item quantity"""
        update_item = {
            "product_id": "prod-sofa-grey",
            "quantity": 3
        }
        return self.run_test("Update Cart Quantity", "POST", f"cart/{self.session_id}/update", 200, update_item)

    def test_add_another_item_to_cart(self):
        """Test add another item to cart"""
        cart_item = {
            "product_id": "prod-dining-table",
            "quantity": 1
        }
        return self.run_test("Add Another Item to Cart", "POST", f"cart/{self.session_id}/add", 200, cart_item)

    def test_create_order(self):
        """Test create order from cart"""
        order_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "0123456789",
            "customer_address": "123 Test Street, Test City",
            "cart_session_id": self.session_id
        }
        success, response = self.run_test("Create Order", "POST", "orders", 200, order_data)
        if success and response.get('id'):
            self.created_order_id = response['id']
        return success, response

    def test_get_order(self):
        """Test get created order"""
        if not self.created_order_id:
            print("⚠️ Skipping get order test - no order created")
            return False, {}
        
        return self.run_test("Get Order", "GET", f"orders/{self.created_order_id}", 200)

    def test_get_all_orders(self):
        """Test get all orders"""
        return self.run_test("Get All Orders", "GET", "orders", 200)

    def test_remove_cart_item(self):
        """Test remove item from cart"""
        return self.run_test("Remove Cart Item", "DELETE", f"cart/{self.session_id}/item/prod-sofa-grey", 200)

    def test_clear_cart(self):
        """Test clear entire cart"""
        return self.run_test("Clear Cart", "DELETE", f"cart/{self.session_id}", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "0123456789",
            "message": "This is a test contact message"
        }
        return self.run_test("Contact Form", "POST", "contact", 200, contact_data)

    def test_delete_created_product(self):
        """Test delete created product (cleanup)"""
        if not self.created_product_id:
            print("⚠️ Skipping delete test - no product to delete")
            return True, {}
        
        return self.run_test("Delete Created Product", "DELETE", f"products/{self.created_product_id}", 200)
    
    # ============== AUTH TESTS ==============
    
    def test_register_user(self):
        """Test user registration"""
        user_data = {
            "email": self.test_email,
            "password": "test123",
            "name": "Test User",
            "phone": "0123456789"
        }
        success, response = self.run_test("Register User", "POST", "auth/register", 200, user_data)
        if success and response.get('token'):
            self.auth_token = response['token']
            self.test_user_id = response.get('user', {}).get('id')
            print(f"   Token received: {self.auth_token[:20]}...")
        return success, response
    
    def test_register_duplicate_email(self):
        """Test register with duplicate email (should fail)"""
        user_data = {
            "email": self.test_email,  # Same email as previous test
            "password": "test123",
            "name": "Another User",
            "phone": "9876543210"
        }
        return self.run_test("Register Duplicate Email", "POST", "auth/register", 400, user_data)
    
    def test_login_user(self):
        """Test user login"""
        login_data = {
            "email": self.test_email,
            "password": "test123"
        }
        success, response = self.run_test("Login User", "POST", "auth/login", 200, login_data)
        if success and response.get('token'):
            # Update token to latest one
            self.auth_token = response['token']
            print(f"   Login token: {self.auth_token[:20]}...")
        return success, response
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        login_data = {
            "email": self.test_email,
            "password": "wrongpassword"
        }
        return self.run_test("Login Wrong Password", "POST", "auth/login", 401, login_data)
    
    def test_login_nonexistent_user(self):
        """Test login with nonexistent user"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "test123"
        }
        return self.run_test("Login Nonexistent User", "POST", "auth/login", 401, login_data)
    
    def test_get_current_user(self):
        """Test get current user profile"""
        if not self.auth_token:
            print("⚠️ Skipping get current user - no token")
            return False, {}
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        return self.run_test("Get Current User", "GET", "auth/me", 200, headers=headers)
    
    def test_get_current_user_invalid_token(self):
        """Test get current user with invalid token"""
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer invalid_token_here'
        }
        return self.run_test("Get Current User Invalid Token", "GET", "auth/me", 401, headers=headers)
    
    def test_update_profile(self):
        """Test update user profile"""
        if not self.auth_token:
            print("⚠️ Skipping update profile - no token")
            return False, {}
        
        update_data = {
            "name": "Test User Updated",
            "phone": "9876543210",
            "address": "123 Updated Street, Test City"
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        return self.run_test("Update Profile", "PUT", "auth/profile", 200, update_data, headers)
    
    def test_get_user_orders(self):
        """Test get user's orders"""
        if not self.auth_token:
            print("⚠️ Skipping get user orders - no token")
            return False, {}
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        return self.run_test("Get User Orders", "GET", "auth/orders", 200, headers=headers)
    
    def test_create_order_with_auth(self):
        """Test create order while authenticated"""
        if not self.auth_token:
            print("⚠️ Skipping authenticated order creation - no token")
            return False, {}
            
        # First add item to cart
        cart_item = {"product_id": "prod-sofa-grey", "quantity": 1}
        self.run_test("Add to Cart (Auth Test)", "POST", f"cart/{self.session_id}_auth/add", 200, cart_item)
        
        order_data = {
            "customer_name": "Test User Auth",
            "customer_email": self.test_email,
            "customer_phone": "0123456789",
            "customer_address": "456 Auth Street, Test City",
            "cart_session_id": f"{self.session_id}_auth"
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.auth_token}'
        }
        success, response = self.run_test("Create Order (Authenticated)", "POST", "orders", 200, order_data, headers)
        if success and response.get('id'):
            self.created_order_id = response['id']
        return success, response

def main():
    print("🧪 Starting E-commerce API Tests with Authentication")
    print("=" * 60)
    
    tester = EcommerceAPITester()
    
    # Test sequence with authentication
    tests = [
        ("API Root", tester.test_api_root),
        ("Seed Data", tester.test_seed_data),
        ("Categories", tester.test_get_categories),
        ("All Products", tester.test_get_products),
        ("Featured Products", tester.test_get_featured_products),
        ("Products by Category", tester.test_get_products_by_category),
        ("Single Product", tester.test_get_single_product),
        ("Nonexistent Product", tester.test_get_nonexistent_product),
        
        # Auth tests
        ("Register User", tester.test_register_user),
        ("Register Duplicate Email", tester.test_register_duplicate_email),
        ("Login User", tester.test_login_user),
        ("Login Wrong Password", tester.test_login_wrong_password),
        ("Login Nonexistent User", tester.test_login_nonexistent_user),
        ("Get Current User", tester.test_get_current_user),
        ("Get Current User Invalid Token", tester.test_get_current_user_invalid_token),
        ("Update Profile", tester.test_update_profile),
        ("Get User Orders", tester.test_get_user_orders),
        
        # Product and cart tests
        ("Create Product", tester.test_create_product),
        ("Update Product", tester.test_update_product),
        ("Empty Cart", tester.test_empty_cart),
        ("Add to Cart", tester.test_add_to_cart),
        ("Cart with Items", tester.test_get_cart_with_items),
        ("Update Cart Quantity", tester.test_update_cart_quantity),
        ("Add Another Item", tester.test_add_another_item_to_cart),
        
        # Order tests
        ("Create Order", tester.test_create_order),
        ("Create Order (Authenticated)", tester.test_create_order_with_auth),
        ("Get Order", tester.test_get_order),
        ("Get All Orders", tester.test_get_all_orders),
        
        # Cart cleanup
        ("Remove Cart Item", tester.test_remove_cart_item),
        ("Clear Cart", tester.test_clear_cart),
        
        # Other tests
        ("Contact Form", tester.test_contact_form),
        ("Delete Product (Cleanup)", tester.test_delete_created_product),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print(f"⚠️ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())