"use client";

import { useEffect, type ReactNode } from "react";

export function InterviewProtected({ children, watermark }: { children: ReactNode; watermark: string }) {
  useEffect(() => {
    const block = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const blockKeyboard = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "a", "x", "p", "s"].includes(key)) block(event);
    };
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("keydown", blockKeyboard);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("keydown", blockKeyboard);
    };
  }, []);
  return <section className="interviewProtected" data-watermark={watermark}>{children}<p className="watermark">{watermark}</p></section>;
}
