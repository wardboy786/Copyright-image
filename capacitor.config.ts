import { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: Set this to your live Vercel deployment URL.
const LIVE_URL = 'https://your-app.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.imagerightsai.app',
  appName: 'ImageRights AI',
  // webDir is not needed when using a server URL for production.
  // The 'out' directory is still used by Vercel for deployment.
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
    // Any plugin-specific configurations go here.
  },
};

export default config;
