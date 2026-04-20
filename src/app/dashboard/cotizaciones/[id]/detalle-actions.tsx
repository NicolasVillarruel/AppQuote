"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DetalleCotizacionActions({
  cotizacionId,
  pdfUrl,
}: {
  cotizacionId: string;
  pdfUrl: string | null;
}) {
  const [generating, setGenerating] = useState(false);

  const handlePDF = async () => {
    setGenerating(true);
    toast.loading("Generando PDF...", { id: "pdf-det" });
    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/pdf`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("PDF listo", { id: "pdf-det" });
      const link = document.createElement("a");
      link.href = data.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      toast.error(e.message ?? "Error al generar PDF", { id: "pdf-det" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="brand"
      size="sm"
      onClick={handlePDF}
      disabled={generating}
    >
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {pdfUrl ? "Descargar PDF" : "Generar PDF"}
    </Button>
  );
}
