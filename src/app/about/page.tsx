import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">About ImageRights AI</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-center">
          <p>
            ImageRights AI is a powerful tool designed to help creators, marketers, and businesses protect themselves from copyright infringement. 
          </p>
          <p>
            Our advanced AI scans images to detect potential copyrighted elements, including logos, brand assets, characters, and more, giving you the confidence to use images safely.
          </p>
          <p>
            This application is a demonstration of AI capabilities and should be used for informational purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
