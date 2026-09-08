# SciFiLens - Quick Start Guide

## Getting Started

### No Installation Required!
This project uses **vanilla HTML, CSS, and JavaScript** - no build tools or dependencies needed.

### Steps to Run:

1. **Navigate to the project folder**:
   ```bash
   cd c:\Users\Admin\OneDrive\Desktop\web2
   ```

2. **Open in browser** - Use any of these methods:
   - **Double-click** `index.html` to open in your default browser
   - **Right-click** `index.html` → "Open with" → Choose your browser
   - **Drag & drop** `index.html` onto your browser window

3. **That's it!** The website is fully functional and ready to use.

## Project Features

### Pages
- ✅ **index.html** - Homepage with hero section
- ✅ **movies.html** - Movie library with search and filters
- ✅ **movie-detail.html** - Individual movie details with science explanations
- ✅ **science.html** - Interactive science concept explorer
- ✅ **experiments.html** - Physics calculators and visualizations
- ✅ **quiz.html** - Science fiction science quiz
- ✅ **about.html** - About SciFiLens

### CSS Features
- **Glassmorphism** - Frosted glass effect cards
- **Animations** - Smooth fade, slide, and scale animations
- **Gradients** - Beautiful color gradients
- **Responsive Design** - Works on desktop, tablet, mobile
- **Modern Layout** - CSS Grid and Flexbox

### JavaScript Features
- **No dependencies** - Pure vanilla JS
- **Data loading** - Mock JSON data in `/data/` folder
- **Interactivity** - Filter, search, calculate, quiz
- **State management** - Simple client-side state
- **Canvas graphics** - Physics visualizations

## File Structure

```
web2/
├── index.html                    # Homepage
├── movies.html                   # Movie library
├── movie-detail.html             # Movie details
├── science.html                  # Science explorer
├── experiments.html              # Physics experiments
├── quiz.html                     # Quiz page
├── about.html                    # About page
│
├── css/
│   └── styles.css               # 5000+ lines of styling
│
├── js/
│   ├── main.js                  # Shared utilities
│   ├── homepage.js              # Homepage logic
│   ├── movies.js                # Movie filtering
│   ├── movie-detail.js          # Movie details
│   ├── science.js               # Science explorer
│   ├── experiments.js           # Physics calculations
│   └── quiz.js                  # Quiz logic
│
├── data/
│   ├── movies.json              # 6 movies
│   ├── science-concepts.json    # 8 concepts
│   ├── quiz-questions.json      # 10 questions
│   └── experiments.json         # 5 experiments
│
├── README.md                     # Documentation
└── QUICKSTART.md               # This file
```

## What's Included

### 6 Featured Movies
1. **Interstellar** (4.5/5) ⭐
2. **The Martian** (4.8/5) ⭐
3. **Gravity** (3.5/5) ⭐
4. **Arrival** (4.2/5) ⭐
5. **2001: A Space Odyssey** (4.3/5) ⭐
6. **Inception** (2.8/5) ⭐

### 8 Science Concepts
- Black Holes 🕳️
- Time Dilation ⏰
- Wormholes 🌉
- Relativity ⚡
- Space Travel 🚀
- Artificial Gravity ⬆️
- Quantum Physics 🌊
- Artificial Intelligence 🤖

### 5 Interactive Experiments
- Gravitational Time Dilation
- Escape Velocity
- Orbital Motion
- Projectile Motion
- Black Hole Event Horizon

### 10 Quiz Questions
- Test your knowledge of science and sci-fi
- Get instant feedback with explanations
- Learn while you play

## Key Features to Try

### 1. Movie Search
- Go to **Movies** page
- Type in search box to find movies
- Filter by genre, year, concepts, accuracy
- Sort by popularity or accuracy

### 2. Movie Details
- Click any movie card
- See scientific accuracy breakdown
- Learn about concepts featured in the movie
- Compare movie depiction vs reality
- Find related movies

### 3. Science Explorer
- Visit **Science** page
- Filter by difficulty level
- Search for concepts
- Click any concept for detailed explanation
- See formulas, applications, and related movies

### 4. Physics Experiments
- Go to **Experiments** page
- Adjust sliders to change parameters
- See live calculations and visualizations
- Understand physics through interaction

### 5. Take the Quiz
- Start **Quiz** from navbar
- Answer 10 questions about science and sci-fi
- Get immediate feedback
- See your final score and results

## Design Highlights

