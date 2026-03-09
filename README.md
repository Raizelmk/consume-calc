This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on GitHub Pages

This app is configured for static export and can be deployed to GitHub Pages.

### Automatic Deployment (Recommended)

1. Push this code to a GitHub repository
2. Go to your repository settings
3. Navigate to "Pages" in the sidebar
4. Under "Source", select "GitHub Actions"
5. The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy your site

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build the static export
npm run export

# The built files will be in the 'out' directory
# Upload the contents of the 'out' directory to your GitHub Pages branch
```

### Repository Setup

- If deploying to `username.github.io/repository-name`, uncomment and update the `basePath` and `assetPrefix` in `next.config.ts`
- The `.nojekyll` file prevents GitHub Pages from ignoring files starting with underscores
