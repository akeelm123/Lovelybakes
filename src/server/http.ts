import "server-only";

export function problem(status: number, code: string, message: string, details?: unknown): Response {
  return Response.json({ error: { code, message, ...(details === undefined ? {} : { details }) } }, { status });
}

export async function safeJson(request: Request, maxBytes = 262144): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) throw new Error("UNSUPPORTED_MEDIA_TYPE");
  const reader=request.body?.getReader();if(!reader)throw new Error("INVALID_JSON");const chunks:Uint8Array[]=[];let total=0;while(true){const{value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxBytes){await reader.cancel();throw new Error("BODY_TOO_LARGE")}chunks.push(value)}const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}return JSON.parse(new TextDecoder().decode(bytes));
}
