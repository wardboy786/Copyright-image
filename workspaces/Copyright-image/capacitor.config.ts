import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imagerights.ai',
  appName: 'ImageRightsAI',
  webDir: 'out',
  server: {
    // This is removed to rely on environment variables for the API URL,
    // which is a more flexible and standard approach.
    cleartext: true
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3940256099942544~3347511713', // Test app ID
    },
  },
};

export default config;
