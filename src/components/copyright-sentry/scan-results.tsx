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
  onScanAnother: () => void;
}

const getAssessmentConfig = (assessment: OverallAssessment) => {
  switch (assessment) {
    case 'Safe to use':
      return {
        Icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        title: 'Safe to Use',
      };
    case 'Moderate':
      return {
        Icon: AlertTriangle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        title: 'Moderate Risk',
      };
    case 'Copyright Detected':
      return {
        Icon: ShieldAlert,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        title: 'Copyright Detected',
      };
    default:
      return {
        Icon: Info,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-border',
        title: 'Analysis Result',
      };
  }
};


export function ScanResults({ scan, onScanAnother }: ScanResultsProps) {
  if (!scan) return null;

  const assessmentConfig = getAssessmentConfig(scan.analysis.overallAssessment);

  return (
    <div className="space-y-6">
        <Card className={cn("border-2", assessmentConfig.borderColor)}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                 <assessmentConfig.Icon className={cn("w-8 h-8", assessmentConfig.color)} />
                 <div>
                    <CardTitle className={cn("text-2xl", assessmentConfig.color)}>{assessmentConfig.title}</CardTitle>
                    <CardDescription>
                        Scanned on {format(new Date(scan.timestamp), "PPP 'at' p")}
                    </CardDescription>
                 </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="aspect-square relative rounded-lg overflow-hidden border">
                            <Image
                            src={scan.image}
                            alt="Scanned image"
                            fill
                            className="object-contain"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                         {scan.analysis.breakdown.length > 0 ? (
                             <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Analysis Breakdown</h3>
                                <ul className="space-y-3">
                                {scan.analysis.breakdown.map((element, index) => (
                                    <li key={index} className="flex gap-3 p-3 bg-card rounded-md border">
                                        <FileText className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">{element.name}</p>
                                            <p className="text-sm text-muted-foreground">{element.explanation}</p>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                             </div>
                         ) : (
                             <div className="flex items-center justify-center h-full rounded-md border border-dashed">
                                <div className="text-center p-8">
                                <p className="font-semibold">No Copyrighted Elements Detected</p>
                                <p className="text-sm text-muted-foreground">Our scan did not find any potential copyright infringements in this image.</p>
                                </div>
                            </div>
                         )}
                    </div>
                </div>
            </CardContent>
        </Card>

        {scan.analysis.ownerDetails && scan.analysis.ownerDetails.length > 0 && (
            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <CardTitle>Potential Owner Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Likely copyright owners for the detected elements.</CardDescription>
                     <ul className="space-y-3 mt-4">
                        {scan.analysis.ownerDetails.map((detail, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm">
                                <span className="font-semibold">{detail.element}:</span>
                                <span className="text-muted-foreground">{detail.owner}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )}
        
        <Card className="bg-muted/30 border border-amber-500/20">
            <CardHeader className="flex flex-row items-center gap-3">
                <Info className="w-6 h-6 text-amber-500"/>
                <CardTitle className="text-amber-500">Important Disclaimer</CardTitle>
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

        <div className="flex justify-center">
            <Button size="lg" onClick={onScanAnother}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Scan Another Image
            </Button>
        </div>
    </div>
  );
}
