"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.12,
      },
    },
  };

  const lineVariants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1], // Strong ease-out per design-eng principles
      },
    },
  };

  return (
    <section className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 sm:px-8 w-full pt-10 pb-24 sm:pt-14 sm:pb-32">
      <motion.div
        className="max-w-3xl flex flex-col items-start text-left"
        variants={containerVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
      >
        {/* Staggered Line 1: Headline part 1 */}
        <div className="overflow-visible">
          <motion.h1
            variants={lineVariants}
            className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.14] tracking-tight text-foreground"
          >
            A quiet sanctuary
          </motion.h1>
        </div>

        {/* Staggered Line 2: Headline part 2 */}
        <div className="overflow-visible pb-2 sm:pb-3">
          <motion.div
            variants={lineVariants}
            className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.14] tracking-tight text-foreground/90"
          >
            for the books that stay with you.
          </motion.div>
        </div>

        {/* Staggered Line 3: Evocative Subheadline (19 words) */}
        <motion.p
          variants={lineVariants}
          className="mt-5 sm:mt-6 max-w-xl text-lg sm:text-xl text-foreground/75 font-sans leading-relaxed font-light"
        >
          Record what you read, preserve the lines that moved you, and watch a
          year of pages slowly become memory.
        </motion.p>

        {/* Staggered Line 4: Single CTA button */}
        <motion.div variants={lineVariants} className="mt-8 sm:mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3.5 text-base font-sans font-medium text-card hover:bg-primary/90 active:scale-[0.97] transition-all duration-160 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
          >
            Start your shelf
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
