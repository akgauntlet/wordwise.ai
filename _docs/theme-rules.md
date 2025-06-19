# Theme Rules - WordWise.ai

Comprehensive theme specifications for consistent visual design implementation across the application.

---

## Color Palette

### **Primary Colors**
```css
/* Brand & Primary Actions */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;   /* Primary brand color */
--primary-600: #2563eb;   /* Primary interactive */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### **Semantic Colors**
```css
/* Success (Grammar corrections) */
--success-50: #ecfdf5;
--success-100: #d1fae5;
--success-200: #a7f3d0;
--success-300: #6ee7b7;
--success-400: #34d399;
--success-500: #10b981;
--success-600: #059669;   /* Grammar underline */
--success-700: #047857;
--success-800: #065f46;
--success-900: #064e3b;

/* Warning (Style suggestions) */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-200: #fde68a;
--warning-300: #fcd34d;
--warning-400: #fbbf24;
--warning-500: #f59e0b;
--warning-600: #d97706;   /* Style underline */
--warning-700: #b45309;
--warning-800: #92400e;
--warning-900: #78350f;

/* Error (Spelling errors) */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-200: #fecaca;
--error-300: #fca5a5;
--error-400: #f87171;
--error-500: #ef4444;
--error-600: #dc2626;     /* Error underline */
--error-700: #b91c1c;
--error-800: #991b1b;
--error-900: #7f1d1d;
```

### **Neutral Colors**
```css
/* Text & Backgrounds */
--neutral-50: #fafafa;    /* Light background */
--neutral-100: #f5f5f5;   /* Card backgrounds */
--neutral-200: #e5e5e5;   /* Borders */
--neutral-300: #d4d4d4;   /* Dividers */
--neutral-400: #a3a3a3;   /* Disabled text */
--neutral-500: #737373;   /* Secondary text */
--neutral-600: #525252;   /* Labels */
--neutral-700: #404040;   /* Body text */
--neutral-800: #262626;   /* Headings */
--neutral-900: #171717;   /* Primary text */
--neutral-white: #ffffff; /* Pure white */
```

### **Tailwind CSS Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      }
    }
  }
}
```

---

## Typography

### **Font Families**
```css
/* Primary Font Stack */
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 
            'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Editor Font Stack */
--font-editor: 'Inter', 'SF Pro Text', system-ui, -apple-system, 
               BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace (for code snippets) */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
            Consolas, 'Liberation Mono', 'Menlo', monospace;
```

### **Font Sizes & Line Heights**
```css
/* Text Scales */
--text-xs: 0.75rem;     /* 12px - captions, labels */
--text-sm: 0.875rem;    /* 14px - small text, UI elements */
--text-base: 1rem;      /* 16px - body text */
--text-lg: 1.125rem;    /* 18px - editor text, large body */
--text-xl: 1.25rem;     /* 20px - small headings */
--text-2xl: 1.5rem;     /* 24px - medium headings */
--text-3xl: 1.875rem;   /* 30px - large headings */
--text-4xl: 2.25rem;    /* 36px - extra large headings */

/* Line Heights */
--leading-tight: 1.25;   /* Headings */
--leading-snug: 1.375;   /* UI text */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.7;  /* Editor text */
--leading-loose: 2;      /* Spaced content */
```

### **Font Weights**
```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Labels, UI elements */
--font-semibold: 600;    /* Headings, emphasis */
--font-bold: 700;        /* Strong emphasis */
--font-extrabold: 800;   /* Brand text */
```

### **Tailwind Typography Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        editor: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.7rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      }
    }
  }
}
```

---

## Spacing & Sizing

### **Spacing Scale**
```css
/* Spacing Units (px values) */
--space-0: 0;
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

### **Layout Dimensions**
```css
/* Container Widths */
--width-editor: 50rem;    /* 800px - Editor max width */
--width-sidebar: 20rem;   /* 320px - Sidebar width */
--width-sidebar-collapsed: 3.75rem; /* 60px - Collapsed sidebar */
--width-container: 75rem; /* 1200px - Main container */

/* Heights */
--height-header: 4rem;    /* 64px - Header height */
--height-button: 2.5rem;  /* 40px - Standard button */
--height-button-lg: 3rem; /* 48px - Large button */
--height-input: 2.5rem;   /* 40px - Input fields */
```

### **Border Radius**
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;    /* Fully rounded */
```

---

## Shadows & Elevation

### **Shadow Definitions**
```css
/* Elevation Shadows */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Focus Shadows */
--shadow-focus-primary: 0 0 0 3px rgb(59 130 246 / 0.1);
--shadow-focus-error: 0 0 0 3px rgb(220 38 38 / 0.1);
--shadow-focus-success: 0 0 0 3px rgb(5 150 105 / 0.1);
```

### **Component-Specific Shadows**
```css
/* Editor Paper Effect */
--shadow-editor: 0 4px 6px -1px rgb(0 0 0 / 0.05), 
                 0 2px 4px -2px rgb(0 0 0 / 0.05),
                 inset 0 1px 0 0 rgb(255 255 255 / 0.05);

/* Card Shadows */
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.05), 
               0 1px 2px -1px rgb(0 0 0 / 0.05);
--shadow-card-hover: 0 4px 6px -1px rgb(0 0 0 / 0.1), 
                     0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Modal Shadows */
