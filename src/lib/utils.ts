import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: "PEN" | "USD" | "EUR" = "PEN"): string {
  const symbols: Record<string, string> = {
    PEN: "S/",
    USD: "$",
    EUR: "€",
  };
  return `${symbols[currency]} ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `COT-${year}-${seq}`;
}

export const QUOTE_STATES = {
  borrador: { label: "Borrador", color: "bg-zinc-500" },
  enviada: { label: "Enviada", color: "bg-blue-500" },
  aceptada: { label: "Aceptada", color: "bg-green-500" },
  rechazada: { label: "Rechazada", color: "bg-red-500" },
  vencida: { label: "Vencida", color: "bg-orange-500" },
} as const;

export type QuoteState = keyof typeof QUOTE_STATES;

export const ZONAS_TRANSPORTE = [
  { value: "lima_centro", label: "Lima Centro" },
  { value: "lima_norte", label: "Lima Norte" },
  { value: "lima_sur", label: "Lima Sur" },
  { value: "lima_este", label: "Lima Este" },
  { value: "callao", label: "Callao" },
  { value: "provincia", label: "Provincia" },
];
