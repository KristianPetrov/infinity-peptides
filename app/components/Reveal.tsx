"use client";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
};

// Fades/slides content in once it scrolls into view.
export function Reveal({ children, className = "", delay = 0, as = "div" }: Props) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setShown(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  const props = {
    ref: setNode,
    className: `reveal ${shown ? "is-visible" : ""} ${className}`.trim(),
    style: delay ? { transitionDelay: `${delay}ms` } : undefined,
  };

  if (as === "section") return <section {...props}>{children}</section>;
  if (as === "article") return <article {...props}>{children}</article>;
  if (as === "li") return <li {...props}>{children}</li>;
  return <div {...props}>{children}</div>;
}
