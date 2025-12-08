import React, { useState } from "react";
import "../styles/simulador.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Tipos pré-definidos para facilitar a vida do usuário (Taxas Anuais Estimadas)
const OPCOES_INVESTIMENTO = {
    POUPANCA: { label: 'Poupança (Isento)', taxa: 6.17, tipoIR: 'ISENTO' },
    NU_CONTA: { label: 'Conta Digital (100% CDI)', taxa: 10.65, tipoIR: 'REGRESSIVO' },
    CDB_110: { label: 'CDB Promo (110% CDI)', taxa: 11.71, tipoIR: 'REGRESSIVO' },
    LCI_90: { label: 'LCI/LCA (90% CDI - Isento)', taxa: 9.58, tipoIR: 'ISENTO' },
    TESOURO: { label: 'Tesouro Selic', taxa: 10.75, tipoIR: 'REGRESSIVO' },
    ACOES: { label: 'Carteira de Ações (Est. 15%)', taxa: 15.00, tipoIR: 'RENDA_VARIAVEL' },
};

const CORES = ['#00a651', '#d90429', '#0077b6', '#9b5de5', '#f15bb5', '#fee440'];

// Estado inicial para permitir o reset fácil do formulário
const ESTADO_INICIAL = {
    nome: '',
    aporteInicial: 1000,
    aporteMensal: 200,
    taxaAnual: 10.65, 
    tipoIR: 'REGRESSIVO',
    prazoMeses: 24
};

// Configurações do gráfico (para formatar o eixo Y e tooltip em R$)
const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' },
        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        },
    },
    scales: {
        y: {
            ticks: {
                // Formata o eixo Y para moeda brasileira
                callback: function(value, index, ticks) {
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                }
            }
        }
    }
};


