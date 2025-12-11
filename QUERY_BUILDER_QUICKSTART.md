# Query Builder - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Access the Query Builder
Navigate to the Query Builder from any of these locations:
- Click **"Query Builder"** in the navigation menu
- Click **"Advanced Query Builder"** on the search page
- Click the **"Query Builder"** card on the dashboard

### Step 2: Add Conditions
1. Click **"Add Condition"** button
2. Select **Entity** (what you're searching)
3. Select **Field** (what property to check)
4. Select **Operator** (how to compare)
5. Enter **Value** (what to search for)

### Step 3: Execute & View Results
- Click **"Execute Query"** to run your search
- Results appear below
- Click any result to view full details

---

## 📋 Quick Examples

### Example 1: Find Red T-Shirts
```
Condition 1:
├─ Entity: Clothing Items
├─ Field: Category
├─ Operator: Equals
└─ Value: Torso Upper

Condition 2:
├─ Entity: Clothing Items
├─ Field: Colors
├─ Operator: Contains
└─ Value: red
```

### Example 2: Victorian Era Formal Wear
```
Condition 1:
├─ Entity: Clothing Items
├─ Field: Historical Period
├─ Operator: Contains
└─ Value: Victorian

Condition 2:
├─ Entity: Clothing Items
├─ Field: Tags
├─ Operator: Contains
└─ Value: formal
```

### Example 3: Chapter 5 Timeline
```
Condition 1:
├─ Entity: Timeline Entries
├─ Field: Chapter
├─ Operator: Equals
└─ Value: 5
```

---

## 💾 Saving Queries

### To Save a Query:
1. Build your query with conditions
2. Click **"Save Query"** button
3. Enter a descriptive name
4. (Optional) Add a description
5. Click **"Save"**

### To Load a Query:
1. Find your query in the **"Saved Queries"** sidebar
2. Click **"Load"** button
3. Query conditions are restored
4. Click **"Execute Query"** to run it

---

## 🎯 Tips for Better Queries

### ✅ DO:
- Start with one condition and add more to refine
- Use "Contains" for flexible text matching
- Save frequently used queries
- Give saved queries descriptive names
- Use appropriate operators for field types

### ❌ DON'T:
- Add too many conditions at once (start simple)
- Use "Equals" when "Contains" would work better
- Forget to click "Execute Query" after building
- Leave the value field empty

---

## 🔍 Field Reference Guide

### Clothing Items Fields
| Field | Type | Best Operators | Example |
|-------|------|----------------|---------|
| Name | Text | Contains, Equals | "silk dress" |
| Category | Select | Equals | "Torso Upper" |
| Colors | Array | Contains | "red" |
| Tags | Array | Contains | "formal" |
| Materials | Array | Contains | "silk" |
| Historical Period | Text | Contains | "Victorian" |
| Geographic Origin | Text | Contains, Equals | "France" |

### Outfits Fields
| Field | Type | Best Operators | Example |
|-------|------|----------------|---------|
| Name | Text | Contains, Equals | "Ball Gown Outfit" |
| Tags | Array | Contains | "formal" |
| Occasion | Text | Contains | "wedding" |
| Season | Text | Equals | "winter" |

### Characters Fields
| Field | Type | Best Operators | Example |
|-------|------|----------------|---------|
| Name | Text | Contains, Equals | "Elizabeth" |
| Role | Text | Contains | "protagonist" |

### Timeline Entries Fields
| Field | Type | Best Operators | Example |
|-------|------|----------------|---------|
| Chapter | Number | Equals, Greater than, Less than | "5" |
| Scene | Number | Equals | "3" |
| Context | Text | Contains | "ball scene" |

---

## 🛠️ Operator Reference

| Operator | Works With | Description | Example Use |
|----------|-----------|-------------|-------------|
| **Equals** | Text, Select, Number | Exact match | Category equals "Torso Upper" |
| **Contains** | Text, Arrays | Partial match | Name contains "dress" |
| **Is one of** | Select, Arrays | Match any value | Colors contains "red" |
| **Greater than** | Numbers | Value is larger | Chapter > 5 |
| **Less than** | Numbers | Value is smaller | Chapter < 10 |
| **Between** | Numbers | Value in range | Year between 1800-1900 |

---

## ⚡ Power User Tips

1. **Combine Period + Location**: Find items from specific time and place
   ```
   Historical Period contains "Victorian" AND
   Geographic Origin equals "England"
   ```

2. **Multi-Tag Search**: Find items with multiple characteristics
   ```
   Tags contains "formal" AND
   Tags contains "outdoor"
   ```

3. **Timeline Ranges**: Find events in specific chapters
   ```
   Chapter greater than 3 AND
   Chapter less than 8
   ```

4. **Color + Material**: Specific fabric in specific color
   ```
   Colors contains "blue" AND
   Materials contains "silk"
   ```

---

## 🐛 Troubleshooting

### "No results found"
- ✅ Try using "Contains" instead of "Equals"
- ✅ Remove some conditions to broaden search
- ✅ Check spelling in your values
- ✅ Verify data exists in database

### "Query not saving"
- ✅ Enter a name for the query
- ✅ Check if localStorage is enabled
- ✅ Try a different browser

### "Operators missing"
- ✅ Select a field first
- ✅ Different fields show different operators
- ✅ Reload the page if issue persists

---

## 📱 Mobile Usage

The Query Builder works on mobile devices:
- Tap fields to edit
- Scroll horizontally on condition rows if needed
- Use the mobile menu to access navigation
- Saved queries work the same way

---

## 🎓 Learning Path

### Beginner
1. Start with single condition queries
2. Try different operators
3. Practice with one entity type

### Intermediate
1. Combine 2-3 conditions
2. Save your first query
3. Try all entity types

### Advanced
1. Create complex multi-condition queries
2. Build a library of saved queries
3. Master all operators and field types

---

## 📞 Need Help?

- 📖 Read the full [Query Builder Guide](./QUERY_BUILDER_GUIDE.md)
- 📚 Check the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
- 🔍 Search existing documentation
- 💬 Contact support team

---

**Happy Querying! 🎉**

*This guide will help you master the Query Builder and search your wardrobe database like a pro.*
