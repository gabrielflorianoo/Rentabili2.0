import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import { dashboardApi } from '../services/apis';
import Sidebar from '../components/Sidebar';
import CurrencyTicker from '../components/CurrencyTicker';
import {
    EvolutionLineChart,
    AllocationPieChart,
    TopPerformersWidget,
} from '../components/PerformanceCharts';
import './DashBoard.css';

// --- IMPORTAÇÃO DAS BIBLIOTECAS GRÁFICAS ---
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Registra os componentes do gráfico para eles funcionarem
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: 'Investidor' });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para Interatividade (Filtro ao clicar no gráfico)
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const user = servicoAutenticacao.obterUsuarioAtual();
        const token = servicoAutenticacao.obterToken();

        if (!user || !token) {
            navigate('/');
            return;
        }
        setUserData(user);

        const fetchData = async () => {
            try {
                const response = await dashboardApi.getDashboard();
                setData(response);
            } catch (error) {
                console.error("Erro no dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        servicoAutenticacao.sair();
        navigate('/');
    };

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    // Usar allocation do dashboard data
    const allocationData = data?.allocationChart || [];

    // Prepara dados para o Gráfico de Rosca (Doughnut)
    const doughnutData = {
        labels: allocationData?.map(i => i.name || i.type) || [],
        datasets: [{
            data: allocationData?.map(i => i.percentage || 0) || [],
            backgroundColor: ['#00a651', '#0077b6', '#9b5de5', '#f15bb5', '#fee440', '#ff9f43'],
            borderWidth: 0,
        }]
    };

    const doughnutOptions = {
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const categoryName = doughnutData.labels[index];
                setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
            }
        },
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 } } }
        },
        maintainAspectRatio: false
    };

    // Prepara dados para o Gráfico de Linha (Line)
    const lineChartData = data?.evolutionChart || [];
    const lineData = {
        labels: lineChartData?.map(e => e.month) || [],
        datasets: [{
            label: 'Evolução Patrimonial',
            data: lineChartData?.map(e => e.value) || [],
            fill: true,
            backgroundColor: 'rgba(0, 166, 81, 0.1)',
            borderColor: '#00a651',
            tension: 0.4,
            pointRadius: 4
        }]
    };

    if (loading) return <div className="loading">Carregando inteligência financeira...</div>;

    // Se não tem dados após carregar, mostrar estado vazio
    if (!data) {
        return (
            <div className="dashboard-wrap">
                <Sidebar aoSair={handleLogout} paginaAtiva="dashboard" />
                <div className="content">
                    <div className="loading">Erro ao carregar dados. Tente recarregar a página.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrap">
            <Sidebar aoSair={handleLogout} paginaAtiva="dashboard" />

            <div className="content">
                <CurrencyTicker />
                <header className="content-head">
                    <div>
                        <h2>Olá, {userData.name}</h2>
                        <p className="subtitle">Visão geral da sua estratégia de investimentos.</p>
                    </div>
                    <div className={`status-badge ${(data?.totalGain || 0) >= 0 ? 'profit' : 'loss'}`}>
                        {(data?.totalGain || 0) >= 0 ? '🚀 Carteira Rentável' : '📉 Atenção Necessária'}
                    </div>
                </header>

                {/* 1. CARDS DE KPI */}
                <div className="kpi-grid">
                    <div className="kpi-card main">
                        <div className="kpi-icon">💰</div>
                        <div>
                            <span>Patrimônio Total</span>
                            <h3>{formatBRL(data?.totalBalance || data?.summary?.totalBalance || 0)}</h3>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon">📥</div>
                        <div>
                            <span>Total Aportado</span>
                            <h3>{formatBRL(data?.totalInvested || 0)}</h3>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon">📈</div>
                        <div>
                            <span>Rentabilidade</span>
                            <h3 style={{ color: (data?.totalGain || 0) >= 0 ? '#00a651' : '#d90429' }}>
                                {(data?.totalGain || 0) >= 0 ? '+' : ''}{data?.profitability || 0}%
                            </h3>
                            <small>{formatBRL(data?.totalGain || 0)} de lucro real</small>
                        </div>
                    </div>
                </div>

                <div className="dashboard-split">

                    {/* 2. GRÁFICO DE ALOCAÇÃO */}
                    <section className="chart-section glass-panel">
                        <div className="section-header">
                            <h3>Alocação de Ativos</h3>
                            {selectedCategory &&
                                <button className="btn-reset" onClick={() => setSelectedCategory(null)}>Ver Todos</button>
                            }
                        </div>
                        <div className="chart-container-donut">
                            {allocationData && allocationData.length > 0 ? (
                                <div style={{ width: '100%', height: '100%' }}>
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                </div>
                            ) : (
                                <p className="empty-state">Cadastre ativos para ver sua alocação.</p>
                            )}
                        </div>
                        <p className="chart-hint">💡 Clique nas fatias para filtrar detalhes</p>
                    </section>

                    {/* 3. DETALHES DINÂMICOS */}
                    <section className="details-section glass-panel">
                        <h3>{selectedCategory ? `Detalhes: ${selectedCategory}` : 'Evolução & Destaques'}</h3>

                        {selectedCategory ? (
                            <div className="category-detail-view">
                                <div className="detail-box">
                                    <span>Valor em {selectedCategory}</span>
                                    <strong>
                                        {(() => {
                                            const item = allocationData?.find(a => a.type === selectedCategory || a.name === selectedCategory);
                                            if (!item) return 'R$ 0,00';
                                            return formatBRL(item.value);
                                        })()}
                                    </strong>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="fill"
                                        style={{
                                            width: `${(() => {
                                                const item = allocationData?.find(a => a.type === selectedCategory || a.name === selectedCategory);
                                                if (!item) return '0%';
                                                return item.percentage || ((item.value / allocationData.reduce((sum, a) => sum + a.value, 0)) * 100);
                                            })()}%`
                                        }}
                                    ></div>
                                </div>
                                <p>Isso representa uma parte estratégica do seu portfólio.</p>
                                <button className="btn-action" onClick={() => navigate('/actives')}>Gerenciar Ativos</button>
                            </div>
                        ) : (
                            <div className="chart-container-line">
                                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        )}
                    </section>
                </div>

                {/* 4. GRÁFICOS DE PERFORMANCE */}
                <section className="performance-section glass-panel">
                    <h3>📊 Análise de Performance</h3>
                    <div className="performance-grid">
                        <div className="chart-wrapper">
                            {data?.evolutionChart && data.evolutionChart.length > 0 ? (
                                <EvolutionLineChart
                                    data={data.evolutionChart}
                                    title="Evolução Patrimonial (12 meses)"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
                                    <p className="text-gray-400">Sem dados de evolução</p>
                                </div>
                            )}
                        </div>
                        <div className="chart-wrapper">
                            {data?.allocationChart && data.allocationChart.length > 0 ? (
                                <AllocationPieChart
                                    data={data.allocationChart}
                                    title="Distribuição de Ativos"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
                                    <p className="text-gray-400">Sem dados de alocação</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 5. TOP PERFORMERS */}
                <section className="top-performers-section">
                    {data?.actives && data.actives.length > 0 ? (
                        <TopPerformersWidget
                            topPerformers={data.actives.slice(0, 5)}
                            loading={false}
                            error={null}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-center text-gray-400">Sem ativos para exibir</p>
                        </div>
                    )}
                </section>

                {/* 6. ÚLTIMAS MOVIMENTAÇÕES */}
                <section className="transactions-section">
                    <h3>Últimas Movimentações</h3>
                    <div className="transactions-list-horizontal">
                        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                            data.recentTransactions.map(t => (
                                <div key={t.id} className="trans-card-mini">
                                    <span className={`trans-type ${(t.kind || t.type) === 'Investimento' || (t.kind || t.type) === 'income' ? 'in' : 'profit'}`}>
                                        {(t.kind === 'Investimento' || t.type === 'income') ? 'Aporte' : 'Rendimento'}
                                    </span>
                                    <strong>{formatBRL(t.amount)}</strong>
                                    <small>{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : 'N/A'}</small>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">Nenhuma movimentação registrada.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
