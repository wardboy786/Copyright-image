import { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: This is your live Vercel deployment URL.
const LIVE_URL = 'https://copyright-image.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.imagerights.ai',
  appName: 'ImageRights AI',
  // When 'server.url' is set, 'webDir' is not used by Capacitor for the build.
  // The 'out' directory is still used by 'npm run build' for Vercel deployment.
  webDir: 'out', 
  server: {
    // This is the Vercel URL that the native app will use to fetch the web content
    // and make API calls to the serverless functions.
    url: LIVE_URL,
    // When running in dev with live-reload, you can temporarily comment out the `url` above
    // and uncomment the following lines to use your local dev server.
    // hostname: 'localhost:3000',
    // androidScheme: 'http',
    // iosScheme: 'http',
    cleartext: true, // Allow http for local development.
  },
  plugins: {
    CapacitorAssets: {
      icon: {
        path: 'public/images/logo.svg'
      },
      splash: false // Explicitly disable splash screen generation
    }
  },
};

export default config;
