# SciFiLens - Interactive Science Fiction & Science Website

A modern, futuristic website exploring the science behind science-fiction movies. This is a production-quality frontend built with HTML, CSS, and vanilla JavaScript.

## 🌟 Features

- **Homepage** - Hero section with featured movies and science categories
- **Movie Library** - Searchable, filterable collection of sci-fi movies with scientific accuracy ratings
- **Movie Details** - Cinematic detail pages showing the science behind each film
- **Science Explorer** - Interactive library of scientific concepts with explanations
- **Interactive Experiments** - Physics calculators and visualizations (Time Dilation, Escape Velocity, Orbital Motion, Projectile Motion, Black Holes)
- **Quiz** - Science fiction science quiz with instant feedback
- **About Page** - Information about the SciFiLens mission
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

## 📁 Project Structure

```
SciFiLens/
├── index.html                 # Homepage
├── movies.html               # Movie library page
├── movie-detail.html         # Individual movie detail page
├── science.html              # Science explorer page
├── experiments.html          # Interactive experiments page
├── quiz.html                 # Quiz page
├── about.html                # About page
│
├── css/
│   └── styles.css            # Main stylesheet (5000+ lines of modern CSS)
│
├── js/
│   ├── main.js               # Shared functionality
│   ├── homepage.js           # Homepage logic
│   ├── movies.js             # Movie library filtering and display
│   ├── movie-detail.js       # Movie detail page logic
│   ├── science.js            # Science explorer logic
│   ├── experiments.js        # Physics experiments and visualizations
│   └── quiz.js               # Quiz logic and scoring
│
└── data/
    ├── movies.json           # Movie data (6 movies with full details)
    ├── science-concepts.json # 8 scientific concepts with explanations
    ├── quiz-questions.json   # 10 quiz questions with answers
    └── experiments.json      # 5 interactive physics experiments
```

## 🎨 Design Features

- **Dark space-inspired interface** with deep navy/black backgrounds
- **Glassmorphism cards** with blur effects and transparency
- **Smooth animations** - fade-in, slide-in, scale, float animations
- **Gradient text** - cyan to blue gradients for headings
- **Glowing effects** - neon-like glow shadows on interactive elements
- **Particle background** - twinkling stars in the background
- **Responsive grid layouts** - automatically adapts to different screen sizes
- **Interactive hover effects** - cards lift and glow on hover
- **Loading states** - smooth transitions between pages

## 🚀 Key Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern features:
  - CSS Grid and Flexbox
  - CSS Custom Properties (Variables)
  - CSS Animations and Transitions
  - Backdrop Filters (Glassmorphism)
  - Gradients and Shadows
  - Media Queries for responsiveness

- **Vanilla JavaScript** (ES6+) - No frameworks or dependencies:
  - Fetch API for loading JSON data
  - Event listeners and delegation
  - DOM manipulation
  - Canvas API for visualizations
  - Local state management

## 📊 Mock Data

### Movies
- **Interstellar** (4.5/5) - Black Holes, Time Dilation, Wormholes, Relativity
- **The Martian** (4.8/5) - Space Travel, Orbital Mechanics, Chemistry, Botany
- **Gravity** (3.5/5) - Orbital Mechanics, Zero Gravity, Space Debris
- **Arrival** (4.2/5) - Linguistics, Relativity, Cognitive Science, Alien Biology
- **2001: A Space Odyssey** (4.3/5) - Artificial Gravity, Orbital Mechanics, AI
- **Inception** (2.8/5) - Neuroscience, Psychology, Quantum Physics, Consciousness

### Science Concepts
1. **Black Holes** (Advanced) - Event horizons and singularities
2. **Time Dilation** (Intermediate) - Relativity effects on time
3. **Wormholes** (Advanced) - Einstein-Rosen bridges
4. **Relativity** (Intermediate) - Space, time, and gravity
5. **Space Travel** (Intermediate) - Propulsion and orbital mechanics
6. **Artificial Gravity** (Beginner) - Centrifugal force simulation
7. **Quantum Physics** (Advanced) - Subatomic phenomena
8. **Artificial Intelligence** (Intermediate) - Machine learning and consciousness

### Interactive Experiments
1. **Gravitational Time Dilation** - Adjust mass and distance to see time effects
2. **Escape Velocity** - Calculate minimum speed to escape gravitational pull
3. **Orbital Motion** - Explore circular orbital mechanics
4. **Projectile Motion** - Classic physics with adjustable angle and velocity
5. **Black Hole Event Horizon** - Calculate Schwarzschild radius

