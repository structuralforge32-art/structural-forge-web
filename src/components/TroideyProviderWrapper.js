// src/components/TroideyProviderWrapper.js
"use client";
import { usePathname } from "next/navigation";
import TroideyWrapper from "./TroideyWrapper";

export default function TroideyProviderWrapper() {
  const pathname = usePathname();
  const showTroidey = ["/", "/contact"].includes(pathname) || pathname.startsWith("/suivi");
  return showTroidey ? <TroideyWrapper /> : null;
}
