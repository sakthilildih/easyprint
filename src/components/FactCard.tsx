import { useState, useEffect } from "react";

const FACTS = [
  "Sharks existed before trees 🦈",
  "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old! 🍯",
  "A day on Venus is longer than a year on Venus 🪐",
  "Bananas grow curved because they reach for the sunlight 🍌",
  "Octopuses have three hearts 🐙",
  "Wombat poop is cube-shaped 💩",
  "A jiffy is an actual unit of time: 1/100th of a second ⏱️",
];

export function FactCard() {
  const [index, setIndex] = useState(Math.floor(Math.random() * FACTS.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % FACTS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Did you know?</div>
      <p className="text-sm font-medium text-foreground/80 min-h-[40px] flex items-center justify-center transition-opacity duration-500">
        {FACTS[index]}
      </p>
    </div>
  );
}
