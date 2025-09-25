import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <CardDescription>Last Updated: September 21, 2025</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
            <p>Photorights AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "Service").</p>
            
            <h3 className="font-semibold text-foreground pt-4">1. Information We Collect</h3>
            <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
            <ul className="list-disc list-inside space-y-2">
                <li><span className="font-medium">Image Data:</span> We temporarily process the images you upload to perform the copyright analysis. We also store a local copy of your scan history, including these images, on your device.</li>
                <li><span className="font-medium">Usage Data:</span> We may automatically collect information when you access and use the Service, such as your device type and IP address for analytics purposes. This data is stored locally and is not tied to your personal identity.</li>
                <li><span className="font-medium">Scan History:</span> All data related to your scans, including images and analysis results, is stored exclusively in your browser's local storage on your device. We do not have access to this information.</li>
            </ul>

            <h3 className="font-semibold text-foreground pt-4">2. Use of Your Information</h3>
            <p>We use the information we collect in the following ways:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>To provide, operate, and maintain our Service.</li>
                <li>To perform the core function of analyzing your uploaded images for potential copyright issues.</li>
                <li>To manage your free scan limit and premium subscription status.</li>
                <li>To improve our Service. Note: We do not use your uploaded images to train our AI models.</li>
            </ul>

            <h3 className="font-semibold text-foreground pt-4">3. Disclosure of Your Information</h3>
            <p>We do not sell, trade, or otherwise transfer your personally identifiable information. However, we may share information with third-party service providers for the purpose of operating our service:</p>
            <ul className="list-disc list-inside space-y-2">
                <li><span className="font-medium">AI Service Providers:</span> Your uploaded images are sent to our third-party AI provider (Google Generative AI) for analysis. Their use of your data is governed by their own privacy policies. We do not share any other personal information with them.</li>
            </ul>

            <h3 className="font-semibold text-foreground pt-4">4. Data Storage and Security</h3>
            <p>Your scan history, which includes your uploaded images and the corresponding analysis results, is stored solely on your device within your browser's local storage. You have full control over this data. You can clear your history at any time through the app's settings, which will permanently delete all stored scan data from your device. We take reasonable measures to protect your information, but no security system is impenetrable.</p>

            <h3 className="font-semibold text-foreground pt-4">5. Children's Privacy</h3>
            <p>Our Service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.</p>

            <h3 className="font-semibold text-foreground pt-4">6. Changes to This Privacy Policy</h3>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h3 className="font-semibold text-foreground pt-4">7. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:ecoliwears@gmail.com" className="text-primary underline">ecoliwears@gmail.com</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
