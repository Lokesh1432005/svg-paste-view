# 🎨 SVG Viewer & Editor

A modern, feature-rich SVG viewer and editor built with React and TypeScript. Upload, paste, edit, and export SVG graphics with an intuitive interface and powerful editing capabilities.

![SVG Viewer Screenshot](https://img.shields.io/badge/Status-Live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue) ![React](https://img.shields.io/badge/React-18+-61DAFB) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
<img width="1698" height="928" alt="Screenshot 2025-08-11 at 20 58 06" src="https://github.com/user-attachments/assets/199c7845-d671-47e7-a143-6040cf8aacdd" />

## ✨ Features

### 🚀 **Core Functionality**
- **Upload SVG Files**: Drag & drop or browse to upload SVG files
- **Paste SVG Code**: Directly paste SVG markup with syntax highlighting
- **Live Preview**: Real-time SVG rendering with zoom controls
- **Export Options**: Download as SVG or PNG (2x resolution)

### 🎯 **Advanced Editing**
- **Interactive Selection**: Click any SVG element to select and edit
- **Visual Inspector**: Edit text, colors, fonts, and stroke properties
- **Transform Controls**: Drag to move, resize with handles
- **Live Code Sync**: Changes reflect instantly in both preview and code

### 🎨 **Modern UI/UX**
- **Dark/Light Theme**: Seamless theme switching with system detection
- **Glass Morphism**: Modern frosted glass effects and backdrop blur
- **Brand Gradients**: Beautiful purple-to-cyan gradient accents
- **Smooth Animations**: Fade-in transitions and hover effects
- **Responsive Design**: Works perfectly on desktop and mobile

### 🛡️ **Security & Performance**
- **SVG Sanitization**: Automatic removal of malicious scripts and content
- **Optimized Rendering**: Efficient DOM manipulation and updates
- **Type Safety**: Full TypeScript coverage for reliability
- **Accessibility**: ARIA labels and keyboard navigation support

## 🖼️ Preview

The application features a clean, modern interface with:
- **Header**: Branded logo, theme toggle, and navigation
- **Dual Panel Layout**: Code editor on the left, live preview on the right
- **Inspector Panel**: Context-sensitive editing controls
- **Action Bar**: Export, copy, and utility functions

## 🛠️ Tech Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite for fast development and building
- **Code Editor**: CodeMirror with XML syntax highlighting
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS animations + Tailwind transitions
- **Theme**: CSS custom properties with dark/light modes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/bun
- Git for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/svg-paste-view.git

# Navigate to project directory
cd svg-paste-view

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## 📖 Usage Guide

### 1. **Upload SVG Files**
- Click "Choose file" or drag & drop SVG files onto the upload area
- Files are automatically validated and sanitized

### 2. **Paste SVG Code**
- Switch to "Paste code" tab
- Paste your SVG markup in the code editor
- Click "Render" to preview

### 3. **Edit SVG Elements**
- Click any element in the preview to select it
- Use the Inspector panel to modify:
  - Text content (for text elements)
  - Fill and stroke colors
  - Font family and size
  - Transform properties

### 4. **Transform Elements**
- **Move**: Drag the selection box
- **Resize**: Use the corner and edge handles
- **Zoom**: Use +/- controls in preview panel

### 5. **Export Your Work**
- **Copy**: Copy SVG code to clipboard
- **Download SVG**: Save as optimized SVG file
- **Download PNG**: Export as high-resolution PNG

## 🎨 Customization

### Theme Configuration
The app uses CSS custom properties for theming. Modify colors in `src/index.css`:

```css
:root {
  --brand: 262 83% 58%;        /* Primary brand color */
  --brand-2: 198 94% 60%;      /* Secondary brand color */
  --gradient-primary: linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand-2)) 100%);
}
```

### Component Styling
Components use Tailwind CSS with shadcn/ui. Customize in:
- `tailwind.config.ts` - Theme configuration
- `src/components/ui/` - Base component styles
- `src/index.css` - Global styles and utilities

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── SvgViewer.tsx      # Main editor component
│   └── theme-toggle.tsx   # Theme switching component
├── hooks/
│   ├── use-theme.tsx      # Theme management
│   └── use-toast.ts       # Toast notifications
├── pages/
│   ├── Index.tsx          # Main application page
│   └── NotFound.tsx       # 404 error page
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Root application component
├── main.tsx              # Application entry point
└── index.css             # Global styles and design system
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component modularity
- Add proper type definitions
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [CodeMirror](https://codemirror.net/) for the code editor
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

<div align="center">
  <p>Built with ❤️ using React and TypeScript</p>
  <p>
    <a href="https://github.com/your-username/svg-paste-view/issues">Report Bug</a> •
    <a href="https://github.com/your-username/svg-paste-view/issues">Request Feature</a>
  </p>
</div>
