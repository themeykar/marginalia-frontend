import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-secondary/30 selection:text-foreground">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
      </main>
    </div>
  );
}
