import { NextResponse } from "next/server";
import { handleConversation, ChatMessage } from "@/lib/conversation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      draft?: Parameters<typeof handleConversation>[1];
      model?: string;
    };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "La consulta a Aura debe contener al menos un mensaje." }, { status: 400 });
    }
    return NextResponse.json(await handleConversation(body.messages, body.draft, body.model));
  } catch (error) {
    console.error("Aura chat error", error);
    const message = error instanceof Error ? error.message : "Error desconocido del proveedor";
    return NextResponse.json(
      { error: `No pude conectar con el modelo seleccionado de Aura. Verifica que esté disponible en Ollama. Detalle: ${message}` },
      { status: 502 }
    );
  }
}
