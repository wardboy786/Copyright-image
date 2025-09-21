import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <CardDescription>Last Updated: [Date]</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
            <p>This is a placeholder for your Privacy Policy. In a real application, you would detail how you collect, use, and protect user data.</p>
            <h3 className="font-semibold text-foreground">1. Data We Collect</h3>
            <p>We collect information you provide directly to us, such as when you upload an image for analysis. All image data and scan results are stored locally on your device and are not transmitted to our servers for storage.</p>
            <h3 className="font-semibold text-foreground">2. How We Use Your Data</h3>
            <p>Uploaded images are sent to a third-party AI service for the sole purpose of copyright analysis. We do not use your images for any other purpose.</p>
            <h3 className="font-semibold text-foreground">3. Data Storage</h3>
            <p>Your scan history is stored in your browser's local storage. Clearing your browser data or using the "Clear History" function in the app settings will permanently delete this data.</p>
            <h3 className="font-semibold text-foreground">4. Third-Party Services</h3>
            <p>We use Google Generative AI for our analysis. Their privacy policy may also apply.</p>
        </CardContent>
      </Card>
    </div>
  );
}
