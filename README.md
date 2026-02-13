# Nexo — Personal Productivity Dashboard

A lightweight, modern personal productivity dashboard that combines a focus timer, notes, tasks, code snippets, and quick navigation into a sleek, responsive web app built for deep work and learning.

<img width="3200" height="2000" alt="Screenshot (119)" src="https://github.com/user-attachments/assets/9d519c09-a51c-46b0-aa7e-f5c31e22c213" />


## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** (comes with Node.js)

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3001** (or the next available port).

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## ✨ Features

- **Focus Timer** — Pomodoro-style focus sessions with visual timer display
- **Notes** — Create, organize, and view your recent tech notes with minimalist design
- **Tasks** — Track pending tasks with progress indicators and completion status
- **Code Snippets** — Display and share code examples with syntax highlighting
- **Command Palette** — Fast navigation and actions (press `Ctrl+K` or `Cmd+K`)
- **Uiverse-Style Navigation** — Modern expanding sidebar with icon-to-label transitions
- **Mobile Responsive** — Fully optimized for desktop and mobile devices
- **Dark Theme** — Sophisticated dark mode with blue accent colors (Aura signature)

## 📂 Project Structure

```
Nexo/
├── src/
│   ├── components/          
│   │   ├── Dashboard.tsx    
│   │   ├── Header.tsx       
│   │   ├── LandingHero.tsx  
│   │   ├── Notes.tsx        
│   │   ├── Tasks.tsx       
│   │   ├── Focus.tsx       
│   │   ├── Profile.tsx      
│   │   ├── Settings.tsx     
│   │   └── ui/
│   │       ├── Avatar.tsx   
│   │       └── CommandPalette.tsx  
│   ├── js/                  
│   │   ├── storageManager.ts     
│   │   ├── db.ts                 
│   │   ├── focus.ts              
│   │   ├── notes.ts             
│   │   ├── tasks.ts              
│   │   └── ...                  
│   ├── types/
│   │   └── focus.ts        
│   ├── App.tsx              
│   ├── main.tsx             
│   ├── index.css           
│   └── styles.css           
├── public/
│   ├── manifest.json       
│   └── sw.js               
├── vite.config.ts           
├── tsconfig.json            
├── package.json            
├── README.md               
└── LICENSE                  
```

## 🛠 Development

### Key Technologies

- **React 18** — UI framework
- **TypeScript** — Type-safe development
- **Vite** — Ultra-fast build tool
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Smooth animations and transitions
- **Lucide Icons** — Beautiful icon library
- **TanStack React Query** — Data fetching and caching

### Fonts & Styling

- **Lora** — Serif font for headings (elegant, professional)
- **Dancing Script** — Handwriting-style accent font
- **Red Hat Text** — Sans-serif for body and UI text
- **Tailwind CSS** with custom theme variables in `src/index.css`

### Data Management

- **StorageManager** (`src/js/storageManager.ts`) handles all data persistence
- Data is stored in the browser's localStorage
- Mock data is available in `src/js/db.ts` for demo purposes
- When the app starts with no saved data, it displays mock notes and tasks

### Components & Views

| Component | Purpose |
|-----------|---------|
| `Dashboard.tsx` | Main dashboard with focus timer, recent notes, tasks, and code snippets |
| `Header.tsx` | Fixed navigation bar with Uiverse-style expanding menu |
| `CommandPalette.tsx` | Search & command launcher (Cmd/Ctrl+K) |
| `Avatar.tsx` | User profile avatar with fallback initials |
| `Notes.tsx` | Full notes management interface |
| `Tasks.tsx` | Task list and tracking |
| `Focus.tsx` | Full-screen focus mode |
| `Settings.tsx` | User preferences and theme toggle |

## 🎨 Customization

### Theme Variables

Edit `src/index.css` to customize colors:

```css
:root {
  --color-background: #020617;    /* Onyx black */
  --color-surface: #0f172a;       /* Dark blue surface */
  --color-text: #f8fafc;          /* Light text */
  --color-primary: #3b82f6;       /* Bright blue accent */
  --color-text-muted: #94a3b8;    /* Muted gray */
  --color-border: #1e293b;        /* Border color */
}
```

### Navigation Items

Modify the nav items in `src/components/Header.tsx`:

```tsx
const navItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "tasks", label: "Tasks", icon: CheckCircle },
  { id: "focus", label: "Focus", icon: Brain },
  { id: "settings", label: "Config", icon: SettingsIcon },
];
```

## 📱 Mobile Optimization

The app is fully responsive:
- **Desktop**: Full-featured UI with expanded navigation and larger components
- **Mobile**: Optimized touch targets, hidden labels on nav, adjusted spacing and typography
- Breakpoint: `md:` (768px+) for responsive utilities

## 🔒 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized, minified assets.


## 📝 Notes

- This is a **client-side only** app; all data is stored in the browser's localStorage
- For production, consider integrating a backend for cloud sync
- The focus timer uses the browser's Web Audio API for audio cues (when available)

## 🤝 Contributing

Feel free to fork, modify, and improve this project for your own use. Share improvements back if you find enhancements!

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.


---

**Made with ❤️ for deep work and productivity.**
