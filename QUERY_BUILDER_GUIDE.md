# Advanced Query Builder Guide

## Overview

The Advanced Query Builder is a powerful visual tool that allows you to construct complex queries to search across your clothing database. Instead of writing complex search strings, you can build queries using a visual interface with multiple conditions.

## Access Points

The Query Builder can be accessed from:

1. **Navigation Menu**: Click "Query Builder" in the top navigation bar
2. **Search Page**: Click "Advanced Query Builder" button on the search page
3. **Dashboard**: Click the "Query Builder" card on the homepage
4. **Direct URL**: Navigate to `/query-builder`

## Features

### 1. Visual Query Construction

Build queries by adding multiple conditions:
- **Entity Selection**: Choose what to search (Items, Outfits, Characters, Timeline)
- **Field Selection**: Pick which field to search (name, category, tags, etc.)
- **Operator Selection**: Choose how to compare (equals, contains, greater than, etc.)
- **Value Input**: Enter the value to search for

### 2. Multiple Conditions

- Add as many conditions as needed
- All conditions are combined with AND logic
- Remove conditions individually with the X button
- Clear all conditions at once with the Clear button

### 3. Entity-Specific Fields

Each entity type has relevant fields:

#### Clothing Items
- Name
- Category
- Colors
- Tags
- Materials
- Historical Period
- Geographic Origin

#### Outfits
- Name
- Tags
- Occasion
- Season

#### Characters
- Name
- Role

#### Timeline Entries
- Chapter
- Scene
- Context

### 4. Smart Operators

Operators adapt to field types:

| Operator | Available For | Description |
|----------|---------------|-------------|
| Equals | Text, Select, Number | Exact match |
| Contains | Text, Arrays | Partial match |
| Is one of | Select, Arrays | Match any value |
| Greater than | Numbers | Numeric comparison |
| Less than | Numbers | Numeric comparison |
| Between | Numbers | Range comparison |

### 5. Save & Load Queries

**Save Queries:**
1. Build your query with conditions
2. Click "Save Query"
3. Enter a name and optional description
4. Click "Save"

**Load Queries:**
1. Find your saved query in the sidebar
2. Click "Load" to restore the conditions
3. Execute or modify as needed

**Delete Queries:**
- Click the trash icon next to any saved query

### 6. Query Execution

1. Add your conditions
2. Click "Execute Query"
3. Results appear below the query builder
4. Click any result to view full details

## Example Queries

### Example 1: Red Victorian Items
**Goal**: Find all red clothing items from the Victorian era

1. Add Condition:
   - Entity: Clothing Items
   - Field: Colors
   - Operator: Contains
   - Value: red

2. Add Condition:
   - Entity: Clothing Items
   - Field: Historical Period
   - Operator: Contains
   - Value: Victorian

3. Execute Query

### Example 2: Formal Winter Outfits
**Goal**: Find formal outfits suitable for winter

1. Add Condition:
   - Entity: Outfits
   - Field: Tags
   - Operator: Contains
   - Value: formal

2. Add Condition:
   - Entity: Outfits
   - Field: Season
   - Operator: Equals
   - Value: winter

3. Execute Query

### Example 3: Chapter 5 Timeline
**Goal**: See all outfit changes in chapter 5

1. Add Condition:
   - Entity: Timeline Entries
   - Field: Chapter
   - Operator: Equals
   - Value: 5

2. Execute Query

### Example 4: Character-Specific Query
**Goal**: Find the main character's information

1. Add Condition:
   - Entity: Characters
   - Field: Role
   - Operator: Contains
   - Value: protagonist

2. Execute Query

## Tips & Best Practices

### 1. Start Broad, Then Narrow
- Begin with one condition
- Execute to see results
- Add more conditions to refine

### 2. Use Appropriate Operators
- Use "Contains" for flexible text matching
- Use "Equals" for exact matches
- Use comparison operators for chapters/years

### 3. Save Common Queries
- Save queries you use frequently
- Give them descriptive names
- Add descriptions to remember their purpose

### 4. Combine Related Conditions
- Group related searches together
- For example: color + period + material

### 5. Check Field Types
- Text fields work with Contains/Equals
- Number fields work with Greater/Less than
- Array fields (tags, colors) work with Contains

## Keyboard Shortcuts

Currently, the Query Builder doesn't have dedicated keyboard shortcuts, but you can:
- Use Tab to navigate between fields
- Use Enter to submit forms
- Use Escape to close dialogs

## Limitations

1. **AND Logic Only**: All conditions must be true (AND logic). OR logic is not currently supported.
2. **Single Entity**: All conditions must be for the same primary entity type.
3. **Local Storage**: Saved queries are stored in browser localStorage (not synced across devices).
4. **Basic Operators**: Advanced operators like regex or fuzzy matching are not available.

## Future Enhancements

Planned improvements for future versions:

- [ ] OR logic support
- [ ] Cross-entity queries (e.g., "Items in Outfit X")
- [ ] Export query results to CSV/JSON
- [ ] Query result visualization
- [ ] Regex pattern matching
- [ ] Query templates
- [ ] Cloud sync for saved queries
- [ ] Query sharing with other users
- [ ] Query history
- [ ] Undo/Redo for query building

## Troubleshooting

### No Results Found
- Check if your conditions are too restrictive
- Verify the values you entered are correct
- Try using "Contains" instead of "Equals"
- Remove some conditions to broaden the search

### Query Not Saving
- Ensure you entered a query name
- Check if localStorage is enabled in your browser
- Try clearing browser cache and retry

### Operators Not Showing
- Make sure you selected a field first
- The entity and field determine available operators

### Results Not Loading
- Check your internet connection
- Verify the database is running
- Check browser console for errors

## API Integration

The Query Builder uses these API endpoints:

- `/api/items` - Search clothing items
- `/api/outfits` - Search outfits
- `/api/characters` - Search characters
- `/api/timeline` - Search timeline entries

Query parameters are constructed automatically from your conditions.

## Data Privacy

- Saved queries are stored locally in your browser
- No query data is sent to external servers
- Clearing browser data will remove saved queries
- Export/backup functionality coming soon

## Support

For issues or feature requests:
1. Check this guide first
2. Review the main documentation
3. Check the GitHub issues page
4. Contact the development team

---

*Last Updated: December 11, 2024*
*Version: 1.0*
