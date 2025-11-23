# Lisar Web App

The public-facing web application for Lisar - a platform that makes crypto staking simple and accessible to everyone.

## About Lisar

Lisar lets you earn up to 68% APY by staking on blockchain networks. You don't need any crypto knowledge - just deposit your regular money and start earning. We handle all the complex blockchain operations behind the scenes.

**Key Features:**
- Stake with fiat currency (no crypto required)
- Earn rewards up to 68% APY
- Currently supports Livepeer (BNB and Solana coming soon)
- Simple, user-friendly interface
- Withdraw your funds anytime

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


## Project Structure

```
apps/web/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── lib/            # Utilities and helpers
│   ├── routes/         # Route configuration
│   ├── screens/        # Page components
│   ├── services/       # API services
│   └── styles/         # Global styles
├── public/             # Static assets
└── index.html          # HTML entry point
```


## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run format` before committing
- Ensure all tests pass
- Write meaningful commit messages

## License

ISC

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
