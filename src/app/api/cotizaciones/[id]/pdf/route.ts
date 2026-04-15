import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CotizacionPDF } from "@/components/pdf/cotizacion-document";
import React from "react";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    // Fetch full quote data
    const { data: cotData, error } = await supabase
      .from("cotizaciones")
      .select(`
        *,
        clientes(*),
        usuarios(nombre, email),
        detalles_cotizacion(*, productos(sku, nombre, unidad))
      `)
      .eq("id", id)
      .single();

    const cot = cotData as any;

    if (error || !cot) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    // Generate PDF buffer
    const buffer = await renderToBuffer(
      React.createElement(CotizacionPDF, { cotizacion: cot as any }) as any
    );

    // Upload to Supabase Storage
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const filePath = `cotizaciones/${year}/${month}/${cot.numero_cotizacion}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("cotizaciones")
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get signed URL (valid 1 hour)
    const { data: signedData } = await supabase.storage
      .from("cotizaciones")
      .createSignedUrl(filePath, 3600);

    const pdfUrl = signedData?.signedUrl ?? "";

    // Update cotizacion record
    await (supabase as any)
      .from("cotizaciones")
      .update({ pdf_url: pdfUrl, pdf_generado_en: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ url: pdfUrl });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: err.message ?? "Error interno" }, { status: 500 });
  }
}
