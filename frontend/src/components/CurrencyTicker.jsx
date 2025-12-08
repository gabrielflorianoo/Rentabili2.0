import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from './Modal';
import './CurrencyTicker.css';

export default function CurrencyTicker() {
    const [cotacoes, setCotacoes] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL');
                const data = await res.json();
                setCotacoes(data);
            } catch (error) {
                console.error("Erro cotações:", error);
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCoinClick = async (coinCode, name) => {
        // Pausa o letreiro imediatamente ao clicar
        setModalOpen(true); 
        setSelectedCoin({ code: coinCode, name });
        setLoadingHistory(true);

        try {
            const res = await fetch(`https://economia.awesomeapi.com.br/json/daily/${coinCode}-BRL/7`);
            const data = await res.json();
            
            const formatted = data.map(item => ({
                data: new Date(item.timestamp * 1000).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
                valor: parseFloat(item.bid)
            })).reverse();

            setHistoryData(formatted);
        } catch (error) {
            console.error("Erro histórico:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!cotacoes) return null;

    const renderItem = (key, label, name) => {
        const item = cotacoes[key];
        if (!item) return null;
        const varValue = parseFloat(item.pctChange);
        
        return (
            <span className="ticker-item" onClick={() => handleCoinClick(item.code, name)}>
                {label}: 
                <span className="ticker-value">R$ {parseFloat(item.bid).toFixed(2)}</span>
                <span className={`variation ${varValue >= 0 ? 'positive' : 'negative'}`}>
                    ({varValue >= 0 ? '+' : ''}{varValue}%)
                </span>
            </span>
        );
    };

    return (
        <>
            <div className="ticker-container">
                {/* AQUI ESTÁ A MÁGICA: Adiciona a classe 'paused' se o modal estiver aberto */}
                <div className={`ticker-content ${modalOpen ? 'paused' : ''}`}>
                    {renderItem('USDBRL', '🇺🇸 Dólar', 'Dólar Americano')}
                    {renderItem('EURBRL', '🇪🇺 Euro', 'Euro')}
                    {renderItem('BTCBRL', '₿ Bitcoin', 'Bitcoin')}
                    {/* Repetição para loop visual */}
                    {renderItem('USDBRL', '🇺🇸 Dólar', 'Dólar Americano')}
                    {renderItem('EURBRL', '🇪🇺 Euro', 'Euro')}
                    {renderItem('BTCBRL', '₿ Bitcoin', 'Bitcoin')}
                    {renderItem('USDBRL', '🇺🇸 Dólar', 'Dólar Americano')}
                    {renderItem('EURBRL', '🇪🇺 Euro', 'Euro')}
                    {renderItem('BTCBRL', '₿ Bitcoin', 'Bitcoin')}
                </div>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="currency-modal-content">
                    <div className="currency-header">
                        <h3>Histórico: {selectedCoin?.name} (7 Dias)</h3>
                        <p>Variação BRL</p>
                    </div>

                    {loadingHistory ? (
                        <div className="loading-chart">Carregando dados...</div>
                    ) : (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={historyData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00a651" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#00a651" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="data" />
                                    <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `R$${val}`} />
                                    <Tooltip 
                                        formatter={(val) => `R$ ${val.toFixed(3)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="valor" 
                                        stroke="#00a651" 
                                        fillOpacity={1} 
                                        fill="url(#colorVal)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}