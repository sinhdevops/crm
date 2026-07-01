import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireCurrentUser();
  await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: ai-connected\ndata: {"ok":true}\n\n`),
      );

      const payload = {
        tasks: [
          { title: "Review meeting notes and confirm next step", dueDate: null },
          { title: "Send follow-up email to the contact", dueDate: null },
        ],
        emailDraft:
          "Hi,\n\nThanks for the meeting. I will follow up with the agreed action items and keep the deal updated.\n\nBest regards,",
      };

      controller.enqueue(
        encoder.encode(`event: ai-complete\ndata: ${JSON.stringify(payload)}\n\n`),
      );
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