export default function Simulador() {
    // Estado da lista de cenários
    const [cenarios, setCenarios] = useState([]);
    
    // Estado do formulário de adição (usa ESTADO_INICIAL)
    const [novoCenario, setNovoCenario] = useState(ESTADO_INICIAL);

    const [graficoData, setGraficoData] = useState(null);

    // --- FUNÇÕES AUXILIARES ---
    
    const calcularIR = (dias, tipo) => {
        if (tipo === 'ISENTO') return 0;
        if (tipo === 'RENDA_VARIAVEL') return 15.0; // Swing trade padrão
        // Tabela Regressiva
        if (dias <= 180) return 22.5;
        if (dias <= 360) return 20.0;
        if (dias <= 720) return 17.5;
        return 15.0;
    };

    const adicionarCenario = () => {
        if (!novoCenario.nome) {
            alert("Dê um nome para este cenário (Ex: Minha Aposentadoria)");
            return;
        }
        
        // Conversão de taxa anual para mensal equivalente
        const taxaAnualDecimal = Number(novoCenario.taxaAnual) / 100;
        const taxaMensal = Math.pow(1 + taxaAnualDecimal, 1 / 12) - 1;
        
        // Garante que os inputs sejam tratados como números
        const aporteInicial = Number(novoCenario.aporteInicial);
        const aporteMensal = Number(novoCenario.aporteMensal);
        const prazoMeses = Number(novoCenario.prazoMeses);
        
        let montante = aporteInicial;
        let totalInvestido = aporteInicial;
        const evolucao = [montante];

        // Cálculo mês a mês (juros aplicados ANTES do novo aporte)
        for (let i = 1; i <= prazoMeses; i++) {
            montante = montante * (1 + taxaMensal) + aporteMensal;
            totalInvestido += aporteMensal;
            evolucao.push(montante);
        }

        // Cálculo Final (Impostos) - Prazo aproximado em dias
        const lucroBruto = montante - totalInvestido;
        const diasTotais = prazoMeses * 30; // Simplificação para IR
        const aliquota = calcularIR(diasTotais, novoCenario.tipoIR);
        const imposto = lucroBruto > 0 ? lucroBruto * (aliquota / 100) : 0;
        const liquido = montante - imposto;

        const cenarioCalculado = {
            id: Date.now(),
            ...novoCenario,
            resultado: {
                bruto: montante,
                liquido: liquido,
                investido: totalInvestido,
                lucro: liquido - totalInvestido,
                evolucao: evolucao
            }
        };

        const novaLista = [...cenarios, cenarioCalculado];
        setCenarios(novaLista);
        atualizarGrafico(novaLista);
        
        // Resetar o formulário após adicionar o cenário (Melhoria UX)
        setNovoCenario(ESTADO_INICIAL);
    };

    const removerCenario = (id) => {
        const novaLista = cenarios.filter(c => c.id !== id);
        setCenarios(novaLista);
        atualizarGrafico(novaLista);
    };

    const atualizarGrafico = (lista) => {
        if (lista.length === 0) {
            setGraficoData(null);
            return;
        }

        // Pega o maior prazo para definir o eixo X do gráfico
        const maiorPrazo = Math.max(...lista.map(c => Number(c.prazoMeses)));
        const labels = Array.from({ length: maiorPrazo + 1 }, (_, i) => `Mês ${i}`);

        const datasets = lista.map((c, index) => {
            const dataComPadding = [...c.resultado.evolucao];
            
            // Adiciona 'null' para preencher os dados de cenários mais curtos
            // Isso garante que a linha termine no mês correto no gráfico
            while (dataComPadding.length <= maiorPrazo) { 
                dataComPadding.push(null);
            }

            return {
                label: c.nome,
                data: dataComPadding,
                borderColor: CORES[index % CORES.length],
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 2
            }
        });

        setGraficoData({ labels, datasets });
    };

    const handleSelectPreset = (key) => {
        const preset = OPCOES_INVESTIMENTO[key];
        setNovoCenario({
            ...novoCenario,
            nome: preset.label, // Sugere nome
            taxaAnual: preset.taxa,
            tipoIR: preset.tipoIR
        });
    };
    
    // Função unificada para manipular inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoCenario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="dashboard-wrap">
            <div className="content">
                <header className="content-head">
                    <h2>Simulador Multi-Cenários</h2>
                    <div className="user-badge">Comparativo Avançado</div>
                </header>

                <div className="simulador-container">
                    
                    {/* --- 1. ÁREA DE CADASTRO DE CENÁRIO --- */}
                    <div className="form-section">
                        <h1 className="simuladorTitulo">Adicionar Novo Investimento à Comparação</h1>
                        
                        {/* Botões Rápidos de Tipo */}
                        <div className="presets-row">
                            {Object.keys(OPCOES_INVESTIMENTO).map(key => (
                                <button 
                                    key={key} 
                                    className="btn-preset"
                                    onClick={() => handleSelectPreset(key)}
                                >
                                    {OPCOES_INVESTIMENTO[key].label}
                                </button>
                            ))}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Nome do Cenário</label>
                                <input 
                                    className="simuladorInput" 
                                    placeholder="Ex: CDB do Banco X"
                                    name="nome"
                                    value={novoCenario.nome} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Taxa (% ao Ano)</label>
                                <input 
                                    type="number" 
                                    className="simuladorInput" 
                                    name="taxaAnual"
                                    value={novoCenario.taxaAnual} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo de Imposto</label>
                                <select 
                                    className="simuladorInput" 
                                    name="tipoIR"
                                    value={novoCenario.tipoIR} 
                                    onChange={handleInputChange}
                                >
                                    <option value="REGRESSIVO">Regressivo (CDB/Tesouro)</option>
                                    <option value="ISENTO">Isento (LCI/LCA/Poupança)</option>
                                    <option value="RENDA_VARIAVEL">Renda Variável (15%)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Aporte Inicial (R$)</label>
                                <input 
                                    type="number" 
                                    className="simuladorInput" 
                                    name="aporteInicial"
                                    value={novoCenario.aporteInicial} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Aporte Mensal (R$)</label>
                                <input 
                                    type="number" 
                                    className="simuladorInput" 
                                    name="aporteMensal"
                                    value={novoCenario.aporteMensal} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Prazo (Meses)</label>
                                <input 
                                    type="number" 
                                    className="simuladorInput" 
                                    name="prazoMeses"
                                    value={novoCenario.prazoMeses} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                        </div>

                        <button onClick={adicionarCenario} className="simuladorButton">
                            + ADICIONAR À COMPARAÇÃO
                        </button>
                    </div>

                    {/* --- 2. RESULTADOS (HORIZONTAL) --- */}
                    {cenarios.length > 0 && (
                        <>
                            <h3 className="section-title-small">Ranking de Resultados (Líquidos)</h3>
                            
                            <div className="cards-horizontal-scroll">
                                {cenarios
                                    .sort((a, b) => b.resultado.liquido - a.resultado.liquido) // Ordena do maior pro menor
                                    .map((cenario, index) => (
                                    <div key={cenario.id} className="resultado-card" style={{borderTop: `5px solid ${CORES[index % CORES.length]}`}}>
                                        <div className="card-header">
                                            <span className="posicao">#{index + 1}</span>
                                            <h4>{cenario.nome}</h4>
                                            <button className="btn-close" onClick={() => removerCenario(cenario.id)}>×</button>
                                        </div>
                                        
                                        <div className="card-body">
                                            <div className="row">
                                                <span>Valor Líquido:</span>
                                                <strong className="valor-final">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cenario.resultado.liquido)}
                                                </strong>
                                            </div>
                                            <div className="row">
                                                <span>Lucro Real:</span>
                                                <span className="valor-lucro">
                                                    +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cenario.resultado.lucro)}
                                                </span>
                                            </div>
                                            <hr/>
                                            <div className="row-small">
                                                <span>Taxa:</span>
                                                <span>{cenario.taxaAnual}% a.a.</span>
                                            </div>
                                            <div className="row-small">
                                                <span>Total Investido:</span>
                                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cenario.resultado.investido)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- 3. GRÁFICO COMPARATIVO --- */}
                            <div className="chartWrapper">
                                <h3 style={{textAlign: 'center', marginBottom: '15px'}}>Curva de Evolução Patrimonial</h3>
                                {graficoData && <Line data={graficoData} options={chartOptions} />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}