import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imagerights.ai',
  appName: 'ImageRightsAI',
  webDir: 'out',
  server: {
    cleartext: true
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3940256099942544~3347511713', // Test app ID
    },
  },
};

export default config;
