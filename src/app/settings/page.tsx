'use client';
import { useAppContext } from '@/hooks/use-app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, ChevronRight, Info, FileText, Mail } from 'lucide-react';
import Link from 'next/link';

const complianceLinks = [
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/contact', label: 'Contact Us', icon: Mail },
  { href: '/privacy', label: 'Privacy Policy', icon: FileText },
  { href: '/terms', label: 'Terms of Use', icon: FileText },
];

export default function SettingsPage() {
  const { isPremium, setPremiumStatus, clearHistory, isInitialized } = useAppContext();
  const { toast } = useToast();

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: 'History Cleared',
      description: 'Your scan history has been successfully deleted.',
    });
  };

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="premium-mode" className="font-semibold">Premium Status (Dev)</Label>
              <p className="text-sm text-muted-foreground">
                Simulate a premium account for testing purposes.
              </p>
            </div>
            <Switch
              id="premium-mode"
              checked={isPremium}
              onCheckedChange={setPremiumStatus}
              disabled={!isInitialized}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your local application data.</CardDescription>
        </CardHeader>
        <CardContent>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Scan History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  entire scan history from this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Legal</CardTitle>
            <CardDescription>Information about our policies and terms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <ul className="divide-y">
                {complianceLinks.map(link => (
                    <li key={link.href}>
                        <Link href={link.href}>
                            <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">{link.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
