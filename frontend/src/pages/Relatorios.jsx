import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import {
    transactionsApi,
    dashboardApi,
    investmentsApi,
} from '../services/apis';
import './Relatorios.css';

export default function Relatorios() {
    const navigate = useNavigate();

    // Estado para armazenar dados do usuário
    const [userData, setUserData] = useState({ name: 'Carregando...' });

    // Estado de carregamento da página
    const [carregando, setCarregando] = useState(true);

    // Estado das transações e investimentos
    const [transacoes, setTransacoes] = useState([]);
    const [investimentos, setInvestimentos] = useState([]);

    // Estado do resumo do dashboard (saldo total, quantidade de ativos)
    const [resumo, setResumo] = useState({ totalBalance: 0, activesCount: 0 });

    // Estado para filtros de exibição das transações
    const [filtro, setFiltro] = useState('todos'); // 'todos', 'receitas', 'despesas'
    const [periodo, setPeriodo] = useState('mes'); // 'mes', 'trimestre', 'ano'

    // Efeito inicial para autenticação e carregamento de dados
    useEffect(() => {
        const user = servicoAutenticacao.obterUsuarioAtual();
        const token = servicoAutenticacao.obterToken();

        // Se não estiver logado, redireciona para a página inicial
        if (!user || !token) {
            navigate('/');
            return;
        }
        setUserData(user);

        carregarDados(); // Chama função para buscar dados
    }, [navigate]);

    // Função para carregar dados de transações, investimentos e resumo do dashboard
    const carregarDados = async () => {
        try {
            setCarregando(true);

            // Chamada paralela às APIs para otimizar carregamento
            const [transData, invData, dashData] = await Promise.all([
                transactionsApi.list(),
                investmentsApi.list(),
                dashboardApi.getSummary(),
            ]);

            setTransacoes(transData || []);
            setInvestimentos(invData || []);
            setResumo(dashData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);

            // Se token expirou, força logout
            if (err.response?.status === 401) {
                servicoAutenticacao.sair();
                navigate('/');
            }
        } finally {
            setCarregando(false);
        }
    };

    // Função para calcular estatísticas financeiras
    const calcularEstatisticas = () => {
        const totalReceitas = transacoes
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + parseFloat(t.amount), 0);

        const totalDespesas = transacoes
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + parseFloat(t.amount), 0);

        // Filtrar apenas investimentos (kind !== 'Renda')
        const totalInvestido = investimentos
            .filter((inv) => inv.kind !== 'Renda')
            .reduce(
                (acc, inv) => acc + parseFloat(inv.amount),
                0,
            );

        const saldoLiquido = totalReceitas - totalDespesas;

        return {
            totalReceitas,
            totalDespesas,
            totalInvestido,
            saldoLiquido,
        };
    };

    const stats = calcularEstatisticas();

    // Aplica filtro de transações com base no tipo selecionado
    const transacoesFiltradas = transacoes.filter((t) => {
        if (filtro === 'receitas') return t.type === 'income';
        if (filtro === 'despesas') return t.type === 'expense';
        return true;
    });

    return (
        <div className="dashboard-wrap">
            <div className="content">
                {/* Cabeçalho com título e badge do usuário */}
                <header className="content-head">
                    <h2>Relatórios Financeiros</h2>
                    <div className="user-badge">👤 {userData.name}</div>
                </header>

                {carregando ? (
                    // Exibe mensagem de carregamento enquanto os dados são buscados
                    <div className={'loading'}>Carregando relatórios...</div>
                ) : (
                    <>
                        {/* Seção de estatísticas resumidas */}
                        <section className="stats-grid">
                            {/* Card: Total em Receitas */}
                            <div className="stat-card green">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total em Receitas</div>
                                    <div className="stat-value">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(stats.totalReceitas)}
                                    </div>
                                </div>
                            </div>

                            {/* Card: Total em Despesas */}
                            <div className="stat-card red">
                                <div className="stat-icon">💸</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total em Despesas</div>
                                    <div className="stat-value">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(stats.totalDespesas)}
                                    </div>
                                </div>
                            </div>

                            {/* Card: Total Investido */}
                            <div className="stat-card blue">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Investido</div>
                                    <div className="stat-value">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(stats.totalInvestido)}
                                    </div>
                                </div>
                            </div>

                            {/* Card: Saldo Líquido */}
                            <div className="stat-card purple">
                                <div className="stat-icon">💵</div>
                                <div className="stat-info">
                                    <div className="stat-label">Saldo Líquido</div>
                                    <div className="stat-value">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(stats.saldoLiquido)}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Seção de filtros de transações */}
                        <section className="filters-section">
                            <div className="filter-group">
                                <label>Tipo de Transação:</label>
                                <select
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                >
                                    <option value="todos">Todas</option>
                                    <option value="receitas">Receitas</option>
                                    <option value="despesas">Despesas</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Período:</label>
                                <select
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value)}
                                >
                                    <option value="mes">Último Mês</option>
                                    <option value="trimestre">Último Trimestre</option>
                                    <option value="ano">Último Ano</option>
                                </select>
                            </div>
                        </section>

                        {/* Tabela de transações filtradas */}
                        <section className="report-section">
                            <h3>Histórico de Transações</h3>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Descrição</th>
                                            <th>Tipo</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transacoesFiltradas.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Nenhuma transação encontrada
                                                </td>
                                            </tr>
                                        ) : (
                                            transacoesFiltradas.map((trans) => (
                                                <tr key={trans.id}>
                                                    <td>{new Date(trans.date).toLocaleDateString('pt-BR')}</td>
                                                    <td>{trans.description || 'Sem descrição'}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${trans.type === 'income' ? 'badge-green' : 'badge-red'}`}
                                                        >
                                                            {trans.type === 'income' ? 'Receita' : 'Despesa'}
                                                        </span>
                                                    </td>
                                                    <td className={trans.type === 'income' ? 'text-green' : 'text-red'}>
                                                        {trans.type === 'income' ? '+' : '-'}
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(trans.amount))}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Resumo de Investimentos */}
                        <section className="report-section">
                            <h3>Resumo de Investimentos</h3>
                            <div className="investments-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total de Investimentos:</span>
                                    <span className="summary-value">{investimentos.filter(inv => inv.kind !== 'Renda').length}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Valor Total Investido:</span>
                                    <span className="summary-value">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalInvestido)}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Ativos Diferentes:</span>
                                    <span className="summary-value">{resumo.activesCount}</span>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
