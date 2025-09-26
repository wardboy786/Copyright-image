'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star, ZapOff } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { type Offer, type Product } from '@/hooks/use-billing';


const features = [
  'Unlimited Daily Scans',
  'Ad-Free Experience',
  'Priority Customer Support',
];

export default function PremiumPage() {
  const { billing } = useAppContext();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const monthlyProduct = billing.getMonthlyPlan();
  const yearlyProduct = billing.getYearlyPlan();

  const handlePurchase = async (offer: Offer | undefined) => {
    if (!offer || !billing.products.length) {
        toast({ title: 'Plan Not Available', description: 'This subscription plan is not currently available.', variant: 'destructive' });
        return;
    }
    setIsPurchasing(offer.id);
    try {
        await billing.purchase(offer as any); 
        toast({ title: 'Purchase Successful!', description: 'You are now a Premium member.' });
    } catch (error: any) {
        console.error('Purchase failed', error);
        // Don't show a toast for user cancellation
        if (error?.code !== 6) { // 6 is CdvPurchase.ErrorCode.PAYMENT_CANCELLED
            toast({ title: 'Purchase Failed', description: error.message || 'An error occurred during the purchase process.', variant: 'destructive' });
        }
    } finally {
        setIsPurchasing(null);
    }
  };
  
  const handleRestore = async () => {
    try {
        await billing.restorePurchases();
        toast({ title: 'Purchases Restored', description: 'Your previous purchases have been restored.' });
    } catch (e: any) {
        toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
    }
  }

  const renderContent = () => {
    if (billing.isLoading) {
        return (
             <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/2 mx-auto" />
            </div>
        )
    }

    if (billing.isPremium) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <Check className="w-10 h-10 text-green-500"/>
                        </div>
                    </div>
                    <CardTitle className="text-3xl">You are Premium!</CardTitle>
                    <CardDescription>You have unlocked all features of Photorights AI.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button variant="link" onClick={() => window.location.reload()}>Refresh Page</Button>
                </CardContent>
            </Card>
        )
    }
    
    if (!monthlyProduct || !yearlyProduct) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <ZapOff className="w-10 h-10 text-red-500"/>
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Billing Not Available</CardTitle>
                    <CardDescription>Could not connect to the app store. This feature is only available on mobile devices. Please check your connection and try again.</CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    const monthlyOffer = monthlyProduct?.offers.find(o => o.id === 'monthly-plan');
    const yearlyOffer = yearlyProduct?.offers.find(o => o.id === 'yearly-free');
    const discount = yearlyOffer && monthlyOffer ? Math.round((1 - (yearlyOffer.price.amount / (monthlyOffer.price.amount * 12))) * 100) : 0;

    return (
      <Card className="w-full max-w-md shadow-xl overflow-hidden">
        <CardHeader className="text-center p-6 bg-muted/30">
          <Star className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Go Premium</CardTitle>
          <CardDescription>Unlock the full power of Photorights AI.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => setSelectedPlan('monthly')} className={cn("border-2 rounded-lg p-4 text-center relative", selectedPlan === 'monthly' ? 'border-primary' : 'border-border')}>
                <p className="font-semibold">Monthly</p>
                <p className="text-xl font-bold">{monthlyOffer?.price.formatted || '$4.99'}</p>
                <p className="text-xs text-muted-foreground">per month</p>
             </button>
             <button onClick={() => setSelectedPlan('yearly')} className={cn("border-2 rounded-lg p-4 text-center relative", selectedPlan === 'yearly' ? 'border-primary' : 'border-border')}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    3-Day Free Trial
                </div>
                {discount > 0 && 
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        Save {discount}%
                    </div>
                }
                <p className="font-semibold">Yearly</p>
                <p className="text-xl font-bold">{yearlyOffer?.price.formatted || '$39.99'}</p>
                 <p className="text-xs text-muted-foreground">per year</p>
             </button>
          </div>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-3 p-6 pt-0">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => handlePurchase(selectedPlan === 'monthly' ? monthlyOffer : yearlyOffer)}
            disabled={isPurchasing !== null}
          >
            {isPurchasing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isPurchasing ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`}
          </Button>
          <Button variant="ghost" onClick={handleRestore} disabled={billing.isLoading}>
            Restore Purchases
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="flex justify-center items-center py-8">
        {renderContent()}
    </div>
  );
}
