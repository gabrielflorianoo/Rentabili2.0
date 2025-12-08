import React from 'react';

export default function Footer() {
    return (
        /**
         * Componente simples de rodapé usado em todas as páginas.
         * A classe "footer" aplica o estilo global definido no CSS.
         */
        <footer className="footer">

            {/* Texto principal do rodapé com direitos autorais */}
            <p>© 2025 Rentabili - Todos os direitos reservados</p>

            {/* Linha extra com crédito da equipe de desenvolvimento */}
            <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                Desenvolvido pelo grupo F ❤️ - UTFPR
            </p>
        </footer>
    );
}
