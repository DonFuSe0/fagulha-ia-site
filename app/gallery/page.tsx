// ... (imports inalterados)
import ImageActions from './ImageActions'; // Importar o novo componente

// ... (função getDaysRemaining inalterada)

export default async function GalleryPage() {
  // ... (busca de dados inalterada)
  const { data: generations, error } = await supabase
    .from('generations')
    .select('*, expires_at') // Já busca tudo que precisamos
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  // ... (resto do componente até o loop)

  return (
    // ...
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {generations.map((gen) => {
        const daysLeft = getDaysRemaining(gen.expires_at);
        return (
          <div key={gen.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
            {gen.status === 'succeeded' && gen.image_url ? (
              <>
                <Image src={gen.image_url} alt={gen.prompt || '...'} fill sizes="..." className="..." />
                <div className={`absolute top-2 left-2 ...`}> {/* Aviso de Expiração */}
                  <Clock size={14} />
                  <span>Expira em {daysLeft}d</span>
                </div>
                <PublishButton generationId={gen.id} isPublic={gen.is_public} />
                
                {/* ADICIONADO AQUI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <ImageActions generation={gen} />
                </div>
              </>
            ) : (
              // ... (código para status 'processing' e 'failed' inalterado)
            )}
          </div>
        );
      })}
    </div>
    // ...
  );
}
