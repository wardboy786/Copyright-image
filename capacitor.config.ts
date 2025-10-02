import { CapacitorConfig } from '@capacitor/cli';
import 'dotenv/config';

// IMPORTANT: This is your live Vercel deployment URL.
const LIVE_URL = process.env.LIVE_URL || 'http://localhost:3000';

const config: CapacitorConfig = {
  appId: 'com.photorights.ai',
  appName: 'Photorights AI',
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
    AdMob: {
      appId: {
        // The AdMob App ID for your Android app.
        android: 'ca-app-pub-8270549953677995~3019098622',
        // The AdMob App ID for your iOS app.
        ios: 'ca-app-pub-8270549953677995~3019098622' 
      }
    }
  }
};

export default config;
