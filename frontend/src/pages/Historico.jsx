import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import { activesApi, historicalBalancesApi, performanceApi } from '../services/apis';
import {
    PerformanceCard,
    PerformanceByPeriod,
} from '../components/PerformanceCharts';
import './Historico.css';

export default function Historico() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: 'Carregando...' });
    const [actives, setActives] = useState([]);
    const [selectedActive, setSelectedActive] = useState(null);
    const [historicalBalances, setHistoricalBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState(null);

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
                selecionarAtivo(data[0]);
            }
        } catch (err) {
            console.error('Erro ao carregar ativos:', err);
        } finally {
            setLoading(false);
        }
    };

    const selecionarAtivo = async (active) => {
        try {
            setSelectedActive(active);
            setLoading(true);

            // Buscar histórico de balances
            const balances = await historicalBalancesApi.listByActive(active.id);
            setHistoricalBalances(balances || []);

            // Buscar performance por períodos
            const performance = await performanceApi.getPerformanceByPeriod(active.id);
            setPerformanceData(performance);
        } catch (err) {
            console.error('Erro ao buscar dados do ativo:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatBRL = (val) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(val || 0);

    const formatData = (date) =>
        new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

    if (loading && actives.length === 0) {
        return <div className="loading">📊 Carregando histórico...</div>;
    }

    return (
        <div className="relatorios-container">
            <div className="relatorios-header">
                <h1>📊 Histórico de Saldos e Performance</h1>
                <p>Acompanhe a evolução dos seus ativos ao longo do tempo</p>
            </div>

            <div className="historico-content">
                {/* Seleção de Ativo */}
                <div className="ativos-selector">
                    <h3>📍 Selecione um Ativo</h3>
                    <div className="ativos-grid">
                        {actives.length > 0 ? (
                            actives.map((active) => (
                                <button
                                    key={active.id}
                                    className={`ativo-btn ${
                                        selectedActive?.id === active.id ? 'active' : ''
                                    }`}
                                    onClick={() => selecionarAtivo(active)}
                                    title={`${active.name} - ${active.type}`}
                                >
                                    <span className="ativo-name">{active.name}</span>
                                    <span className="ativo-type">{active.type}</span>
                                </button>
                            ))
                        ) : (
                            <p className="empty-state">Nenhum ativo cadastrado</p>
                        )}
                    </div>
                </div>

                {selectedActive && !loading && (
                    <>
                        {/* Performance por Períodos */}
                        {performanceData && (
                            <section className="performance-periods">
                                <h3>📈 Performance por Período</h3>
                                <PerformanceByPeriod performance={performanceData} />
                            </section>
                        )}

                        {/* Histórico de Saldos */}
                        {historicalBalances.length > 0 && (
                            <section className="historico-saldos">
                                <h3>💰 Histórico de Saldos - {selectedActive.name}</h3>
                                <div className="tabela-historico">
                                    <div className="tabela-header">
                                        <div className="col-data">Data</div>
                                        <div className="col-valor">Saldo</div>
                                        <div className="col-variacao">Variação</div>
                                        <div className="col-percentual">% Var.</div>
                                    </div>
                                    <div className="tabela-body">
                                        {historicalBalances.map((balance, idx) => {
                                            const prevBalance =
                                                idx > 0
                                                    ? Number(
                                          historicalBalances[idx - 1].value
                                      )
                                                    : Number(balance.value);
                                            const currentValue = Number(balance.value);
                                            const variacao = currentValue - prevBalance;
                                            const percentual =
                                                prevBalance !== 0
                                                    ? (variacao / prevBalance) * 100
                                                    : 0;

                                            return (
                                                <div
                                                    key={balance.id}
                                                    className={`tabela-row ${
                                                        variacao >= 0 ? 'positive' : 'negative'
                                                    }`}
                                                >
                                                    <div className="col-data">
                                                        {formatData(balance.date)}
                                                    </div>
                                                    <div className="col-valor">
                                                        {formatBRL(currentValue)}
                                                    </div>
                                                    <div className="col-variacao">
                                                        {variacao >= 0 ? '+' : ''}
                                                        {formatBRL(variacao)}
                                                    </div>
                                                    <div className="col-percentual">
                                                        {variacao >= 0 ? '+' : ''}
                                                        {percentual.toFixed(2)}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Estatísticas */}
                        {historicalBalances.length > 0 && (
                            <section className="estatisticas-ativo">
                                <h3>📊 Estatísticas de {selectedActive.name}</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <p className="stat-label">💵 Saldo Inicial</p>
                                        <p className="stat-value">
                                            {formatBRL(
                                                Number(
                                                    historicalBalances[0].value
                                                )
                                            )}
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">💰 Saldo Atual</p>
                                        <p className="stat-value">
                                            {formatBRL(
                                                Number(
                                                    historicalBalances[
                                                        historicalBalances.length - 1
                                                    ].value
                                                )
                                            )}
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">📈 Variação Absoluta</p>
                                        <p
                                            className={`stat-value ${
                                                Number(
                                                    historicalBalances[
                                                        historicalBalances.length - 1
                                                    ].value
                                                ) -
                                                    Number(
                                                        historicalBalances[0].value
                                                    ) >=
                                                0
                                                    ? 'positive'
                                                    : 'negative'
                                            }`}
                                        >
                                            {formatBRL(
                                                Number(
                                                    historicalBalances[
                                                        historicalBalances.length - 1
                                                    ].value
                                                ) - Number(historicalBalances[0].value)
                                            )}
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">📊 Variação %</p>
                                        <p
                                            className={`stat-value ${
                                                ((Number(
                                                    historicalBalances[
                                                        historicalBalances.length - 1
                                                    ].value
                                                ) -
                                                    Number(
                                                        historicalBalances[0].value
                                                    )) /
                                                    Number(
                                                        historicalBalances[0].value
                                                    )) *
                                                    100 >=
                                                0
                                                    ? 'positive'
                                                    : 'negative'
                                            }`}
                                        >
                                            {(
                                                ((Number(
                                                    historicalBalances[
                                                        historicalBalances.length - 1
                                                    ].value
                                                ) -
                                                    Number(
                                                        historicalBalances[0].value
                                                    )) /
                                                    Number(
                                                        historicalBalances[0].value
                                                    )) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">📋 Total de Registros</p>
                                        <p className="stat-value">
                                            {historicalBalances.length}
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">📅 Período</p>
                                        <p className="stat-value">
                                            {formatData(
                                                historicalBalances[0].date
                                            )}{' '}
                                            a{' '}
                                            {formatData(
                                                historicalBalances[
                                                    historicalBalances.length - 1
                                                ].date
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {historicalBalances.length === 0 && (
                            <div className="empty-state">
                                ⚠️ Nenhum saldo registrado para este ativo
                            </div>
                        )}
                    </>
                )}

                {actives.length === 0 && (
                    <div className="empty-state">
                        📭 Nenhum ativo cadastrado. Comece criando um novo ativo!
                    </div>
                )}
            </div>
        </div>
    );
}
