"use server";

export async function getBCRPRates() {
  try {
    const hoy = new Date();
    const pasado = new Date();
    pasado.setDate(hoy.getDate() - 7);
    const f1 = pasado.toISOString().split("T")[0];
    const f2 = hoy.toISOString().split("T")[0];

    // PD04640PD: Dólar Venta, PD04648PD: Euro Venta
    const url = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04640PD-PD04648PD/json/${f1}/${f2}`;
    
    // Some WAFs block requests without a User-Agent or specific headers
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 } // Cachear por 1 hora para evitar ban de IP
    });

    if (!res.ok) {
      console.error("BCRP action error:", res.statusText);
      return null;
    }

    const text = await res.text();
    // Intento de parseo por si el WAF devolvió HTML
    if (text.includes("Security Page") || text.includes("<html")) {
      console.error("BCRP WAF block detected.");
      return null;
    }

    const data = JSON.parse(text);
    
    const eurIdx = data.config.series.findIndex((s: any) => s.name.includes("Euro"));
    const usdIdx = data.config.series.findIndex((s: any) => s.name.includes("US$"));
    
    if (data.periods && data.periods.length > 0) {
      const lastPeriod = data.periods[data.periods.length - 1];
      const usdRate = usdIdx !== -1 && lastPeriod.values[usdIdx] !== "n.d." ? parseFloat(lastPeriod.values[usdIdx]) : null;
      const eurRate = eurIdx !== -1 && lastPeriod.values[eurIdx] !== "n.d." ? parseFloat(lastPeriod.values[eurIdx]) : null;
      
      return {
        date: lastPeriod.name,
        usd: usdRate,
        eur: eurRate
      };
    }
    
    return null;
  } catch (err) {
    console.error("BCRP Action Exception:", err);
    return null;
  }
}
