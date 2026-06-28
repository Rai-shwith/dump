import React from "react";
import { Link } from "react-router-dom";

export function Logo(): React.JSX.Element {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <img src="/favicon.svg" alt="Dump Logo" className="h-6 w-6" />
      <span className="font-sans text-lg font-black tracking-tight text-black dark:text-white">
        DUMP
      </span>
    </Link>
  );
}
