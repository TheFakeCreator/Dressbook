# Setup Instructions - Wardrobe Chronicle

## Prerequisites Checklist

Before starting, ensure you have:
- [x] Node.js 18+ installed
- [ ] MongoDB installed locally OR MongoDB Atlas account
- [ ] Git installed (for version control)

## Step-by-Step Setup

### 1. Database Setup (Choose One Option)

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Verify email

2. **Create Cluster**
   - Click "Create" to create a new cluster
   - Choose "M0 Sandbox" (Free tier)
   - Select region closest to you
   - Click "Create Deployment"

3. **Create Database User**
   - Click "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password (save these!)
   - Set role as "Atlas admin"
   - Click "Add User"

4. **Allow Network Access**
   - Click "Network Access" in sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your current IP address
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `wardrobe-chronicle`

   Example:
   ```
   mongodb+srv://username:password123@cluster0.xxxxx.mongodb.net/wardrobe-chronicle?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB

1. **Install MongoDB Locally**

   **Windows:**
   - Download from https://www.mongodb.com/try/download/community
   - Run installer
   - Choose "Complete" installation
   - Install as Windows Service

   **macOS:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is Running**
   ```bash
   mongosh
   ```
   You should see MongoDB shell. Type `exit` to quit.

3. **Connection String for Local MongoDB**
   ```
   mongodb://localhost:27017/wardrobe-chronicle
   ```

#### Option C: MongoDB with Docker

```bash
docker run -d -p 27017:27017 --name wardrobe-mongodb -e MONGO_INITDB_DATABASE=wardrobe-chronicle mongo:latest
```

### 2. Project Setup

1. **Navigate to Project Directory**
   ```bash
   cd "d:\Sanskar\Moviescripts\suryavir\Clothing System\wardrobe-chronicle"
   ```

2. **Configure Environment Variables**
   
   The `.env.local` file already exists. Open it and update:
   ```env
   # Replace this with your MongoDB connection string
   MONGODB_URI=your_connection_string_here
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Examples:**
   - Atlas: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wardrobe-chronicle?retryWrites=true&w=majority`
   - Local: `mongodb://localhost:27017/wardrobe-chronicle`

3. **Install Dependencies** (Already Done)
   ```bash
   npm install
   ```

### 3. Test Database Connection

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test API Endpoint**
   Open browser and go to:
   ```
   http://localhost:3000/api/items
   ```

   You should see:
   ```json
   {
     "success": true,
     "data": [],
     "pagination": {
       "page": 1,
       "limit": 20,
       "total": 0,
       "pages": 0
     }
   }
   ```

   ✅ If you see this, database connection is working!

3. **View Dashboard**
   ```
   http://localhost:3000
   ```

### 4. Test Creating Your First Item (Optional)

Using a tool like Postman or curl:

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hat",
    "category": "Head",
    "description": "My first clothing item",
    "tags": ["test"],
    "colors": ["black"],
    "materials": ["cotton"]
  }'
```

Or use Postman:
- Method: POST
- URL: `http://localhost:3000/api/items`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Test Hat",
  "category": "Head",
  "description": "My first clothing item",
  "tags": ["test"],
  "colors": ["black"],
  "materials": ["cotton"]
}
```

### 5. Verify MongoDB Data (Optional)

**MongoDB Atlas:**
- Go to your Atlas dashboard
- Click "Browse Collections"
- You should see `wardrobe-chronicle` database with `clothingitems` collection

**Local MongoDB:**
```bash
mongosh wardrobe-chronicle
db.clothingitems.find()
```

**MongoDB Compass (GUI):**
- Download from https://www.mongodb.com/products/compass
- Connect using your connection string
- Browse collections visually

## Troubleshooting

### Issue: "MongooseServerSelectionError"

**Cause**: Can't connect to MongoDB

**Solutions:**
1. Check if MongoDB is running (local installation)
2. Verify connection string in `.env.local`
3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
4. Check username/password in connection string

### Issue: "Module not found" errors

**Solution:**
```bash
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use a different port
npm run dev -- -p 3001
```

### Issue: ESLint errors in VS Code

**Solution:**
- Restart VS Code
- Or disable ESLint temporarily in settings

## Next Steps

Once setup is complete:

1. ✅ Review the dashboard at `http://localhost:3000`
2. ✅ Test API endpoints
3. ✅ Start Phase 2: Continue with frontend development

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# View MongoDB data (if installed locally)
mongosh wardrobe-chronicle
```

## Development Tools (Optional but Recommended)

1. **MongoDB Compass**: GUI for MongoDB
   - https://www.mongodb.com/products/compass

2. **Postman**: API testing
   - https://www.postman.com/downloads/

3. **VS Code Extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Prettier - Code formatter
   - MongoDB for VS Code

## Environment Variables Reference

```env
# Required
MONGODB_URI=                  # Your MongoDB connection string

# Optional (defaults shown)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Future features
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

## Getting Help

If you encounter issues:
1. Check error messages in terminal
2. Check browser console (F12)
3. Review MongoDB connection logs
4. Refer to [MVP_PLAN.md](../MVP_PLAN.md) and [TECH_STACK.md](../TECH_STACK.md)

---

**Setup Status**: ✅ Complete
**Current Phase**: Phase 1 - Core Data Layer
**Next**: Continue building API routes and frontend UI
