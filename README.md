# Wardrobe Chronicle

A comprehensive clothing database system for world-building and story writing. Track clothing items, create outfits, manage character appearances, and maintain visual references throughout your story's timeline.

## 🎯 Features

- **Clothing Database**: Store clothing items with detailed attributes, images, and real-world historical references
- **Outfit Builder**: Create modular outfit combinations from your clothing items
- **Character Management**: Track characters and their wardrobe throughout your story
- **Timeline Tracking**: Record what characters wore at specific points in your narrative
- **Advanced Search**: Find items by category, tags, historical period, and more
- **Image Management**: Upload and organize reference images for consistency

## 📋 Real-World Reference Support

Each clothing item can include:
- Historical period (e.g., "1700-1800", "Victorian Era", "1920s")
- Geographic origin (country/region)
- Cultural context (who wore it, social class, occasions)
- Historical description and notes
- Reference sources (books, museums, websites)
- Accuracy notes for historical authenticity

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/wardrobe-chronicle
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wardrobe-chronicle

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Setup

### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas (Cloud)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add to `.env.local`

## 📁 Project Structure

```
wardrobe-chronicle/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── items/          # Items pages
│   │   └── page.tsx        # Dashboard
│   ├── components/         # React components
│   ├── lib/               # Utility functions
│   ├── models/            # Mongoose models
│   └── types/             # TypeScript types
└── public/                # Static files
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Query, Zustand
- **Forms**: React Hook Form, Zod validation

## 📖 API Documentation

### Clothing Items

```
GET    /api/items              # List all items (paginated)
POST   /api/items              # Create new item
GET    /api/items/:id          # Get single item
PUT    /api/items/:id          # Update item
DELETE /api/items/:id          # Delete item
```

## 🗺️ Roadmap

See `../IMPLEMENTATION_ROADMAP.md` for detailed development plan.

- [x] Phase 0: Project Setup
- [x] Phase 1: Core Data Layer (In Progress)
- [ ] Phase 2: Image Management
- [ ] Phase 3-11: UI, Features, Deployment

## 📄 Documentation

- [MVP Plan](../MVP_PLAN.md)
- [Implementation Roadmap](../IMPLEMENTATION_ROADMAP.md)
- [Tech Stack Details](../TECH_STACK.md)

---

**Current Status**: Phase 1 - Core Data Layer (In Progress)
