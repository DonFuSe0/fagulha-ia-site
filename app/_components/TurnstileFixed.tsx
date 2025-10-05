
'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: any
  }
}

type Props = {
  onVerify: (token: string) => void
  onError?: (err?: any) => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

export default function TurnstileFixed({ 
  onVerify, 
  onError, 
  onExpire, 
  theme = 'auto' 
}: Props) {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!sitekey) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) {
        return
      }

      try {
        // Clear any existing widget
        if (widgetIdRef.current) {
          containerRef.current.innerHTML = ''
          widgetIdRef.current = null
        }

        // Render new widget
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          theme,
          callback: (token: string) => {
            setIsLoading(false)
            onVerify(token)
          },
          'error-callback': (error: any) => {
            setHasError(true)
            setIsLoading(false)
            onError?.(error)
          },
          'expired-callback': () => {
            onExpire?.()
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current)
            }
          },
        })
        
        setIsLoading(false)
      } catch (error) {
        setHasError(true)
        setIsLoading(false)
        onError?.(error)
      }
    }

    const loadTurnstile = () => {
      if (window.turnstile && typeof window.turnstile.render === 'function') {
        renderWidget();
        return;
      }

      if (scriptLoadedRef.current) return;
      scriptLoadedRef.current = true;

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      
      const timeoutId = setTimeout(() => {
        if (!window.turnstile) {
          setHasError(true);
          setIsLoading(false);
          onError?.('Turnstile script did not load within expected time.');
        }
      }, 10000); // 10 seconds timeout

      script.onload = () => {
        clearTimeout(timeoutId);
        if (window.turnstile) {
          window.turnstile.ready(() => {
            renderWidget();
          });
        } else {
          setHasError(true);
          setIsLoading(false);
          onError?.('Turnstile script loaded but \'turnstile\' object not found.');
        }
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        setHasError(true);
        setIsLoading(false);
        onError?.('Failed to load Turnstile script');
      };

      document.head.appendChild(script);
    };

    loadTurnstile();

    // Cleanup function
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      widgetIdRef.current = null;
    };
  }, [sitekey, onVerify, onError, onExpire, theme]);

  if (!sitekey) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
        <div className="text-xs text-red-400">
          ⚠️ Configuração necessária: <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>
        </div>
        <div className="text-xs text-red-300 mt-1">
          Configure a variável de ambiente na Vercel e faça redeploy.
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
        <div className="text-xs text-red-400">
          ⚠️ Erro ao carregar verificação de segurança
        </div>
        <div className="text-xs text-red-300 mt-1 mb-2">
          Verifique sua conexão e tente novamente.
        </div>
        <button
          type="button"
          onClick={() => {
            setHasError(false)
            setIsLoading(true)
            scriptLoadedRef.current = false
            // Trigger a re-render by changing the key or forcing a reload
            window.location.reload()
          }}
          className="px-3 py-1 text-xs rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span>Carregando verificação...</span>
          </div>
        )}
      </div>
    </div>
  )
}

