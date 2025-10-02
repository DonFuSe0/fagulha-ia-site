
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST() {
  return new Response("Método desativado", { status: 405 });
}

export async function GET() {
  return new Response("Não encontrado", { status: 404 });
}
