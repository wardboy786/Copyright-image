'use client';
import { useAppContext } from '@/hooks/use-app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { Trash2, ChevronRight, Info, FileText, Mail, Sun, Moon, Laptop, Gem } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


const complianceLinks = [
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/contact', label: 'Contact Us', icon: Mail },
  { href: '/privacy', label: 'Privacy Policy', icon: FileText },
  { href: '/terms', label: 'Terms of Use', icon: FileText },
];

export default function SettingsPage() {
  const { isPremium, isInitialized, clearHistory, billing } = useAppContext();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: 'History Cleared',
      description: 'Your scan history has been successfully deleted.',
    });
  };

  const handleRestorePurchases = async () => {
    try {
      await billing.restorePurchases();
      toast({
        title: "Purchases Restored",
        description: "Your premium status has been updated.",
      });
    } catch (e) {
       toast({
        title: "Restore Failed",
        description: "We couldn't restore your purchases. Please try again later.",
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize the app's appearance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <Label htmlFor="theme-selector" className="font-semibold">Appearance</Label>
                <Tabs value={theme} onValueChange={setTheme} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="light" aria-label="Light mode">
                            <Sun className="h-5 w-5" />
                        </TabsTrigger>
                        <TabsTrigger value="dark" aria-label="Dark mode">
                            <Moon className="h-5 w-5" />
                        </TabsTrigger>
                        <TabsTrigger value="system" aria-label="System preference">
                            <Laptop className="h-5 w-5" />
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="font-semibold">Premium Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isInitialized ? (isPremium ? 'Active' : 'Not Active') : 'Loading...'}
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/premium">
                    <Gem className="mr-2 h-4 w-4" />
                    {isPremium ? 'Manage' : 'Upgrade'}
                  </Link>
                </Button>
            </div>
             <Button onClick={handleRestorePurchases} variant="outline" className="w-full">
                Restore Purchases
            </Button>
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

    