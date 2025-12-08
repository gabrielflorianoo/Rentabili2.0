import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/estilo.css';

export default function Planos() {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <Header />

            {/* ADICIONADO: classe 'sem-sidebar' */}
            <main className="page-content sem-sidebar">
                <h1 className="page-title titulo-centralizado">Nossos Planos</h1>

                <div className="planos-container">
                    {/* Card Grátis */}
                    <div className="card-plano">
                        <h2 className="plano-titulo">Grátis</h2>
                        <div className="preco">R$ 0</div>
                        <ul className="plano-lista page-list">
                            <li>Cadastro básico de ativos</li>
                            <li>Cálculo de rentabilidade simples</li>
                            <li>Uma carteira de investimentos</li>
                        </ul>
                        <button onClick={() => navigate('/login')} className="btn-acesso btn-plano">
                            Começar Grátis
                        </button>
                    </div>

                    {/* Card Avançado */}
                    <div className="card-plano destaque">
                        <h2 className="plano-titulo">Avançado</h2>
                        <div className="preco">R$ 29,90</div>
                        <ul className="plano-lista page-list">
                            <li>Tudo do plano Grátis</li>
                            <li>Múltiplas carteiras</li>
                            <li>Gráficos avançados e relatórios</li>
                            <li>Suporte prioritário</li>
                        </ul>
                        <button onClick={() => navigate('/login')} className="btn-acesso btn-plano">
                            Assinar Agora
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