### Quiz
10 science-fiction science questions covering:
- Relativity and Black Holes
- Orbital Mechanics
- Linguistic Relativity
- Space Debris (Kessler Syndrome)
- Space Travel
- Artificial Gravity
- Fundamental Physics

## 🎯 Features Breakdown

### Homepage
- Hero section with inspiring tagline
- Featured movies carousel/grid
- Science categories grid
- Accuracy ratings display
- Footer with navigation

### Movie Library
- **Search functionality** - Real-time search across titles and descriptions
- **Filters**:
  - Genre filter
  - Release year filter
  - Scientific concepts filter
  - Accuracy rating filter
- **Sorting** - By popularity, accuracy, year, or alphabetically
- **Responsive grid** - Auto-adjusts column count

### Movie Details
- Large backdrop image
- Movie poster with emoji placeholder
- Complete metadata (director, runtime, genre, year)
- Scientific accuracy score with visual bar
- Movie description
- Key concepts tags
- **Science Behind the Movie** section with detailed explanations
- **Movie vs Reality** comparison cards
- Related movies suggestions

### Science Explorer
- **Grid of science concepts** with icons
- **Filter by difficulty** - Beginner, Intermediate, Advanced
- **Filter by category** - Physics, Astrophysics, Aerospace, Technology
- **Search functionality** - Find concepts by name or description
- **Interactive modal** with:
  - Full concept explanation
  - Mathematical formula
  - Real-world applications
  - Related movies
  - Resources for learning

### Interactive Experiments
- **Physics calculator interface**
- **Range sliders** for parameter adjustment
- **Real-time calculations** using physics formulas
- **Canvas visualizations** - Live graphics for each experiment
- **Result display** - Multiple calculated values
- **Educational explanations** - Understand the science

### Quiz
- **Start screen** with description
- **Progressive questions** - One at a time
- **Progress bar** - Visual feedback of quiz completion
- **Multiple choice** - Select from 4 options
- **Instant feedback** - See if answer is correct
- **Explanation system** - Learn why each answer is right
- **Movie connections** - Related sci-fi films
- **Results screen** with:
  - Final score and percentage
  - Score breakdown
  - Difficulty assessment
  - Retake option

## 💻 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (88+)
- Firefox (87+)
- Safari (14+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 How to Use

1. **Open the website** - Simply open `index.html` in your browser
2. **Navigate** - Use the navbar to move between pages
3. **Explore movies** - Visit the Movies page to search and filter
4. **Learn science** - Go to Science explorer for concept details
5. **Experiment** - Use interactive physics calculators
6. **Test knowledge** - Take the quiz to learn while having fun

## 🔌 Future Backend Integration

The project is structured for easy backend integration:

### API Endpoints (Ready to implement):
```
GET /api/movies                    # Get all movies
GET /api/movies/:id                # Get movie details
GET /api/science-concepts          # Get all concepts
GET /api/science-concepts/:id      # Get concept details
GET /api/experiments               # Get all experiments
GET /api/experiments/:id           # Get experiment details
GET /api/quiz/questions            # Get quiz questions
POST /api/quiz/submit              # Submit quiz answers
GET /api/users/:id                 # Get user profile
POST /api/users/register           # User registration
```

### Current JavaScript Structure for Easy Transition:
- All data is loaded via `fetchJSON()` function from `/data/*.json`
- To switch to backend, simply change the path from `data/movies.json` to `api/movies`
- No other code changes needed in most cases
- State management is ready for Redux/Vuex integration

## 📝 Code Quality

- **Well-organized** - Clear folder structure
- **Commented** - Important functions documented
- **DRY principle** - Reusable components and functions
- **Performance optimized** - Debounced search, throttled scrolling
- **Accessible** - Semantic HTML, ARIA labels where needed
- **Responsive** - Mobile-first design approach
- **No dependencies** - Pure HTML, CSS, JavaScript

## 🎓 Educational Value

Perfect for:
- Learning web development fundamentals
- Understanding modern CSS techniques
- Studying JavaScript patterns
- Science education integration
- Physics visualization
- UI/UX design inspiration

## 📱 Responsive Breakpoints

- **Desktop** (1024px+) - Full-featured experience
- **Tablet** (768px-1023px) - Optimized layout
- **Mobile** (320px-767px) - Touch-friendly interface

## 🌐 Potential Enhancements

- User accounts and progress tracking
- Dark/Light mode toggle
- Multiple language support
- Movie ratings and reviews
- Advanced physics calculations
- 3D visualizations with Three.js
- Real API backend integration
- Database for dynamic content
- Search engine optimization (SEO)
- Analytics integration

## 📄 License

This is a demonstration project. Feel free to use and modify for educational purposes.

---

**Created with ❤️ for science fiction and science enthusiasts**
