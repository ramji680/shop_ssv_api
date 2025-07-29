# Shop SSV Backend API

A comprehensive Fast Food Shop Management System backend API built with Node.js, TypeScript, and Express.

## Features

- 🔐 Authentication & Authorization
- 👥 User Management
- 🍔 Product Management
- 📦 Order Management
- 📊 Inventory Management
- 📈 Analytics & Reporting
- 👨‍🍳 Chef Management
- 🔄 Real-time updates with Socket.io

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js >= 18.0.0
- MongoDB database
- npm or yarn

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shop_ssv_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/shop_ssv_db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Start production server**
   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Inventory
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Analytics
- `GET /api/analytics/sales` - Get sales analytics
- `GET /api/analytics/products` - Get product analytics
- `GET /api/analytics/orders` - Get order analytics

### Health Check
- `GET /health` - API health check

## Deployment on Render

### Method 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** with the `render.yaml` file included

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Set Environment Variables** in Render Dashboard:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGODB_URI=your-mongodb-connection-string`
   - `JWT_SECRET=your-super-secret-jwt-key`
   - `JWT_EXPIRES_IN=7d`
   - `FRONTEND_URL=your-frontend-url`

### Method 2: Manual Setup

1. **Create a new Web Service** on Render

2. **Configure the service**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

3. **Set Environment Variables** as listed above

4. **Deploy**

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT secret key | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |

## Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Database Schema

The application uses MongoDB with the following main collections:
- Users
- Products
- Orders
- Inventory
- Settings

## Security Features

- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details 