import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import { activesApi, performanceApi, historicalBalancesApi } from '../services/apis';
import {
    useAllPerformance,
    usePerformance,
    useTopPerformers,
} from '../hooks/usePerformanceHooks';
import {
    PerformanceBarChart,
    PerformanceCard,
    PerformanceByPeriod,
} from '../components/PerformanceCharts';
import './AnaliseDados.css';

export default function AnaliseDados() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: 'Carregando...' });
    const [actives, setActives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedActiveId, setSelectedActiveId] = useState(null);
    const [performanceDetail, setPerformanceDetail] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);

    const { performances, loading: perfLoading } = useAllPerformance();
    const { topPerformers, loading: topLoading } = useTopPerformers(5);

    useEffect(() => {
        const user = servicoAutenticacao.obterUsuarioAtual();
        const token = servicoAutenticacao.obterToken();

        if (!user || !token) {
            navigate('/');
            return;
        }

        setUserData(user);
        carregarAtivos();
    }, [navigate]);

    const carregarAtivos = async () => {
        try {
            setLoading(true);
            const data = await activesApi.list();
            setActives(data || []);
            if (data && data.length > 0) {
                selecionarAtivo(data[0].id);
            }
        } catch (err) {
            console.error('Erro ao carregar ativos:', err);
        } finally {
            setLoading(false);
        }
    };

    const selecionarAtivo = async (activeId) => {
        try {
            setSelectedActiveId(activeId);
            setLoading(true);

            // Buscar performance detalhada
            const perfData = await performanceApi.getPerformanceByPeriod(activeId);
            setPerformanceDetail(perfData);

            // Buscar histórico
            const hist = await historicalBalancesApi.listByActive(activeId);
            setHistoricalData(hist || []);
        } catch (err) {
            console.error('Erro ao buscar detalhes:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectedActive = actives.find((a) => a.id === selectedActiveId);
    const selectedPerformance = performances.find((p) => p.activeId === selectedActiveId);

    const formatBRL = (val) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(val || 0);

    return (
        <div className="analise-container">
            <div className="analise-header">
                <h1>📊 Análise Detalhada de Ativos</h1>
                <p>Desempenho, tendências e insights estratégicos</p>
            </div>

            <div className="analise-content">
                {/* Performance Geral */}
                {!perfLoading && performances && performances.length > 0 && (
                    <section className="performance-geral">
                        <h3>📈 Performance Geral da Carteira</h3>
                        <PerformanceBarChart
                            data={performances}
                            title="Comparativo de Todos os Ativos"
                        />
                    </section>
                )}

                {/* Top Performers */}
                {!topLoading && topPerformers?.top && topPerformers.top.length > 0 && (
                    <section className="top-performers">
                        <h3>🚀 Top Performers</h3>
                        <div className="performers-grid">
                            {topPerformers.top.slice(0, 3).map((perf, idx) => (
                                <div key={idx} className="performer-card">
                                    <div className="performer-name">{perf.activeName}</div>
                                    <div className="performer-type">{perf.activeType}</div>
                                    <div className="performer-performance">
                                        {perf.percentage >= 0 ? '+' : ''}{perf.percentage.toFixed(2)}%
                                    </div>
                                    <div className="performer-info">
                                        <span className="performer-info-label">Inicial:</span>
                                        <span className="performer-info-value">
                                            {formatBRL(perf.startValue)}
                                        </span>
                                    </div>
                                    <div className="performer-info">
                                        <span className="performer-info-label">Atual:</span>
                                        <span className="performer-info-value">
                                            {formatBRL(perf.endValue)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Análise Detalhada de Ativo */}
                <section className="analise-detalhada">
                    <h3>🔍 Análise Detalhada por Ativo</h3>

                    {/* Filtro de Ativo */}
                    <div className="filtro-section">
                        <div className="filtro-group">
                            <label htmlFor="ativo-select">Selecione um Ativo</label>
                            <select
                                id="ativo-select"
                                value={selectedActiveId || ''}
                                onChange={(e) => selecionarAtivo(parseInt(e.target.value))}
                            >
                                {actives.map((active) => (
                                    <option key={active.id} value={active.id}>
                                        {active.name} - {active.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedActive && !loading && (
                        <>
                            {/* Card com informações do ativo selecionado */}
                            <div className="analise-ativo-selecionado">
                                <div className="ativo-header">
                                    <div className="ativo-title">
                                        <h2>{selectedActive.name}</h2>
                                    </div>
                                    <span className="ativo-type-badge">{selectedActive.type}</span>
                                </div>

                                {selectedPerformance && (
                                    <div className="ativo-stats">
                                        <div className="ativo-stat">
                                            <div className="ativo-stat-label">Ganho Total</div>
                                            <div className="ativo-stat-value">
                                                {selectedPerformance.percentage >= 0 ? '+' : ''}
                                                {selectedPerformance.percentage.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="ativo-stat">
                                            <div className="ativo-stat-label">Valor Inicial</div>
                                            <div className="ativo-stat-value">
                                                {formatBRL(selectedPerformance.startValue)}
                                            </div>
                                        </div>
                                        <div className="ativo-stat">
                                            <div className="ativo-stat-label">Valor Atual</div>
                                            <div className="ativo-stat-value">
                                                {formatBRL(selectedPerformance.endValue)}
                                            </div>
                                        </div>
                                        <div className="ativo-stat">
                                            <div className="ativo-stat-label">Ganho Absoluto</div>
                                            <div className="ativo-stat-value">
                                                {selectedPerformance.absoluteGain >= 0 ? '+' : ''}
                                                {formatBRL(selectedPerformance.absoluteGain)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Performance por Período */}
                            {performanceDetail && (
                                <section className="grafico-container">
                                    <h4>📊 Performance em Diferentes Períodos</h4>
                                    <PerformanceByPeriod performance={performanceDetail} />
                                </section>
                            )}

                            {/* Histórico de Saldos */}
                            {historicalData.length > 0 && (
                                <section className="comparativo-table">
                                    <h3>💾 Últimos Saldos Registrados</h3>
                                    <div className="tabela-header">
                                        <div className="ativo-col-name">Data</div>
                                        <div className="ativo-col-type">Saldo</div>
                                    </div>
                                    <div className="tabela-body">
                                        {historicalData.slice(-10).map((balance) => (
                                            <div key={balance.id} className="tabela-row">
                                                <div className="ativo-col-name">
                                                    {new Date(balance.date).toLocaleDateString(
                                                        'pt-BR'
                                                    )}
                                                </div>
                                                <div className="ativo-col-type">
                                                    {formatBRL(Number(balance.value))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {actives.length === 0 && (
                        <div className="empty-state">
                            📭 Nenhum ativo cadastrado. Comece criando um novo ativo!
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