### Color Scheme
- **Background**: Deep navy/black (#0a0e27)
- **Primary**: Bright blue (#0066ff)
- **Accent 1**: Cyan (#06b6d4)
- **Accent 2**: Purple (#a855f7)
- **Text**: White with gradients

### Typography
- **Headings**: Large, bold, gradient text
- **Body**: Clean, readable sans-serif
- **Code/Formulas**: Monospace font

### Animations
- Fade-in on page load
- Slide animations on scroll
- Hover effects on interactive elements
- Smooth transitions throughout

### Responsive Design
- **Desktop** (1024px+): Full layout with sidebar filters
- **Tablet** (768px-1023px): Adjusted grid, no sidebar
- **Mobile** (320px-767px): Single column, touch-friendly

## Browser Support

| Browser | Support | Version |
|---------|---------|---------|
| Chrome  | ✅ Yes  | 88+     |
| Firefox | ✅ Yes  | 87+     |
| Safari  | ✅ Yes  | 14+     |
| Edge    | ✅ Yes  | 88+     |
| Mobile  | ✅ Yes  | Modern  |

## Tips & Tricks

### Search Tips
- Search works across titles and descriptions
- Use partial words (e.g., "black" finds "Black Holes")
- Search is case-insensitive

### Filter Tips
- Combine multiple filters (genre + year + concept)
- Reset filters button clears all selections
- Filters update results in real-time

### Quiz Tips
- You can go back and change answers
- Feedback appears after selecting an answer
- Score updates as you progress
- Retake quiz to test again

### Mobile Usage
- Tap cards instead of click
- Hamburger menu for navigation
- Filters stack vertically
- Touch-friendly buttons and sliders

## How Data Works

### Loading Data
All data is stored in JSON files under `/data/`:

```javascript
// Example: Loading movie data
const moviesData = await fetchJSON('data/movies.json');
const movies = moviesData.movies;
```

### Data Structure Example

**Movie**:
```json
{
  "id": 1,
  "title": "Interstellar",
  "year": 2014,
  "scientificAccuracy": 4.5,
  "concepts": ["Wormholes", "Time Dilation", ...],
  "scientificConcepts": [...]
}
```

**Science Concept**:
```json
{
  "id": 1,
  "title": "Black Holes",
  "difficulty": "advanced",
  "formula": "r_s = 2GM/c²",
  "relatedMovies": [1, 3, 5]
}
```

## Future Enhancements

### To Add Backend:
1. Replace data loading paths:
   ```javascript
   // Change from:
   await fetchJSON('data/movies.json');
   // To:
   await fetchJSON('api/movies');
   ```

2. Create Express server with MongoDB

3. Add user authentication

4. Implement user ratings and reviews

### To Add Features:
- User accounts
- Save favorite movies
- Track quiz progress
- Add more movies (50+)
- Add more concepts (20+)
- Create user forums
- Add video tutorials
- Integrate with YouTube API

## Troubleshooting

### Issue: JSON files not loading
**Solution**: Make sure you're running from a web server, not file://
```bash
# Use Python's built-in server
python -m http.server 8000

# Or Node.js
npx http-server
```

### Issue: Styles not loading
**Solution**: Check browser console for errors. Ensure CSS folder is in same directory as HTML.

### Issue: JavaScript errors
**Solution**: Open browser DevTools (F12) and check Console tab for error messages.

### Issue: Mobile layout looks wrong
**Solution**: Check viewport meta tag in HTML head - should be present for responsive design.

## Development Tips

### Adding a New Movie:
1. Edit `data/movies.json`
2. Add movie object with all required fields
3. Save file
4. Page will automatically display new movie

### Changing Colors:
1. Edit `css/styles.css`
2. Find `:root { --primary-color: #0066ff; }`
3. Change color values
4. All elements using that variable update automatically

### Adding More Experiments:
1. Create new experiment in `data/experiments.json`
2. Add calculation function in `js/experiments.js`
3. Add visualization function using Canvas
4. Experiment appears automatically

## Performance

- **Fast loading** - All data loads instantly from JSON
- **Smooth animations** - 60fps CSS animations
- **Responsive** - Real-time filtering
- **Optimized** - Debounced search, lazy-loaded content
- **No frameworks** - Lightweight vanilla JavaScript

## Code Examples

### Search Implementation:
```javascript
const searchTerm = input.value.toLowerCase();
const results = movies.filter(movie => 
  movie.title.toLowerCase().includes(searchTerm)
);
```

### Filter Implementation:
```javascript
const filtered = movies.filter(movie => {
  if (selectedGenres.length > 0) {
    if (!selectedGenres.some(g => movie.genre.includes(g))) {
      return false;
    }
  }
  return true;
});
```

### Physics Calculation:
```javascript
const escapeVelocity = Math.sqrt((2 * G * M) / R);
```

## License & Credits

This project was created as a demonstration of modern web development practices and science education integration.

Feel free to use, modify, and learn from the code!

---

**Need help?** Check the console (F12) for helpful error messages, or review the code comments in the JavaScript files.

**Happy exploring! 🚀**
