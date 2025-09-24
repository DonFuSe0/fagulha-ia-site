import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { password, confirmation } = await request.json()

    if (!password || confirmation !== "EXCLUIR") {
      return NextResponse.json(
        {
          error: "Senha e confirmação 'EXCLUIR' são obrigatórias",
        },
        { status: 400 },
      )
    }

    // Verificar senha
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    })

    if (signInError) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 400 })
    }

    // Soft delete - marcar perfil como excluído em vez de deletar fisicamente
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: "Conta Excluída",
        nickname: `deleted_${user.id.substring(0, 8)}`,
        bio: null,
        avatar_url: null,
        birth_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      return NextResponse.json(
        {
          error: "Erro ao excluir dados do perfil: " + profileError.message,
        },
        { status: 500 },
      )
    }

    // Fazer logout do usuário
    await supabase.auth.signOut()

    return NextResponse.json({ message: "Conta excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir conta:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
