'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, UploadCloud, ScanEye, FileCheck, Users, Palette, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const whoIsItFor = [
    { icon: Users, title: 'Social Media Managers', description: 'Ensure your posts are free of copyrighted material before publishing.'},
    { icon: Palette, title: 'Designers & Artists', description: 'Verify that your creative work doesn\'t unintentionally infringe on existing IP.'},
    { icon: ShoppingBag, title: 'Stock Photo Contributors', description: 'Check your photos for logos or brands before submitting to stock sites.'}
]

const howItWorks = [
    { icon: UploadCloud, title: 'Upload Your Image', description: 'Simply select an image from your device to begin the analysis.'},
    { icon: ScanEye, title: 'AI-Powered Scan', description: 'Our AI analyzes every detail of your image for potential copyright risks.'},
    { icon: FileCheck, title: 'Get Instant Results', description: 'Receive a detailed report on logos, brands, and characters detected.'}
]

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16 pb-16">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">
          Create with Confidence.
        </h1>
        <p className="max-w-md mx-auto mt-4 text-lg text-muted-foreground">
          Photorights AI helps you avoid copyright issues by intelligently scanning your images for protected content.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full shadow-lg shadow-primary/30">
            <Link href="/scan">
                Start Your First Scan <ArrowRight className="ml-2 w-5 h-5"/>
            </Link>
        </Button>
      </motion.section>

      <motion.section
        variants={featureVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">Who is Photorights AI for?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whoIsItFor.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                    <Card className="text-center h-full shadow-sm hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <item.icon className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
      </motion.section>
      
      <motion.section
        variants={featureVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((item, index) => (
                 <motion.div key={index} variants={itemVariants}>
                    <Card className="text-center h-full shadow-sm hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <item.icon className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
      </motion.section>

    </div>
  );
}
