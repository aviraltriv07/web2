with open('css/styles.css', 'a', encoding='utf-8') as f:
    f.write('''

/* Responsive Formula and Grid Overrides */

/* Make sure flex and grid items can shrink */
.what-if-card,
.concept-card,
.movie-card,
.experiment-card,
.science-card,
.timeline-card,
.equation-card,
.card {
    min-width: 0;
    word-break: break-word;
}

/* KaTeX and formula specific containers */
.katex-display {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.75rem 0;
    margin: 0.5rem 0;
    box-sizing: border-box;
}

.katex {
    max-width: 100%;
}

.equation-display, .formula, .equation-card {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    box-sizing: border-box;
}

/* Ensure no inner wrapper inside the card forces expansion */
.what-if-card > div,
.concept-card > div,
.science-card > div,
.equation-card > div {
    max-width: 100%;
}

/* Custom scrollbar for formulas to match dark theme */
.katex-display::-webkit-scrollbar,
.equation-display::-webkit-scrollbar,
.formula::-webkit-scrollbar {
    height: 6px;
}

.katex-display::-webkit-scrollbar-track,
.equation-display::-webkit-scrollbar-track,
.formula::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.katex-display::-webkit-scrollbar-thumb,
.equation-display::-webkit-scrollbar-thumb,
.formula::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.4);
    border-radius: 3px;
}

.katex-display::-webkit-scrollbar-thumb:hover,
.equation-display::-webkit-scrollbar-thumb:hover,
.formula::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.7);
}

/* Additional specific overrides based on screenshot details */
/* Add comfortable padding to formula boxes */
div[style*="Cambria Math"] {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    box-sizing: border-box;
    padding: 0.75rem !important;
}

''')
