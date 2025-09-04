# Inventory & Billing Management System Backend

A comprehensive backend system for small businesses to manage products, customers, vendors, and transactions.

## 🚀 Live Demo

**Deployed API**: [https://your-app-name.vercel.app](https://your-app-name.vercel.app)

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

## Features

- **User Authentication**: JWT-based authentication with session management
- **Product Management**: Add, edit, delete products with stock tracking
- **Customer & Vendor Management**: Manage contacts with search functionality
- **Transaction Management**: Record sales and purchases with automatic stock updates
- **Reporting**: Inventory reports and transaction history

## 🏗️ Architecture

```
src/
├── app.js              # Main application file
├── server.js           # Server entry point
├── routes/             # API route files
├── controllers/        # Route handlers
├── models/             # MongoDB schemas
├── middleware/         # Authentication middleware
├── utils/              # Helper functions
└── scripts/            # Database seeding scripts
```

## 🛠️ Setup Instructions

### Local Development

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd inventory-billing-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/inventory_billing
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Database Setup**
   - Ensure MongoDB is running on your system
   - The application will automatically create the database and collections

5. **Seed Demo Data (Optional)**
   ```bash
   npm run seed
   ```

6. **Run the Application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

### 🌐 Deployment (Vercel)

1. **Fork/Clone this repository to your GitHub account**

2. **Install Vercel CLI (Optional)**
   ```bash
   npm install -g vercel
   ```

3. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it as a Node.js project

4. **Add Environment Variables in Vercel Dashboard**
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a secure random string
   - `JWT_EXPIRE`: `7d`
   - `MONGODB_URI`: Your MongoDB Atlas connection string

5. **Deploy via CLI (Alternative)**
   ```bash
   vercel --prod
   ```

6. **Configuration**
   - The `vercel.json` file is already configured
   - Vercel will automatically deploy your application
   - The API will be available at your Vercel URL

### 📊 Demo Data

The system includes a comprehensive demo dataset:
- **1 Demo User**: Complete business profile
- **10 Products**: Electronics inventory across multiple categories
- **7 Contacts**: 4 customers and 3 vendors
- **5 Transactions**: Mix of sales and purchases
- **Stock Management**: Realistic inventory levels including low-stock items

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new business user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Contacts (Customers/Vendors)
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction

### Reports
- `GET /api/reports/inventory` - Get inventory report
- `GET /api/reports/transactions` - Get transaction reports

## Database Schema

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  businessName: String,
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  businessId: ObjectId
}
```

### Contact
```javascript
{
  name: String,
  phone: String,
  email: String,
  address: String,
  type: 'customer' | 'vendor',
  businessId: ObjectId
}
```

### Transaction
```javascript
{
  type: 'sale' | 'purchase',
  customerId: ObjectId,
  vendorId: ObjectId,
  products: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  date: Date,
  businessId: ObjectId
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
