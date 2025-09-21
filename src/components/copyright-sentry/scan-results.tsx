'use client';
import { type ScanResult, type OverallAssessment } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, AlertTriangle, ShieldAlert, FileText, Info, Users, RotateCcw } from 'lucide-react';

interface ScanResultsProps {
  scan: ScanResult;
  onScanAnother?: () => void;
}

const getAssessmentConfig = (assessment: OverallAssessment) => {
  switch (assessment) {
    case 'Safe to use':
      return {
        Icon: CheckCircle2,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        title: 'Safe to Use',
        description: 'Our analysis did not find any high-risk copyrighted elements.'
      };
    case 'Moderate':
      return {
        Icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        title: 'Moderate Risk',
        description: 'Some elements were found that may require attribution or have usage restrictions.'
      };
    case 'Copyright Detected':
      return {
        Icon: ShieldAlert,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        title: 'Copyright Detected',
        description: 'High-risk copyrighted elements were detected. Use of this image is not recommended.'
      };
    default:
      return {
        Icon: Info,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-border',
        title: 'Analysis Result',
        description: 'The scan has been completed.'
      };
  }
};

export function ScanResults({ scan, onScanAnother }: ScanResultsProps) {
  if (!scan) return null;

  const assessmentConfig = getAssessmentConfig(scan.analysis.overallAssessment);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-border">
            <Image
              src={scan.image}
              alt="Scanned image"
              fill
              className="object-contain"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cn("border-2 shadow-lg", assessmentConfig.borderColor, assessmentConfig.bgColor)}>
        <CardHeader className="flex flex-col items-center text-center gap-3 p-6">
           <assessmentConfig.Icon className={cn("w-12 h-12", assessmentConfig.color)} />
          <div>
            <CardTitle className={cn("text-2xl font-bold", assessmentConfig.color)}>{assessmentConfig.title}</CardTitle>
            <CardDescription className="text-sm text-foreground/80 mt-1">{assessmentConfig.description}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      {scan.analysis.breakdown.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Analysis Breakdown</CardTitle>
            <CardDescription>The following elements were identified in the image.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {scan.analysis.breakdown.map((element, index) => (
                <li key={index} className="flex gap-4 p-4 rounded-lg bg-secondary/50 border">
                  <FileText className="w-5 h-5 mt-1 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-base">{element.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{element.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {scan.analysis.ownerDetails && scan.analysis.ownerDetails.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            <CardTitle className="text-xl font-semibold">Potential Owner Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Likely copyright owners for the detected elements.</CardDescription>
            <ul className="space-y-3 mt-4">
              {scan.analysis.ownerDetails.map((detail, index) => (
                <li key={index} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-secondary/50 border">
                  <span className="font-semibold">{detail.element}:</span>
                  <span className="text-muted-foreground">{detail.owner}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-amber-500/10 border-amber-500/20 shadow-lg">
        <CardHeader className="flex flex-row items-center gap-3">
          <Info className="w-6 h-6 text-amber-400"/>
          <CardTitle className="text-amber-400 text-lg">Important Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This analysis is AI-generated and for informational purposes only. It is not legal advice. Please double-verify the results before using the image, especially for commercial purposes.
          </p>
          <p>
            Remember that even if the subjects in an image are not copyrighted, the photograph or artwork itself is the intellectual property of its creator. Using an image without permission can be a copyright violation.
          </p>
        </CardContent>
      </Card>

      {onScanAnother && (
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={onScanAnother} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 shadow-lg shadow-accent/20">
            <RotateCcw className="mr-2 h-4 w-4" />
            Scan Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
