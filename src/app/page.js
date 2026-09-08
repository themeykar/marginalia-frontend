import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-secondary/30 selection:text-foreground">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Features />
      </main>
    </div>
  );
}
