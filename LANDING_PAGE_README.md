# 301st RRIBn Landing Page

## Overview
Professional landing page for the **301st Ready Reserve Infantry Battalion Personnel Management System**.

## ✅ Completed Features

### 1. **Navigation Bar**
- Fixed top navigation with Philippine Army logo
- Responsive mobile menu
- Quick links: HOME, CAPABILITIES, ABOUT
- SIGN IN and REGISTER action buttons
- Smooth scroll to sections

### 2. **Hero Section**
- Full-screen hero with military background image
- Bold battalion title and subtitle
- Animated scroll indicator
- Gradient overlay for text readability

### 3. **Features Section**
- "Administrative Capabilities" showcase
- Three feature cards:
  - **Personnel Management** - Role-based access control
  - **Document Validation** - Blockchain-backed security
  - **Training Tracking** - Comprehensive attendance system
- Hover effects and animations
- Icon integration
- Feature lists with checkmarks

### 4. **Footer**
- Battalion contact information
- Camp Gen. Manuel Tinio location
- Quick navigation links
- Email: arescom.rmis@gmail.com
- Development credits

## 🎨 Design System

### Color Palette
- **Navy Blue** (#0B2238) - Primary color
- **Navy Blue 800** (#0F2F47) - Secondary shade
- **Yellow/Gold** (#F4B942) - Accent color
- **Red** (#D63030) - Highlight labels
- **White** - Text and backgrounds

### Typography
- System fonts (Apple, Segoe UI, Roboto)
- Bold headings for impact
- Clean, readable body text

### Components
- **Button** - Three variants (primary, secondary, outline)
- **Card** - Elevation with hover effects
- **Container** - Responsive max-width wrapper

## 📁 File Structure

```
src/
├── app/
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles with custom colors
├── components/
│   ├── Navbar.tsx         # Navigation component
│   ├── Hero.tsx           # Hero section
│   ├── Features.tsx       # Features showcase
│   ├── Footer.tsx         # Footer section
│   └── ui/
│       ├── Button.tsx     # Reusable button
│       ├── Card.tsx       # Reusable card
│       └── Container.tsx  # Responsive container
└── public/
    └── images/
        ├── logo.jpg       # Philippine Army logo
        └── hero-bg.jpg    # Military background
```

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```

Visit: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 📱 Responsive Design

The landing page is fully responsive:
- **Mobile** (< 768px) - Stacked layout, hamburger menu
- **Tablet** (768px - 1024px) - 2-column grid
- **Desktop** (> 1024px) - 3-column grid, full navigation

## 🎯 Based on Design Reference

Design inspired by the UI screenshots in:
- `DEVELOPMENT_GUIDE/REFERENCE/UI/`

## 🔗 Key Technologies

- **Next.js 15.5.4** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS 4** - Styling
- **Turbopack** - Fast bundler

## 📝 Next Steps

1. Add authentication pages (Sign In/Register)
2. Create dashboard for different user roles
3. Implement RIDS management interface
4. Build document upload/validation system
5. Develop training management module
6. Integrate prescriptive analytics engine

## 👥 Credits

**Developed by:**
National University - College of Computing and Information Technology
Capstone Project Team

**Client:**
301st Ready Reserve Infantry Battalion
Philippine Army Reserve Command

---

**Last Updated:** October 2, 2025
