import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { insertCreatorSchema, type Creator } from "@shared/schema";
import { useCreateCreator } from "@/hooks/use-creators";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Heart } from "lucide-react";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { ShareCard } from "@/components/ShareCard";
import { FloatingHearts } from "@/components/FloatingHearts";

// Extend schema for frontend validation nuances if needed
const formSchema = insertCreatorSchema.extend({
  displayName: z.string().min(2, "Name needs to be at least 2 characters"),
  slug: z.string().min(3, "Slug needs to be at least 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and dashes"),
  passcode: z.string().min(4, "Passcode must be at least 4 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCreator = useCreateCreator();
  const [createdCreator, setCreatedCreator] = useState<Creator | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      slug: "",
      passcode: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createCreator.mutate(data, {
      onSuccess: (creator) => {
        toast({
          title: "Page Created!",
          description: "Your Valentine page is ready to share.",
        });
        setCreatedCreator(creator);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 relative overflow-hidden">
      <FloatingHearts />
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-6 pt-24 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-200 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-rose-100/50 border border-rose-200 text-rose-800 text-xs font-ui font-bold tracking-widest uppercase">
            <Heart className="w-3 h-3 fill-rose-800" />
            Valentine Edition
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-medium text-ink mb-6 leading-[0.9]">
            The Botanical<br />
            <span className="italic text-rose-900">Letter Press</span>
          </h1>

          <p className="text-xl md:text-2xl font-body text-ink-light max-w-lg mx-auto leading-relaxed">
            Create a space for honest confessions and digital flowers. A modern love letter for the digital age.
          </p>
        </motion.div>
      </section>

      {/* Action Section */}
      <section className="px-4 pb-24 max-w-md mx-auto relative z-10 min-h-[400px]">
        <AnimatePresence mode="wait">
          {!createdCreator ? (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
              className="paper-card p-8 rounded-2xl relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#E6DCCF] rounded-t-lg -z-10 opacity-80" />

              <h2 className="text-3xl font-display text-center mb-8 text-ink">Claim your link</h2>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-ui font-bold uppercase tracking-widest text-stone-500 ml-1">
                    Display Name
                  </label>
                  <input
                    {...form.register("displayName")}
                    placeholder="e.g. Sarah"
                    className="w-full px-4 py-3 bg-[#FDFAF5] border-b-2 border-stone-200 focus:border-rose-400 outline-none font-body text-lg transition-colors placeholder:text-stone-300"
                  />
                  {form.formState.errors.displayName && (
                    <p className="text-xs text-red-500 ml-1">{form.formState.errors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-ui font-bold uppercase tracking-widest text-stone-500 ml-1">
                    Your Unique Link
                  </label>
                  <div className="flex items-center bg-[#FDFAF5] border-b-2 border-stone-200 focus-within:border-rose-400 transition-colors">
                    <span className="pl-4 text-stone-400 font-body">valentine.app/</span>
                    <input
                      {...form.register("slug")}
                      placeholder="sarah"
                      className="flex-1 p-3 bg-transparent outline-none font-body text-lg placeholder:text-stone-300"
                    />
                  </div>
                  {form.formState.errors.slug && (
                    <p className="text-xs text-red-500 ml-1">{form.formState.errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-ui font-bold uppercase tracking-widest text-stone-500 ml-1">
                    Secret Passcode (for your eyes only)
                  </label>
                  <input
                    {...form.register("passcode")}
                    type="password"
                    placeholder="••••"
                    className="w-full px-4 py-3 bg-[#FDFAF5] border-b-2 border-stone-200 focus:border-rose-400 outline-none font-body text-lg transition-colors placeholder:text-stone-300 tracking-widest"
                  />
                  {form.formState.errors.passcode && (
                    <p className="text-xs text-red-500 ml-1">{form.formState.errors.passcode.message}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={createCreator.isPending}
                    className="w-full h-14 wax-seal text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {createCreator.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Page <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <ShareCard
              key="share-card"
              slug={createdCreator.slug}
              displayName={createdCreator.displayName}
            />
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
