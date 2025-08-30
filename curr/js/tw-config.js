// Tailwind CDN config for theme + dark mode
window.tailwind = {
  config: {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          aurora: {
            50: '#f5f7ff', 100: '#eef2ff', 200: '#e0e7ff', 300: '#c7d2fe', 400: '#a5b4fc',
            500: '#818cf8', 600: '#6366f1', 700: '#4f46e5', 800: '#4338ca', 900: '#3730a3'
          },
          blossom: {
            50: '#fff0f7', 100: '#ffe4f1', 200: '#ffd0e6', 300: '#ffb3d7', 400: '#ff8ec2',
            500: '#f472b6', 600: '#ec4899', 700: '#db2777', 800: '#be185d', 900: '#9d174d'
          },
          mint: {
            50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
            500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b'
          }
        },
        boxShadow: {
          glow: '0 10px 25px rgba(99,102,241,0.25), 0 4px 15px rgba(236,72,153,0.2)'
        }
      }
    }
  }
};

