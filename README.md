# CashTrack 💰

A modern tip tracking application built with Next.js 15, TypeScript, and Tailwind CSS. Perfect for service industry workers to track their daily tips and earnings.

## ✨ Features

- **Daily Tip Tracking**: Add tips with custom amounts or preset buttons (1€, 2.50€, 5€)
- **Beautiful Custom Coin Icons**: Unique SVG coin designs for each tip amount
- **Calendar View**: Visual calendar showing days with tips and daily summaries
- **Shift Management**: End shifts with optional notes
- **Statistics**: Track total shifts and average earnings
- **Mobile-First Design**: Optimized for mobile devices
- **German Localization**: Interface in German with Euro currency

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Custom SVG coin designs + Lucide React
- **State Management**: React hooks with localStorage

## 📱 Pages

- **Dashboard** (`/`): Overview of today's tips and recent shifts
- **Add Tips** (`/add-tips`): Add tips with custom coin icons
- **Calendar** (`/calendar`): Monthly view with tip history
- **Profile** (`/profile`): User settings (placeholder)

## 🎨 Custom Coin Icons

The app features beautiful custom SVG coin icons:
- **Coin1Icon**: Single coin for 1€ tips
- **Coin2Icon**: Two stacked coins for 2.50€ tips  
- **Coin5Icon**: Five stacked coins for 5€ tips
- **CustomCoinsIcon**: Multiple scattered coins for custom amounts

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cashtrack.git
   cd cashtrack
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
pnpm build
pnpm start
```

## 🚀 Deployment

This app is ready to deploy on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any platform supporting Node.js

### Vercel Deployment
1. Push to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## 📊 Data Storage

- **Local Storage**: All data is stored locally in the browser
- **No Backend Required**: Works completely offline
- **Privacy First**: Your tip data stays on your device

## 🎯 Usage

1. **Add Tips**: Use the preset buttons or enter custom amounts
2. **Track Progress**: View daily totals on the dashboard
3. **End Shifts**: Complete shifts with optional notes
4. **Review History**: Check the calendar for past earnings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for service industry workers** 