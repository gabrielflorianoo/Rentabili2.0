import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import { activesApi, performanceApi } from '../services/apis';
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
                <h1>📊 Performance de Ativos</h1>
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
                                <h3>📈 Performance por Período - {selectedActive.name}</h3>
                                <PerformanceByPeriod performance={performanceData} />
                            </section>
                        )}

                        {!performanceData && (
                            <div className="empty-state">
                                ⚠️ Nenhum dado de performance disponível para este ativo
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
