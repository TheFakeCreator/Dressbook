# Quick Start Guide

## ✅ What's Been Built

### Phase 0 & 1: Core Foundation (COMPLETE ✅)

**Backend:**
- ✅ MongoDB connection utility
- ✅ All Mongoose models (Items, Outfits, Characters, Timeline)
- ✅ Complete REST API for all entities with proper TypeScript types:
  - `/api/items` - CRUD for clothing items
  - `/api/outfits` - CRUD for outfits
  - `/api/characters` - CRUD for characters
  - `/api/timeline` - CRUD for timeline entries

**Frontend:**
- ✅ Navigation component with active states
- ✅ UI component library (Button, Input, Card, Loading)
- ✅ Dashboard homepage with stats
- ✅ Items list page (with category filtering & pagination)
- ✅ Item detail page (with real-world reference display, Next.js Image optimization)
- ✅ All TypeScript and ESLint errors resolved

## 🚀 Starting the Application

### 1. Set Up MongoDB

**Option A: MongoDB Atlas (Recommended for quick start)**
```bash
# No installation needed - just get your connection string
# Follow SETUP.md for detailed instructions
```

**Option B: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Update Environment Variables

Edit `.env.local`:
```env
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wardrobe-chronicle

# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/wardrobe-chronicle

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 🧪 Testing the Application

### 1. Test API Endpoints

**Check if API is working:**
```
http://localhost:3000/api/items
```

Should return:
```json
{
  "success": true,
  "data": [],
  "pagination": {...}
}
```

### 2. Test with Sample Data

**Using curl (PowerShell):**
```powershell
$body = @{
    name = "Victorian Top Hat"
    category = "Head"
    description = "Traditional silk top hat worn by upper-class gentlemen"
    tags = @("formal", "Victorian", "upper-class")
    colors = @("black")
    materials = @("silk", "felt")
    realWorldReference = @{
        historicalPeriod = "1840-1900"
        periodStart = 1840
        periodEnd = 1900
        geographicOrigin = "Victorian England"
        culturalContext = "Worn by upper and middle-class men for formal occasions"
        historicalDescription = "The top hat became a symbol of upper-class respectability during the Victorian era."
        referenceSources = @("https://fashionhistory.org/victorian-hats")
        accuracyNotes = "Height varied by decade"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method Post -Body $body -ContentType "application/json"
```

**Or use Postman:**
- Method: POST
- URL: `http://localhost:3000/api/items`
- Body (JSON):
```json
{
  "name": "Victorian Top Hat",
  "category": "Head",
  "description": "Traditional silk top hat",
  "tags": ["formal", "Victorian"],
  "colors": ["black"],
  "materials": ["silk"],
  "realWorldReference": {
    "historicalPeriod": "1840-1900",
    "periodStart": 1840,
    "periodEnd": 1900,
    "geographicOrigin": "Victorian England",
    "culturalContext": "Upper-class formal wear"
  }
}
```

### 3. Test UI Features

1. **Dashboard** (http://localhost:3000)
   - View welcome message
   - Quick links to all sections

2. **Items List** (http://localhost:3000/items)
   - See all items
   - Filter by category
   - Pagination controls

3. **Item Detail** (Click on any item)
   - View all item details
   - See real-world reference info
   - Delete button (will ask for confirmation)

## 📊 Current Features

### Working Now:
- ✅ Full navigation
- ✅ Dashboard with stats (shows 0 until you add data)
- ✅ Items browsing with filters
- ✅ Category filtering
- ✅ Pagination
- ✅ Item detail view
- ✅ Real-world historical reference display
- ✅ Delete functionality
- ✅ Responsive design

### Coming Soon (Next Phases):
- Image upload functionality
- Add/Edit item forms
- Outfits management UI
- Characters management UI
- Timeline tracking UI
- Search functionality

## 🔍 Troubleshooting

### Can't connect to database
```bash
# Check if MongoDB is running
mongosh

# Check your connection string in .env.local
```

### Port 3000 already in use
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
npm run dev -- -p 3001
```

### "Module not found" errors
```bash
npm install
```

## 📝 Next Steps

1. ✅ Start the server
2. ✅ Test API endpoints
3. ✅ Add sample items via API
4. ✅ Browse items in UI
5. ⏭️ Continue to Phase 2: Image Management
6. ⏭️ Build Add/Edit forms
7. ⏭️ Implement Outfits UI
8. ⏭️ Build Characters & Timeline

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check for errors
npm run lint
```

## 📚 API Reference

### Items
```
GET    /api/items              # List (supports ?category=Head&page=1&limit=20)
POST   /api/items              # Create
GET    /api/items/:id          # Get one
PUT    /api/items/:id          # Update
DELETE /api/items/:id          # Delete
```

### Outfits
```
GET    /api/outfits            # List
POST   /api/outfits            # Create
GET    /api/outfits/:id        # Get one
PUT    /api/outfits/:id        # Update
DELETE /api/outfits/:id        # Delete
```

### Characters
```
GET    /api/characters         # List
POST   /api/characters         # Create
GET    /api/characters/:id     # Get one
PUT    /api/characters/:id     # Update
DELETE /api/characters/:id     # Delete
```

### Timeline
```
GET    /api/timeline           # List (supports ?characterId=&chapter=)
POST   /api/timeline           # Create
GET    /api/timeline/:id       # Get one
PUT    /api/timeline/:id       # Update
DELETE /api/timeline/:id       # Delete
```

---

**Status:** Phase 1 Complete ✅  
**Ready for:** Testing and Phase 2 (Image Management)
