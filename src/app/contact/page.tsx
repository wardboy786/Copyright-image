import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Contact Us</CardTitle>
          <CardDescription>We'd love to hear from you.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-center">
          <p>
            For support, feedback, or inquiries, please contact us at:
          </p>
          <p className="font-semibold text-foreground text-lg">
            contact@imagerights-ai.com
          </p>
          <p>
            (Note: This is a fictional contact for this demo application.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
