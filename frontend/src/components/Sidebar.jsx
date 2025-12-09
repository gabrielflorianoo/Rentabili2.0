import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import DarkModeToggle from "../components/DarkModeToggle";

export default function Sidebar({ aoSair = () => {}, paginaAtiva = '' }) {
    // Hook do React Router para navegação programática
    const navigate = useNavigate();
    const { selectedWallet } = useWallet();

    return (
        <aside className="sidebar">
            {/* Componente para alternar entre modo claro e escuro */}
            <div className="sidebar-darkmode">
                <DarkModeToggle />
            </div>

            {/* Logo / marca da aplicação */}
            <div className="logo">
                📈<strong>RENTABILI</strong>
            </div>

            {/* Selected Wallet Indicator */}
            {selectedWallet && (
                <div style={{
                    margin: '15px 20px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 6px rgba(76, 175, 80, 0.3)',
                }}>
                    <div style={{ opacity: 0.9, marginBottom: '4px', fontSize: '0.75rem' }}>
                        Carteira Ativa:
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {selectedWallet.name}
                    </div>
                </div>
            )}

            {/* Menu de navegação lateral */}
            <nav>
                {/* Links de navegação com destaque para página ativa */}
                <a
                    onClick={() => navigate('/dashboard')}
                    className={paginaAtiva === 'dashboard' ? 'active' : ''}
                >
                    Dashboard
                </a>
                <a
                    onClick={() => navigate('/investimentos')}
                    className={paginaAtiva === 'investimentos' ? 'active' : ''}
                >
                    Investimentos
                </a>
                <a
                    onClick={() => navigate('/actives')}
                    className={paginaAtiva === 'actives' ? 'active' : ''}
                >
                    Ativos
                </a>
                <a
                    onClick={() => navigate('/transacoes')}
                    className={paginaAtiva === 'transacoes' ? 'active' : ''}
                >
                    Transações
                </a>
                <a
                    onClick={() => navigate('/carteiras')}
                    className={paginaAtiva === 'carteiras' ? 'active' : ''}
                >
                    💳 Carteiras
                </a>
                <a
                    onClick={() => navigate('/relatorios')}
                    className={paginaAtiva === 'relatorios' ? 'active' : ''}
                >
                    Relatórios
                </a>
                <a
                    onClick={() => navigate('/historico')}
                    className={paginaAtiva === 'historico' ? 'active' : ''}
                >
                    📊 Histórico
                </a>
                <a
                    onClick={() => navigate('/analise')}
                    className={paginaAtiva === 'analise' ? 'active' : ''}
                >
                    📈 Análise
                </a>
                <a
                    onClick={() => navigate('/simulador')}
                    className={paginaAtiva === 'simulador' ? 'active' : ''}
                >
                    Simulador
                </a>

                {/* Botão de logout / sair da conta */}
                <a
                    onClick={aoSair} // Callback passado pelo componente pai
                    style={{
                        marginTop: 'auto', // Empurra para o fim da barra
                        color: '#d90429',
                        cursor: 'pointer',
                    }}
                >
                    Sair da Conta
                </a>
            </nav>
        </aside>
    );
}
