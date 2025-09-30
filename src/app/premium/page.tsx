
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star, AlertCircle, Gem } from 'lucide-react';
import { useBilling, MONTHLY_PLAN_ID, YEARLY_PLAN_ID, MONTHLY_OFFER_ID, YEARLY_OFFER_ID } from '@/hooks/use-billing';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/in-app-logger';
import { motion } from 'framer-motion';
import { type Offer } from '@/lib/types';

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

  const monthlyProduct = products.find(p => p.id === MONTHLY_PLAN_ID);
  const yearlyProduct = products.find(p => p.id === YEARLY_PLAN_ID);
  
  // Logic to find specific offers within products.
  // The offer ID from the plugin is the full string, so we check if our desired base ID is part of it.
  const monthlyOffer = monthlyProduct?.offers.find(o => o.id.includes(MONTHLY_OFFER_ID));
  const yearlyFreeTrialOffer = yearlyProduct?.offers.find(o => o.id.includes(YEARLY_OFFER_ID));
  const yearlyPaidOffer = yearlyProduct?.offers.find(o => !o.id.includes(YEARLY_OFFER_ID) && o.id.includes(YEARLY_PLAN_ID));


  useEffect(() => {
    logger.log('PREMIUM_PAGE: State Update', { isInitialized, isLoading, isPremium, productCount: products.length, error });

    if (isInitialized && products.length > 0) {
      logger.log('PREMIUM_PAGE: Products loaded. Dumping FULL product structures...');
      logger.log('PREMIUM_PAGE: Raw Monthly Product', JSON.stringify(monthlyProduct, null, 2));
      logger.log('PREMIUM_PAGE: Raw Yearly Product', JSON.stringify(yearlyProduct, null, 2));
      
      logger.log('PREMIUM_PAGE: Derived Offers check', {
          monthlyOffer: !!monthlyOffer,
          yearlyPaidOffer: !!yearlyPaidOffer,
          yearlyFreeTrialOffer: !!yearlyFreeTrialOffer,
      });
    } else if (isInitialized) {
        logger.log('PREMIUM_PAGE: Initialized but no products found.');
    }
  }, [isInitialized, products, isLoading, isPremium, error, monthlyProduct, yearlyProduct, monthlyOffer, yearlyPaidOffer, yearlyFreeTrialOffer]);


  const handlePurchase = async () => {
    logger.log('PREMIUM_PAGE: handlePurchase called with plan:', selectedPlan);

    const isYearly = selectedPlan === 'yearly';
    const product = isYearly ? yearlyProduct : monthlyProduct;
    // For yearly, prioritize the free trial offer if it exists, otherwise fall back to the paid offer
    const offer = isYearly ? (yearlyFreeTrialOffer || yearlyPaidOffer) : monthlyOffer;
    
    logger.log('PREMIUM_PAGE: Attempting purchase with derived objects:', { product: !!product, offer: !!offer });

    if (!product || !offer || !offer.id) {
        const errorMsg = 'Plan not available. It may still be loading or is not configured correctly.';
        logger.log(`❌ PREMIUM_PAGE: Purchase failed - ${errorMsg}`);
        toast({ title: 'Plan Not Available', description: errorMsg, variant: 'destructive' });
        return;
    }
    
    await purchase(product.id, offer.id);
  };
  
  const handleRestore = async () => {
    await restorePurchases();
  }
  
  // A plan is ready if an offer has been found and it has a formatted price.
  const isPlanReady = (offer?: Offer) => !!offer?.price?.formatted;

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
           <Button onClick={onRetry} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Check Again
            </Button>
            <p className="text-xs text-muted-foreground/80">
              If this persists, please check your internet connection.
            </p>
        </CardFooter>
      </Card>
  );


  const renderContent = () => {
    // Show a loading skeleton only while the entire context is initializing for the first time
    if (!isInitialized && isLoading) {
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md"
        >
          <Card className="w-full text-center overflow-hidden shadow-2xl shadow-primary/20">
            <CardHeader className="bg-muted/30 p-6 sm:p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-background"
              >
                <Gem className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
              </motion.div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">You're a Premium Member!</CardTitle>
              <CardDescription className="mt-2 text-md sm:text-lg">
                Welcome to the full Photorights AI experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-left text-foreground">Your Unlocked Benefits:</h3>
              <ul className="space-y-3 text-left">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6 bg-muted/30">
              <Button variant="outline" onClick={handleRestore} disabled={!isInitialized || isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Restore Subscription
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    }
    
    if (error) {
         return (
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>
                    {error} Please check your connection or try again later.
                     <Button variant="link" onClick={forceCheck} className="p-0 h-auto ml-2" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Retry'}
                     </Button>
                </AlertDescription>
            </Alert>
        );
    }
    
    // Show this if products are missing after initialization.
    // This is a sign of a propagation issue or misconfiguration in the store.
    if (isInitialized && (!products || products.length === 0 || !monthlyProduct || !yearlyProduct)) {
         logger.log('PREMIUM_PAGE: Rendering PropagationErrorDisplay because products are missing after init.');
         return <PropagationErrorDisplay onRetry={forceCheck} />;
    }
    
    const isMonthlyReady = isPlanReady(monthlyOffer);
    const isYearlyReady = isPlanReady(yearlyFreeTrialOffer) || isPlanReady(yearlyPaidOffer);
    
    logger.log('PREMIUM_PAGE: Price readiness check', { isMonthlyReady, isYearlyReady });

    const discount = (yearlyPaidOffer && monthlyOffer && yearlyPaidOffer.price.amount > 0 && monthlyOffer.price.amount > 0) 
        ? Math.round((1 - (yearlyPaidOffer.price.amount / (monthlyOffer.price.amount * 12))) * 100) 
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
                {isMonthlyReady ? (
                    <p className="text-xl font-bold">{monthlyOffer?.price.formatted}</p>
                ) : (
                    <Skeleton className="h-7 w-16 mx-auto my-1" />
                )}
                <p className="text-xs text-muted-foreground">per month</p>
             </button>
             <button onClick={() => setSelectedPlan('yearly')} className={cn("border-2 rounded-lg p-4 text-center relative", selectedPlan === 'yearly' ? 'border-primary' : 'border-border')}>
                 {yearlyFreeTrialOffer && isYearlyReady &&
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        3-Day Free Trial
                    </div>
                 }
                {discount > 0 && !yearlyFreeTrialOffer && isYearlyReady &&
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        Save {discount}%
                    </div>
                }
                <p className="font-semibold">Yearly</p>
                {isYearlyReady ? (
                    <p className="text-xl font-bold">{(yearlyFreeTrialOffer || yearlyPaidOffer)?.price.formatted}</p>
                ) : (
                    <Skeleton className="h-7 w-20 mx-auto my-1" />
                )}
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
            disabled={isPurchasing || !isInitialized || !products.length}
          >
            {isPurchasing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isPurchasing ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`}
          </Button>
          <Button variant="ghost" onClick={handleRestore} disabled={!isInitialized || isLoading || isPurchasing}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Restore Purchases
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="flex flex-col items-center justify-start py-8">
        {renderContent()}
    </div>
  );
}
