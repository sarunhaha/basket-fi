import { Button } from "@basket-fi/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Basket-Fi
        </h1>
        <p className="text-center text-lg mb-8">
          Create, track, and rebalance token baskets on Monad
        </p>
        <div className="flex justify-center">
          <Button>Get Started</Button>
        </div>
      </div>
    </main>
  );
}