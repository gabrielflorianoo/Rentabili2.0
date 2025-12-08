import React, { useEffect, useState } from "react";
import "../styles/darkmode.css";

export default function DarkModeToggle() {

  /**
   * Estado que controla se o modo escuro está ativo.
   * A função inicial verifica o localStorage ao carregar o componente,
   * garantindo que o tema persista entre atualizações de página.
   */
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  /**
   * Efeito que roda sempre que o estado `dark` mudar.
   * Ele adiciona ou remove a classe "dark" no <body>
   * e salva a preferência do usuário no localStorage.
   */
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    /**
     * Botão estilizado que funciona como um switch customizado.
     * data-state="checked" permite aplicar estilos condicionais via CSS.
     * No clique, alterna o estado dark.
     */
    <div
      className="switch"
      data-state={dark ? "checked" : ""}
      onClick={() => setDark(!dark)}
    >
      {/* A "thumb" é o círculo deslizante do switch */}
      <div className="thumb">
        {/* Ícones SVG mudam conforme o tema: lua para dark, sol para light */}
        {dark ? (
          <svg
            className="iconMoon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Ícone de lua */}
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
          </svg>
        ) : (
          <svg
            className="iconSun"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Ícone de sol */}
            <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0-16a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm10-7a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5 12a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zm12.95-6.95a1 1 0 010 1.41l-.71.71a1 1 0 11-1.41-1.41l.71-.71a1 1 0 011.41 0zM7.17 16.83a1 1 0 010 1.41l-.71.71a1 1 0 11-1.41-1.41l.71-.71a1 1 0 011.41 0zm12 1.41a1 1 0 000-1.41l-.71-.71a1 1 0 10-1.41 1.41l.71.71a1 1 0 001.41 0zM7.17 5.17a1 1 0 000 1.41L7.88 7.3a1 1 0 001.41-1.41l-.71-.71a1 1 0 00-1.41 0z" />
          </svg>
        )}
      </div>
    </div>
  );
}
