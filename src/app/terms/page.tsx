import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Use</CardTitle>
          <CardDescription>Last Updated: September 21, 2025</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
            <h3 className="font-semibold text-foreground">1. Acceptance of Terms</h3>
            <p>By downloading, accessing, or using the Photorights AI mobile application ("Service"), you agree to be bound by these Terms of Use ("Terms"). If you disagree with any part of the terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
            
            <h3 className="font-semibold text-foreground pt-4">2. Description of Service</h3>
            <p>Photorights AI provides an AI-powered image analysis tool to help users identify potential copyrighted elements within an image. The analysis provided is for informational purposes only and does not, under any circumstances, constitute legal advice. We are not a law firm and do not provide legal services. You are solely responsible for any actions you take based on the information provided by the Service.</p>
            
            <h3 className="font-semibold text-foreground pt-4">3. User Responsibilities and Conduct</h3>
            <p>You agree to use the Service responsibly. You are solely responsible for the images you upload and for ensuring that you have the necessary rights or permissions to do so. You agree not to upload content that is illegal, defamatory, obscene, or infringing on the rights of others.</p>
            
            <h3 className="font-semibold text-foreground pt-4">4. Subscription and Payments</h3>
            <p>The Service may offer free and paid subscription plans ("Premium").</p>
            <ul className="list-disc list-inside space-y-2">
                <li><span className="font-medium">Free Tier:</span> The free tier is subject to limitations, such as a daily limit on the number of scans. We reserve the right to change these limitations at any time.</li>
                <li><span className="font-medium">Premium Subscription:</span> A Premium subscription removes these limitations. Subscriptions are managed through the Google Play Store and are subject to its terms and conditions. Subscriptions will automatically renew unless canceled by you through your Google Play account settings at least 24 hours before the end of the current period.</li>
                <li><span className="font-medium">Rewarded Ads:</span> For users on the free tier, we may offer the ability to earn additional scans by watching rewarded video advertisements.</li>
            </ul>
            
            <h3 className="font-semibold text-foreground pt-4">5. Intellectual Property</h3>
            <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Photorights AI and its licensors. You retain full ownership of the images you upload. By using the Service, you grant us a limited, non-exclusive, worldwide, royalty-free license to use, process, and transmit your uploaded images for the sole purpose of providing the analysis service to you.</p>

            <h3 className="font-semibold text-foreground pt-4">6. Disclaimer of Warranties</h3>
            <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The AI-generated analysis may contain inaccuracies, errors, or omissions. We make no warranties, express or implied, regarding the accuracy, completeness, reliability, or suitability of the information provided. Your use of the Service is at your sole risk. Always consult with a qualified legal professional for advice on copyright and intellectual property matters.</p>

            <h3 className="font-semibold text-foreground pt-4">7. Limitation of Liability</h3>
            <p>In no event shall Photorights AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            
            <h3 className="font-semibold text-foreground pt-4">8. Changes to Terms</h3>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by updating the "Last Updated" date of these Terms. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

            <h3 className="font-semibold text-foreground pt-4">9. Contact Us</h3>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:ecoliwears@gmail.com" className="text-primary underline">ecoliwears@gmail.com</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
