# API Documentation - Inventory & Billing Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [] // Validation errors (if applicable)
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "John's Store"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "businessName": "John's Store"
    },
    "token": "jwt_token_here"
  }
}
```

### Login User
**POST** `/auth/login`

**Body:**
```json
{
  "login": "john_doe", // username or email
  "password": "password123"
}
```

### Get User Profile
**GET** `/auth/profile`
*Requires authentication*

### Logout
**POST** `/auth/logout`
*Requires authentication*

---

## Product Endpoints

### Get All Products
**GET** `/products`
*Requires authentication*

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or description
- `category` (optional): Filter by category

**Example:** `/products?page=1&limit=10&search=laptop&category=electronics`

### Get Single Product
**GET** `/products/:id`
*Requires authentication*

### Create Product
**POST** `/products`
*Requires authentication*

**Body:**
```json
{
  "name": "Laptop",
  "description": "Gaming laptop with high specs",
  "price": 999.99,
  "stock": 50,
  "category": "Electronics"
}
```

### Update Product
**PUT** `/products/:id`
*Requires authentication*

**Body:** (All fields optional)
```json
{
  "name": "Updated Laptop",
  "description": "Updated description",
  "price": 1099.99,
  "stock": 45,
  "category": "Electronics"
}
```

### Delete Product
**DELETE** `/products/:id`
*Requires authentication*

### Update Stock
**PATCH** `/products/:id/stock`
*Requires authentication*

**Body:**
```json
{
  "action": "increase", // or "decrease"
  "quantity": 10
}
```

---

## Contact Endpoints (Customers/Vendors)

### Get All Contacts
**GET** `/contacts`
*Requires authentication*

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name, email, or phone
- `type` (optional): Filter by 'customer' or 'vendor'

### Get Single Contact
**GET** `/contacts/:id`
*Requires authentication*

### Create Contact
**POST** `/contacts`
*Requires authentication*

**Body:**
```json
{
  "name": "John Customer",
  "phone": "+1234567890",
  "email": "john@customer.com",
  "address": "123 Main St, City, State",
  "type": "customer" // or "vendor"
}
```

### Update Contact
**PUT** `/contacts/:id`
*Requires authentication*

### Delete Contact
**DELETE** `/contacts/:id`
*Requires authentication*

---

## Transaction Endpoints

### Get All Transactions
**GET** `/transactions`
*Requires authentication*

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by 'sale' or 'purchase'
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

### Get Single Transaction
**GET** `/transactions/:id`
*Requires authentication*

### Create Transaction
**POST** `/transactions`
*Requires authentication*

**Body for Sale:**
```json
{
  "type": "sale",
  "customerId": "customer_object_id",
  "products": [
    {
      "productId": "product_object_id",
      "quantity": 2,
      "price": 999.99
    }
  ]
}
```

**Body for Purchase:**
```json
{
  "type": "purchase",
  "vendorId": "vendor_object_id",
  "products": [
    {
      "productId": "product_object_id",
      "quantity": 10,
      "price": 800.00
    }
  ]
}
```

### Get Transactions by Contact
**GET** `/transactions/contact/:contactId`
*Requires authentication*

---

## Report Endpoints

### Get Inventory Report
**GET** `/reports/inventory`
*Requires authentication*

**Query Parameters:**
- `lowStock` (optional): Low stock threshold (default: 10)
- `category` (optional): Filter by category
- `sortBy` (optional): Sort by 'name', 'stock', 'price', or 'category'
- `sortOrder` (optional): 'asc' or 'desc'

**Response includes:**
- Summary statistics
- All products
- Low stock products
- Out of stock products
- Category statistics

### Get Transaction Reports
**GET** `/reports/transactions`
*Requires authentication*

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `type` (optional): 'sale' or 'purchase'
- `period` (optional): 'today', 'week', 'month', or 'year'

**Response includes:**
- Summary statistics
- All transactions in period
- Top customers and vendors
- Top selling products
- Daily statistics

### Get Dashboard Summary
**GET** `/reports/dashboard`
*Requires authentication*

**Response includes:**
- Overview counts
- Today's statistics
- This month's statistics
- Low stock alerts

---

## Error Codes

- **400**: Bad Request - Validation errors or invalid data
- **401**: Unauthorized - Invalid or missing token
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

## Example Usage with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "businessName": "Test Business"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "password123"
  }'
```

### Create a product (with token):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "stock": 100,
    "category": "Test Category"
  }'
```

### Get products:
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
