# Lisar

Lisar is a platform that makes crypto staking accessible to everyone. Users can earn up to 68% APY by staking on blockchain networks using their local currency, without needing any crypto knowledge.


## Requirements

- Node.js 18 or higher
- npm or pnpm

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://api.example.com
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes type checking)
- `npm run preview` - Preview production build



## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Sonner** - Toast notifications


## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure the build passes (`npm run build`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow the existing code style
- Ensure TypeScript types are correct
- Test your changes thoroughly
- Write meaningful commit messages

## Security

This is an admin dashboard with access to sensitive operations. Please:
- Never commit credentials or API keys
- Follow security best practices
- Report security issues privately

## License

ISC

## Support

For questions or issues, please open an issue on GitHub or contact the development team.

