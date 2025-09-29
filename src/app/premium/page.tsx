
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star, ZapOff, AlertCircle } from 'lucide-react';
import { useBilling, MONTHLY_PLAN_ID, YEARLY_PLAN_ID, MONTHLY_OFFER_ID, YEARLY_OFFER_ID } from '@/hooks/use-billing';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/in-app-logger';

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
    restorePurchases,
    forceCheck
  } = useBilling();
  
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Safely find products and offers
  const monthlyProduct = products.find(p => p.id === MONTHLY_PLAN_ID);
  const yearlyProduct = products.find(p => p.id === YEARLY_PLAN_ID);
  
  const monthlyOffer = monthlyProduct?.offers.find(o => o.id.includes(MONTHLY_OFFER_ID));
  // The paid offer for yearly is the one that does NOT include the free trial ID
  const yearlyPaidOffer = yearlyProduct?.offers.find(o => o.id.includes(YEARLY_PLAN_ID) && !o.id.includes(YEARLY_OFFER_ID));
  // The free trial offer specifically contains the yearly offer ID
  const yearlyFreeTrialOffer = yearlyProduct?.offers.find(o => o.id.includes(YEARLY_OFFER_ID));


  useEffect(() => {
    // Log product/offer availability when the component loads
    if (isInitialized && products.length > 0) {
      logger.log('🔍 PREMIUM PAGE: Products loaded.', {
        monthlyProduct: !!monthlyProduct,
        yearlyProduct: !!yearlyProduct,
        monthlyOffer: !!monthlyOffer,
        yearlyPaidOffer: !!yearlyPaidOffer,
        yearlyFreeTrialOffer: !!yearlyFreeTrialOffer,
      });
    }
  }, [isInitialized, products, monthlyProduct, yearlyProduct, monthlyOffer, yearlyPaidOffer, yearlyFreeTrialOffer]);


  const handlePurchase = async () => {
    logger.log('🔍 handlePurchase called with selected plan:', selectedPlan);

    const isYearly = selectedPlan === 'yearly';
    const product = isYearly ? yearlyProduct : monthlyProduct;
    // For yearly, prioritize the free trial offer if it exists, otherwise fall back to the paid offer
    const offer = isYearly ? (yearlyFreeTrialOffer || yearlyPaidOffer) : monthlyOffer;
    
    logger.log('🔍 Attempting purchase with:', { product, offer });

    if (!product || !offer || !offer.id) {
        logger.log('❌ No product or offer found for purchase call.', { product, offer });
        toast({ title: 'Plan Not Available', description: 'This subscription plan is not currently available. It may be loading or not configured.', variant: 'destructive' });
        return;
    }
    
    // The purchase function is now robust and will handle loading states
    await purchase(product.id, offer.id);
  };
  
  const handleRestore = async () => {
    await restorePurchases();
  }
  
  /**
   * A special UI to show when products haven't loaded from the store yet.
   * This is common on first app load or if there are network issues.
   */
  const PropagationErrorDisplay = ({ onRetry }: { onRetry: () => void; }) => (
      <Card className="w-full max-w-md bg-amber-500/10 border-amber-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-amber-400">⏳ Subscriptions Loading</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground space-y-4">
            <p>
              Your subscription plans are being loaded from the Google Play Store.
              This can sometimes take a few moments.
            </p>
            <div className="text-left bg-background/50 p-3 rounded-md">
              <p className="font-bold text-foreground">What's happening:</p>
              <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                <li>Connecting to the Google Play Store...</li>
                <li>Fetching product details and pricing...</li>
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
              If this persists, please check your internet connection.
            </p>
        </CardFooter>
      </Card>
  );


  const renderContent = () => {
    // Show a loading skeleton while the context is initializing
    if (isLoading && !isInitialized) {
        return (
             <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/2 mx-auto" />
            </div>
        )
    }

    // Main "You are Premium" screen
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
                     <Button variant="outline" onClick={forceCheck}>Refresh Status</Button>
                </CardContent>
            </Card>
        )
    }
    
    // Display any persistent errors
    if (error) {
         return (
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>
                    {error} Please check your connection or try again later.
                     <Button variant="link" onClick={forceCheck} className="p-0 h-auto ml-2">Retry</Button>
                </AlertDescription>
            </Alert>
        );
    }
    
    // Handle the case where initialization is done but no products are available
    if (isInitialized && (!products || products.length === 0 || !monthlyProduct || !yearlyProduct)) {
         return <PropagationErrorDisplay onRetry={forceCheck} />;
    }
    
    // Calculate discount percentage
    const discount = (yearlyPaidOffer && monthlyOffer && yearlyPaidOffer.price.amount > 0 && monthlyOffer.price.amount > 0) 
        ? Math.round((1 - (yearlyPaidOffer.price.amount / (monthlyOffer.price.amount * 12))) * 100) 
        : 0;

    // The main subscription selection card
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
                 {yearlyFreeTrialOffer && 
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        3-Day Free Trial
                    </div>
                 }
                {discount > 0 && !yearlyFreeTrialOffer &&
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        Save {discount}%
                    </div>
                }
                <p className="font-semibold">Yearly</p>
                <p className="text-xl font-bold">{yearlyPaidOffer?.price.formatted || '...'}</p>
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
