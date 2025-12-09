import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WalletProvider } from './contexts/WalletContext';

// Cria a raiz de renderização do React utilizando o método moderno createRoot()
// Ele é recomendado para novas aplicações React (React 18+)
ReactDOM.createRoot(document.getElementById('root')).render(
    // React.StrictMode ativa verificações extras em desenvolvimento.
    // Ele ajuda a identificar problemas potenciais, mas não afeta a produção.
    <React.StrictMode>
        <WalletProvider>
            {/* Componente principal da aplicação */}
            <App />
        </WalletProvider>
    </React.StrictMode>,
);
