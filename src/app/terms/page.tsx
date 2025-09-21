import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Use</CardTitle>
          <CardDescription>Last Updated: [Date]</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
            <p>This is a placeholder for your Terms of Use. In a real application, you would outline the rules and guidelines for using your service.</p>
            <h3 className="font-semibold text-foreground">1. Acceptance of Terms</h3>
            <p>By using ImageRights AI ("the Service"), you agree to be bound by these Terms of Use. If you do not agree, do not use the Service.</p>
            <h3 className="font-semibold text-foreground">2. Description of Service</h3>
            <p>The Service provides AI-generated analysis of images for potential copyright issues. This analysis is for informational purposes only and does not constitute legal advice.</p>
            <h3 className="font-semibold text-foreground">3. User Conduct</h3>
            <p>You agree not to use the service to upload illegal, harmful, or infringing content. You are solely responsible for the images you upload.</p>
            <h3 className="font-semibold text-foreground">4. Disclaimer of Warranties</h3>
            <p>The Service is provided "as is". We make no warranty that the analysis will be accurate or reliable. You should always consult with a legal professional for copyright matters.</p>
        </CardContent>
      </Card>
    </div>
  );
}
