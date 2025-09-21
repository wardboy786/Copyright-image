'use client';
import { type ScanResult, type SafetyScore } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ScanResultsProps {
  scan: ScanResult;
}

const getBadgeVariant = (safetyScore: SafetyScore) => {
  switch (safetyScore) {
    case 'Safe to use':
      return 'bg-green-600 hover:bg-green-700';
    case 'Moderate':
      return 'bg-yellow-500 hover:bg-yellow-600 text-black';
    case 'Do not use':
      return 'bg-destructive hover:bg-destructive/90';
    default:
      return 'default';
  }
};

export function ScanResults({ scan }: ScanResultsProps) {
  if (!scan) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Details</CardTitle>
        <CardDescription>
          Scan performed on {format(new Date(scan.timestamp), "PPP 'at' p")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="aspect-w-1 aspect-h-1 relative rounded-lg overflow-hidden border">
            <Image
              src={scan.image}
              alt="Scanned image"
              width={400}
              height={400}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          {scan.elements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Element</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Safety Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scan.elements.map((element, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{element.name}</TableCell>
                    <TableCell>{element.type}</TableCell>
                    <TableCell>{(element.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      <Badge className={cn('text-white', getBadgeVariant(element.safetyScore))}>
                        {element.safetyScore}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex items-center justify-center h-full rounded-md border border-dashed">
                <div className="text-center p-8">
                  <p className="font-semibold">No Copyrighted Elements Detected</p>
                  <p className="text-sm text-muted-foreground">Our scan did not find any potential copyright infringements in this image.</p>
                </div>
              </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