--shadow-modal: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

---

## Component Styling Specifications

### **Button Styles**
```css
/* Primary Button */
.btn-primary {
  @apply bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg 
         shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 
         focus:ring-offset-2 transition-colors duration-150;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-white text-neutral-700 font-medium px-4 py-2.5 rounded-lg 
         border border-neutral-300 shadow-sm hover:bg-neutral-50 
         focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
         transition-colors duration-150;
}

/* Ghost Button */
.btn-ghost {
  @apply text-neutral-600 font-medium px-4 py-2.5 rounded-lg 
         hover:bg-neutral-100 focus:ring-2 focus:ring-primary-500 
         focus:ring-offset-2 transition-colors duration-150;
}

/* Danger Button */
.btn-danger {
  @apply bg-error-600 text-white font-medium px-4 py-2.5 rounded-lg 
         shadow-sm hover:bg-error-700 focus:ring-2 focus:ring-error-500 
         focus:ring-offset-2 transition-colors duration-150;
}
```

### **Input Styles**
```css
/* Text Input */
.input-text {
  @apply w-full px-3 py-2.5 text-base border border-neutral-300 
         rounded-lg bg-white placeholder-neutral-400 
         focus:border-primary-500 focus:ring-1 focus:ring-primary-500 
         focus:outline-none transition-colors duration-150;
}

/* Input Error State */
.input-error {
  @apply border-error-500 focus:border-error-500 focus:ring-error-500;
}

/* Input Success State */
.input-success {
  @apply border-success-500 focus:border-success-500 focus:ring-success-500;
}
```

### **Card Styles**
```css
/* Base Card */
.card {
  @apply bg-white rounded-xl border border-neutral-200 shadow-sm 
         overflow-hidden;
}

/* Interactive Card */
.card-interactive {
  @apply card hover:shadow-md hover:border-neutral-300 
         transition-all duration-200 cursor-pointer;
}

/* Card Header */
.card-header {
  @apply px-6 py-4 border-b border-neutral-200 bg-neutral-50/50;
}

/* Card Body */
.card-body {
  @apply px-6 py-4;
}

/* Card Footer */
.card-footer {
  @apply px-6 py-4 border-t border-neutral-200 bg-neutral-50/50;
}
```

### **Suggestion Underlines**
```css
/* Spelling Error Underline */
.suggestion-spelling {
  border-bottom: 2px wavy #dc2626;
  text-decoration: none;
}

/* Grammar Error Underline */
.suggestion-grammar {
  border-bottom: 2px wavy #059669;
  text-decoration: none;
}

/* Style Suggestion Underline */
.suggestion-style {
  border-bottom: 2px wavy #d97706;
  text-decoration: none;
}

/* Underline Hover Effects */
.suggestion-spelling:hover,
.suggestion-grammar:hover,
.suggestion-style:hover {
  background-color: rgba(0, 0, 0, 0.02);
  cursor: pointer;
}
```

---

## Animation & Transition Specifications

### **Transition Durations**
```css
--duration-fast: 150ms;      /* Quick interactions */
--duration-normal: 200ms;    /* Standard transitions */
--duration-slow: 300ms;      /* Complex animations */
--duration-slower: 500ms;    /* Page transitions */
```

### **Easing Functions**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### **Common Animations**
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In From Right */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Pulse (for loaders) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Responsive Breakpoints

### **Breakpoint Definitions**
```css
/* Mobile First Breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

### **Tailwind Breakpoint Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

---

## Implementation Examples

### **Editor Container**
```jsx
<div className="max-w-4xl mx-auto px-6 py-8">
  <div className="bg-white rounded-xl border border-neutral-200 shadow-sm 
                  p-8 focus-within:ring-2 focus-within:ring-primary-500 
                  focus-within:ring-offset-2 transition-all duration-200">
    {/* Editor content */}
  </div>
</div>
```

### **Suggestion Sidebar**
```jsx
<aside className="w-80 bg-neutral-50 border-l border-neutral-200 
                  h-full overflow-y-auto">
  <div className="p-6 space-y-6">
    {/* Sidebar content */}
  </div>
</aside>
```

### **Document Card**
```jsx
<div className="card card-interactive group">
  <div className="card-body">
    <h3 className="text-lg font-semibold text-neutral-800 
                   group-hover:text-primary-600 transition-colors">
      Document Title
    </h3>
    <p className="text-sm text-neutral-500 mt-2">
      Last edited 2 hours ago
    </p>
  </div>
</div>
```

### **Suggestion Tooltip**
```jsx
<div className="bg-white border border-neutral-200 rounded-lg shadow-lg 
                p-4 max-w-sm animate-in fade-in-0 zoom-in-95 
                duration-200">
  <p className="text-sm font-medium text-neutral-800">
    Grammar Suggestion
  </p>
  <p className="text-sm text-neutral-600 mt-1">
    Consider using "an" instead of "a" before vowel sounds.
  </p>
  <div className="flex gap-2 mt-3">
    <button className="btn-primary text-xs px-3 py-1">
      Apply
    </button>
    <button className="btn-ghost text-xs px-3 py-1">
      Dismiss
    </button>
  </div>
</div>
```

---

This comprehensive theme rules document provides the foundation for consistent visual implementation across WordWise.ai, ensuring a cohesive and professional user experience that supports ESL learners in their writing journey. 
