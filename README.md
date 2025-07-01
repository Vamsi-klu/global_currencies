# Interactive World Currency Explorer

A beautiful, interactive web application that provides comprehensive information about currencies used worldwide. Explore currencies from 197 countries and territories with real-time search, visual analytics, and responsive design.

## Features

- 📊 **Interactive Dashboard** - View key statistics about global currencies
- 🔍 **Real-time Search** - Filter by country, currency name, or currency code
- 📈 **Visual Analytics** - Bar chart showing the most commonly used currencies
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, professional design with smooth animations

## Screenshots

The application features:
- Statistics cards showing total countries, unique currencies, and most used currency
- Interactive bar chart highlighting currency distribution
- Searchable grid of currency cards with hover effects
- Real-time filtering as you type

## Usage

### Running Locally

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd global_currencies
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python 3
   cd curr
   python3 -m http.server 8000
   
   # Or using Node.js (if you have it installed)
   npx http-server curr -p 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000/c.html
   ```

### File Structure

```
global_currencies/
├── README.md           # Project documentation
└── curr/
    └── c.html         # Main application file
```

## Technology Stack

- **HTML5** - Semantic markup structure
- **Tailwind CSS** - Utility-first CSS framework via CDN
- **Chart.js** - Interactive charts and data visualization
- **Vanilla JavaScript** - No frameworks, pure JS for functionality
- **Google Fonts** - Inter font family for typography

## Data

The application includes comprehensive currency data for 197 countries and territories, featuring:
- Country/territory names
- Official currency names
- Currency codes with symbols
- Real-time statistics and analytics

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: The application uses modern JavaScript features and CDN resources, so an internet connection is required for external dependencies.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.