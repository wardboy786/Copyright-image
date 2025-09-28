
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star, ZapOff, AlertCircle } from 'lucide-react';
import { useBilling, MONTHLY_PLAN_ID, YEARLY_PLAN_ID, MONTHLY_OFFER_ID, YEARLY_OFFER_ID } from '@/hooks/use-billing';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const features = [
  'Unlimited Daily Scans',
  'Ad-Free Experience',
  'Priority Customer Support',
];

export default function PremiumPage() {
  const { 
    isInitialized, 
    isLoading, 
    isPremium, 
    products, 
    isPurchasing, 
    error,
    purchase, 
    restorePurchases 
  } = useBilling();
  
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const monthlyProduct = products.find(p => p.id === MONTHLY_PLAN_ID);
  const yearlyProduct = products.find(p => p.id === YEARLY_PLAN_ID);
  
  const monthlyOffer = monthlyProduct?.offers.find(o => o.id === MONTHLY_OFFER_ID);
  const yearlyOffer = yearlyProduct?.offers.find(o => o.id === YEARLY_OFFER_ID);


  const handlePurchase = async () => {
    const productId = selectedPlan === 'monthly' ? MONTHLY_PLAN_ID : YEARLY_PLAN_ID;
    const offerId = selectedPlan === 'monthly' ? MONTHLY_OFFER_ID : YEARLY_OFFER_ID;
    const product = selectedPlan === 'monthly' ? monthlyProduct : yearlyProduct;
    const offer = selectedPlan === 'monthly' ? monthlyOffer : yearlyOffer;

    if (!product || !offer) {
        toast({ title: 'Plan Not Available', description: 'This subscription plan is not currently available. It may be loading or not configured.', variant: 'destructive' });
        return;
    }
    await purchase(productId, offerId); 
  };
  
  const handleRestore = async () => {
    try {
        await restorePurchases();
    } catch (e: any) {
        toast({ title: 'Restore Failed', description: e.message || 'Could not restore purchases.', variant: 'destructive' });
    }
  }
  
  const PropagationErrorDisplay = ({ onRetry }: { onRetry: () => void; }) => (
      <Card className="w-full max-w-md bg-amber-500/10 border-amber-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-amber-400">⏳ Subscriptions Loading</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground space-y-4">
            <p>
              Your subscription plans are being processed by Google Play.
              This can sometimes take a few hours after activation in the console.
            </p>
            <div className="text-left bg-background/50 p-3 rounded-md">
              <p className="font-bold text-foreground">What's happening:</p>
              <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                <li>Google is syncing your plans across its servers.</li>
                <li>Billing configurations are being validated.</li>
                <li>This is a normal part of the process.</li>
              </ul>
            </div>
             <p className="text-xs text-muted-foreground/80">
              Last checked: {new Date().toLocaleTimeString()}
            </p>
        </CardContent>
        <CardFooter className="flex-col gap-3">
           <Button onClick={onRetry}>
                Check Again
            </Button>
            <p className="text-xs text-muted-foreground/80">
              If this persists after 24 hours, check your Play Console setup.
            </p>
        </CardFooter>
      </Card>
  );


  const renderContent = () => {
    if (isLoading && !isInitialized) {
        return (
             <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/2 mx-auto" />
            </div>
        )
    }

    if (isPremium) {
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
                     <Button variant="outline" onClick={() => window.location.reload()}>Refresh Status</Button>
                </CardContent>
            </Card>
        )
    }
    
    if (error) {
        const isPropagationError = error?.includes('not currently available') || error?.includes('not found') || error?.includes('not available');
        if (isPropagationError) {
             return <PropagationErrorDisplay onRetry={() => window.location.reload()} />;
        }
        
         return (
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>
                    {error} Please check your connection or try again later.
                     <Button variant="link" onClick={() => window.location.reload()} className="p-0 h-auto ml-2">Retry</Button>
                </AlertDescription>
            </Alert>
        );
    }
    
    if (isInitialized && (!products || products.length === 0)) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <ZapOff className="w-10 h-10 text-red-500"/>
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Billing Not Available</CardTitle>
                    <CardDescription>Could not find any products. Please ensure you are on a real mobile device, have a network connection, and have enabled Google Play Services.</CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-full">Retry Connection</Button>
                </CardFooter>
            </Card>
        )
    }
    
    // Calculate discount only if both offers are valid
    const discount = (yearlyOffer && monthlyOffer && yearlyOffer.price.amount > 0 && monthlyOffer.price.amount > 0) 
        ? Math.round((1 - (yearlyOffer.price.amount / (monthlyOffer.price.amount * 12))) * 100) 
        : 0;

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
                <p className="text-xl font-bold">{monthlyOffer?.price.formatted || '...'}</p>
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
                <p className="text-xl font-bold">{yearlyOffer?.price.formatted || '...'}</p>
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
            onClick={handlePurchase}
            disabled={isPurchasing || isLoading}
          >
            {isPurchasing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isPurchasing ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`}
          </Button>
          <Button variant="ghost" onClick={handleRestore} disabled={isLoading || isPurchasing}>
            Restore Purchases
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="flex justify-center items-start py-8">
        {renderContent()}
    </div>
  );
}
