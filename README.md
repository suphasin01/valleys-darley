# Landmeé Clone - Fashion E-commerce Website

สร้างเว็บไซต์แฟชั่น E-commerce แบบ Landmee.com ด้วย Next.js 14, TypeScript, และ Tailwind CSS

## 🚀 Features

- ✨ **Modern Design** - Responsive และสวยงามทุกอุปกรณ์
- 🎨 **Tailwind CSS** - Styling ที่ยืดหยุ่นและง่ายต่อการ custom
- 📱 **Mobile-First** - Optimized สำหรับ mobile, tablet, และ desktop
- 🖼️ **Next.js Image** - Automatic image optimization
- 🎯 **TypeScript** - Type-safe code

## 📁 Project Structure

```
landmee-clone/
├── app/
│   ├── components/
│   │   ├── Header.tsx          # Navigation bar
│   │   ├── Hero.tsx            # Hero section with banner
│   │   ├── ProductGrid.tsx     # Product grid display
│   │   ├── FeaturedCollections.tsx  # Featured collections
│   │   ├── AboutSection.tsx    # About section
│   │   └── Footer.tsx          # Footer with newsletter
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── public/
│   └── images/                 # Static images
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── postcss.config.mjs
```

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

หรือถ้ามีปัญหากับ npm proxy:

```bash
# ลองใช้ npm โดยตรง
npm install --registry https://registry.npmjs.org/

# หรือติดตั้ง dependencies เอง
npm install next react react-dom typescript @types/react @types/node @types/react-dom tailwindcss postcss autoprefixer
```

### 2. Run Development Server

```bash
npm run dev
```

เปิดเว็บไซต์ที่ [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

## 🎨 Components

### Header
- Fixed navigation bar
- Responsive mobile menu
- Search and cart icons
- Dropdown submenus

### Hero Section
- Full-screen banner
- Gradient overlay
- Call-to-action button
- Smooth scroll indicator

### Product Grid
- Responsive grid layout
- Hover effects
- Quick view overlay
- Product cards with images and prices

### Featured Collections
- Side-by-side showcase
- Image zoom on hover
- Shop now buttons

### About Section
- Video placeholder
- Brand story
- Responsive layout

### Footer
- Newsletter signup
- Social media links
- Quick links
- Contact information

## 📝 Customization

### แก้ไข Colors

แก้ไข `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // เพิ่มสีของคุณที่นี่
      },
    },
  },
}
```

### เพิ่ม Products

แก้ไข `app/components/ProductGrid.tsx`:

```typescript
const products: Product[] = [
  // เพิ่ม product ของคุณที่นี่
];
```

### เปลี่ยน Images

ใช้ images ของคุณเองในโฟลเดอร์ `public/images/` หรือใช้ remote images โดยระบุ URL ใน `next.config.mjs`

## 🔧 Configuration

### Next.js Config

`next.config.mjs` - ระบุ remote image patterns:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-domain.com',
    },
  ],
},
```

### TypeScript Config

`tsconfig.json` - Path aliases และ compiler options

## 🌐 Deployment

### Vercel (แนะนำ)

```bash
npm run build
vercel
```

### อื่นๆ

Build และ deploy ได้กับทุก platform ที่รองรับ Next.js เช่น:
- Netlify
- AWS Amplify
- Railway
- Render

## 📦 Dependencies

- **next** - React framework
- **react** - UI library
- **react-dom** - React DOM
- **typescript** - Type safety
- **tailwindcss** - Utility-first CSS
- **autoprefixer** - CSS vendor prefixes
- **postcss** - CSS transformations

## 🤝 Contributing

1. Fork โปรเจกต์
2. สร้าง feature branch
3. Commit changes
4. Push และสร้าง Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Credits

- Design inspired by [Landmee.com](https://landmee.com)
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

สร้างด้วย ❤️ โดย Claude Code
