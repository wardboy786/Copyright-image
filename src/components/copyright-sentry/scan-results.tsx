'use client';
import { type ScanResult, type OverallAssessment } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, AlertTriangle, ShieldAlert, FileText, Info } from 'lucide-react';

interface ScanResultsProps {
  scan: ScanResult;
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


export function ScanResults({ scan }: ScanResultsProps) {
  if (!scan) return null;

  const assessmentConfig = getAssessmentConfig(scan.analysis.overallAssessment);

  return (
    <div className="space-y-6">
        <Card className={cn("border-2", assessmentConfig.borderColor)}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                 <assessmentConfig.Icon className={cn("w-8 h-8", assessmentConfig.color)} />
                 <div>
                    <CardTitle className={cn(assessmentConfig.color)}>{assessmentConfig.title}</CardTitle>
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
                                <h3 className="font-semibold">Analysis Breakdown:</h3>
                                <ul className="space-y-3">
                                {scan.analysis.breakdown.map((element, index) => (
                                    <li key={index} className="flex gap-3">
                                        <FileText className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
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
                <CardHeader>
                    <CardTitle>Potential Owner Details</CardTitle>
                    <CardDescription>Likely copyright owners for the detected elements.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-3">
                        {scan.analysis.ownerDetails.map((detail, index) => (
                            <li key={index}>
                                <span className="font-semibold">{detail.element}:</span>
                                <span className="text-muted-foreground ml-2">{detail.owner}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )}
        
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="w-5 h-5"/>
                    Important Disclaimer
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                    Even if the subject is not copyrighted, the photograph or image itself is the intellectual property of its creator. Use without permission can be a copyright violation.
                </p>
                <p>
                    This analysis is AI-generated and for informational purposes only. Please double-verify the results before using the image commercially.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
