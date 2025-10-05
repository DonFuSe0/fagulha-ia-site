// app/components/TurnstileFixed.tsx

"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Estendendo a interface Window para incluir o objeto turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, params: TurnstileParams) => string | undefined;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileParams {
  sitekey: string;
  action?: string;
  cData?: any;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  language?: string;
  tabindex?: number;
  "response-field"?: boolean;
  "response-field-name"?: string;
  size?: "normal" | "compact" | "invisible";
  retry?: "auto" | "never";
  "retry-interval"?: number;
  "refresh-expired"?: "auto" | "manual" | "never";
}

export function TurnstileFixed() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // Este efeito garante que a renderização ocorra apenas após o script estar carregado
    // e o objeto `turnstile` estar disponível na window.
    if (isScriptLoaded && window.turnstile) {
      try {
        window.turnstile.render("#turnstile-widget-container", {
          sitekey: siteKey!,
          callback: function (token: string) {
            console.log(`Challenge Success: ${token}`);
          },
          "error-callback": function() {
            console.error("Cloudflare Turnstile: Challenge failed.");
          },
        });
      } catch (error) {
        console.error("Falha ao renderizar o widget do Turnstile:", error);
      }
    }
  }, [isScriptLoaded, siteKey]); // Depende do script estar carregado

  if (!siteKey) {
    console.error("A chave do site do Cloudflare Turnstile não foi configurada.");
    return null;
  }

  return (
    <>
      {/* 
        O componente Script do Next.js gerencia o carregamento.
        strategy="beforeInteractive" é crucial para carregar o script antes que a página se torne interativa,
        mimetizando um carregamento síncrono sem 'async' ou 'defer'.
        onLoad é chamado quando o script termina de carregar.
      */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="beforeInteractive"
        onLoad={( ) => {
          console.log("Script do Turnstile carregado com sucesso.");
          setIsScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Falha ao carregar o script do Turnstile:", e);
        }}
      />
      {/* O container onde o widget será renderizado pelo script */}
      <div id="turnstile-widget-container"></div>
    </>
  );
}
