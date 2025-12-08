import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investmentsApi, activesApi } from '../services/apis';
import { generateInvestment } from '../utils/fakeData';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import './Investimentos.css';
import Modal from '../components/Modal';

export default function Investimentos() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: 'Carregando...' });
    const [investimentos, setInvestimentos] = useState([]);
    const [actives, setActives] = useState([]);
    const [filterKind, setFilterKind] = useState('Todos');
    const [filterActiveType, setFilterActiveType] = useState('Todos');
    const [carregando, setCarregando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalSimulacao, setMostrarModalSimulacao] = useState(false);
    const [investimentoEditando, setInvestimentoEditando] = useState(null);
    const [autoPreencherErro, setAutoPreencherErro] = useState("");
    const [simulandoCompleto, setSimulandoCompleto] = useState(false);
    const [formData, setFormData] = useState({
        activeId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [dataTarget, setDataTarget] = useState(() => {
        const hoje = new Date();
        hoje.setMonth(hoje.getMonth() + 1);
        return hoje.toISOString().split('T')[0];
    });

    useEffect(() => {
        const user = servicoAutenticacao.obterUsuarioAtual();
        const token = servicoAutenticacao.obterToken();

        if (!user || !token) {
            navigate('/');
            return;
        }
        setUserData(user);

        carregarInvestimentos();
        carregarActives();
    }, [navigate]);

    const carregarActives = async () => {
        try {
            const data = await activesApi.list().catch(() => []);
            setActives(data || []);
        } catch (err) {
            console.error('Erro ao carregar ativos:', err);
            setActives([]);
        }
    };

    const carregarInvestimentos = async () => {
        try {
            setCarregando(true);
            const data = await investmentsApi.list();
            setInvestimentos(data || []);
        } catch (err) {
            console.error('Erro ao carregar investimentos:', err);
            if (err.response?.status === 401) {
                servicoAutenticacao.sair();
                navigate('/');
            }
        } finally {
            setCarregando(false);
        }
    };

    const abrirModal = (investimento = null) => {
        if (investimento) {
            setInvestimentoEditando(investimento);
            setFormData({
                activeId: investimento.activeId,
                amount: investimento.amount,
                date: new Date(investimento.date).toISOString().split('T')[0],
                kind: investimento.kind || 'Investimento',
            });
        } else {
            setInvestimentoEditando(null);
            setFormData({
                activeId: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                kind: 'Investimento',
            });
        }
        setMostrarModal(true);
    };

    const fecharModal = () => {
        setMostrarModal(false);
        setInvestimentoEditando(null);
        setFormData({
            activeId: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDateISO = new Date(formData.date).toISOString();
            const dados = {
                ...formData,
                amount: parseFloat(formData.amount),
                activeId: parseInt(formData.activeId),
                date: formDateISO,
                kind: formData.kind || 'Investimento',
            };

            if (investimentoEditando) {
                await investmentsApi.update(investimentoEditando.id, dados);
            } else {
                await investmentsApi.create(dados);
            }

            fecharModal();
            carregarInvestimentos();
        } catch (err) {
            console.error('Erro ao salvar investimento:', err);
            
            setAutoPreencherErro(err.response.data.error);
        }
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm('Tem certeza que deseja excluir este investimento?')
        )
            return;

        try {
            await investmentsApi.remove(id);
            carregarInvestimentos();
        } catch (err) {
            console.error('Erro ao excluir investimento:', err);
            alert(
                'Erro ao excluir investimento: ' +
                (err.response?.data?.error || err.message),
            );
        }
    };

    const handleAutoPreencher = async () => {
        try {
            const actives = await activesApi.list().catch(() => []);
            const fake = generateInvestment(actives);

            setFormData(fake);
        } catch (err) {
            console.error(
                'Erro ao auto-preencher investimentos:',
                err
            );

            setAutoPreencherErro(err.message);
        }
    }

    const handleSimular = async (inv) => {
        try {
            const token = servicoAutenticacao.obterToken();
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                servicoAutenticacao.sair();
                navigate('/');
                return;
            }
            // calcula data do próximo mês
            const base = new Date(inv.date);
            const next = new Date(base);
            next.setMonth(next.getMonth() + 1);

            // variação aleatória entre -5% e +12%
            const min = -0.05;
            const max = 0.12;
            const pct = Math.random() * (max - min) + min;

            const currentAmount = parseFloat(inv.amount);
            const newAmount = parseFloat(
                (currentAmount * (1 + pct)).toFixed(2),
            );

            // Criar entrada do tipo 'Renda' contendo somente o ganho/perda (delta)
            const payload = {
                activeId: inv.activeId,
                amount: newAmount.toFixed(2),
                date: new Date(next).toISOString(),
                kind: 'Renda',
            };

            await investmentsApi.create(payload); // Corrigido: chamando a API correta
            carregarInvestimentos();
        } catch (err) {
            console.error('Erro ao simular investimento:', err);
            if (err.response?.status === 403) {
                // token inválido/expirado
                alert('Ação não autorizada. Faça login novamente.');
                servicoAutenticacao.sair();
                navigate('/');
                return;
            }
            alert(
                'Erro ao simular investimento: ' +
                (err.response?.data?.error || err.message),
            );
        }
    };

    const handleSimulacaoCompleta = async () => {
        try {
            setSimulandoCompleto(true);
            const token = servicoAutenticacao.obterToken();
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                servicoAutenticacao.sair();
                navigate('/');
                return;
            }

            const targetDate = new Date(dataTarget);
            const hoje = new Date();
            const maxDate = new Date(hoje);
            maxDate.setMonth(maxDate.getMonth() + 12);

            if (targetDate > maxDate) {
                alert('Data alvo não pode ser mais de 12 meses no futuro.');
                setSimulandoCompleto(false);
                return;
            }

            if (targetDate <= hoje) {
                alert('Data alvo deve ser no futuro.');
                setSimulandoCompleto(false);
                return;
            }

            // Filtrar apenas investimentos (não rendas)
            const investimentosBase = investimentos.filter(inv => inv.kind !== 'Renda');

            let simulacoesCriadas = 0;

            for (const inv of investimentosBase) {
                const invDate = new Date(inv.date);
                let currentDate = new Date(invDate);
                currentDate.setMonth(currentDate.getMonth() + 1); // Começar do próximo mês

                let currentAmount = parseFloat(inv.amount);

                while (currentDate <= targetDate) {
                    // Verificar se já existe renda para este ativo nesta data
                    const existeRenda = investimentos.some(r => 
                        r.kind === 'Renda' && 
                        r.activeId === inv.activeId && 
                        new Date(r.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
                    );

                    if (!existeRenda) {
                        // variação aleatória entre -5% e +12%
                        const min = -0.05;
                        const max = 0.12;
                        const pct = Math.random() * (max - min) + min;

                        currentAmount = parseFloat((currentAmount * (1 + pct)).toFixed(2));

                        const payload = {
                            activeId: inv.activeId,
                            amount: currentAmount.toFixed(2),
                            date: new Date(currentDate).toISOString(),
                            kind: 'Renda',
                        };

                        await investmentsApi.create(payload);
                        simulacoesCriadas++;
                    }

                    // Avançar para o próximo mês
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }

            alert(`Simulação completa realizada! ${simulacoesCriadas} rendas simuladas.`);
            setMostrarModalSimulacao(false);
            await carregarInvestimentos();
            setSimulandoCompleto(false);
        } catch (err) {
            console.error('Erro na simulação completa:', err);
            if (err.response?.status === 403) {
                alert('Ação não autorizada. Faça login novamente.');
                servicoAutenticacao.sair();
                navigate('/');
                setSimulandoCompleto(false);
                return;
            }
            alert(
                'Erro na simulação completa: ' +
                (err.response?.data?.error || err.message),
            );
            setSimulandoCompleto(false);
        }
    };

    const handleApagarTodasAsRendas = async () => {
        // Verificar se o usuário tem email autorizado
        if (userData.email !== 'email@example.com') {
            alert('Você não tem permissão para executar esta ação.');
            return;
        }

        const rendas = investimentos.filter(inv => inv.kind === 'Renda');
        
        if (rendas.length === 0) {
            alert('Não há rendas para apagar.');
            return;
        }

        const confirmacao = window.confirm(
            `Tem certeza que deseja apagar todas as ${rendas.length} rendas? Esta ação não pode ser desfeita.`
        );

        if (!confirmacao) return;

        try {
            let apagaramComSucesso = 0;
            let erros = 0;

            for (const renda of rendas) {
                try {
                    await investmentsApi.remove(renda.id);
                    apagaramComSucesso++;
                } catch (err) {
                    console.error(`Erro ao apagar renda ${renda.id}:`, err);
                    erros++;
                }
            }

            if (erros === 0) {
                alert(`✅ ${apagaramComSucesso} rendas apagadas com sucesso!`);
            } else {
                alert(`⚠️ ${apagaramComSucesso} rendas apagadas, mas ${erros} falharam.`);
            }

            await carregarInvestimentos();
        } catch (err) {
            console.error('Erro ao apagar rendas:', err);
            alert('Erro ao apagar rendas: ' + (err.response?.data?.error || err.message));
        }
    };

    // Helper maps
    const activeById = React.useMemo(() => {
        const map = new Map();
        (actives || []).forEach((a) => map.set(a.id, a));
        return map;
    }, [actives]);

    const tiposAtivos = React.useMemo(() => {
        const set = new Set();
        (actives || []).forEach((a) => {
            if (a.type) set.add(a.type);
        });
        return Array.from(set);
    }, [actives]);

    return (
        <div className="dashboard-wrap">
            <div className="content">
                <header className="content-head">
                    <h2>Investimentos</h2>
                    <div className="user-badge">👤 {userData.name}</div>
                </header>

                <div className="actions-bar">
                    <button
                        className="btn-primary"
                        onClick={() => abrirModal()}
                    >
                        + Novo Investimento
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => setMostrarModalSimulacao(true)}
                    >
                        🔄 Simulação Completa
                    </button>
                    {userData.email === 'email@example.com' && (
                        <button
                            className="btn-danger"
                            onClick={handleApagarTodasAsRendas}
                            title="Apagar todas as rendas de uma vez"
                        >
                            🗑️ Apagar Todas as Rendas
                        </button>
                    )}
                </div>

                <div className="filters-row">
                    <div className="filter-item">
                        <label>Mostrar:</label>
                        <select
                            value={filterKind}
                            onChange={(e) => setFilterKind(e.target.value)}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Investimento">Investimentos</option>
                            <option value="Renda">Rendas</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Tipo do Ativo:</label>
                        <select
                            value={filterActiveType}
                            onChange={(e) =>
                                setFilterActiveType(e.target.value)
                            }
                        >
                            <option value="Todos">Todos</option>
                            {tiposAtivos.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {carregando ? (
                    <div className={'loading'}>Carregando investimentos...</div>
                ) : (
                    <div className="table-container">
                        {/** Prepare filtered lists **/}
                        {(() => {
                            const filtered = (investimentos || []).filter(
                                (inv) => {
                                    const kindMatch =
                                        filterKind === 'Todos'
                                            ? true
                                            : inv.kind === filterKind;
                                    const ativo =
                                        inv.active ||
                                        activeById.get(inv.activeId);
                                    const tipoMatch =
                                        filterActiveType === 'Todos'
                                            ? true
                                            : ativo &&
                                            ativo.type === filterActiveType;
                                    return kindMatch && tipoMatch;
                                },
                            );

                            const investimentosSomente = filtered.filter(
                                (i) => i.kind !== 'Renda',
                            );
                            const rendas = filtered.filter(
                                (i) => i.kind === 'Renda',
                            );

                            return (
                                <>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Ativo</th>
                                                <th>Valor</th>
                                                <th>Data</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {investimentosSomente.length ===
                                                0 ? (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        style={{
                                                            textAlign: 'center',
                                                            padding: '40px',
                                                        }}
                                                    >
                                                        Nenhum investimento
                                                        cadastrado
                                                    </td>
                                                </tr>
                                            ) : (
                                                investimentosSomente.map(
                                                    (inv) => (
                                                        <tr key={inv.id}>
                                                            <td>{inv.id}</td>
                                                            <td>
                                                                {inv.active
                                                                    ?.name ||
                                                                    activeById.get(
                                                                        inv.activeId,
                                                                    )?.name ||
                                                                    `Ativo #${inv.activeId}`}
                                                            </td>
                                                            <td>
                                                                {new Intl.NumberFormat(
                                                                    'pt-BR',
                                                                    {
                                                                        style: 'currency',
                                                                        currency:
                                                                            'BRL',
                                                                    },
                                                                ).format(
                                                                    inv.amount,
                                                                )}
                                                            </td>
                                                            <td>
                                                                {new Date(
                                                                    inv.date,
                                                                ).toLocaleDateString(
                                                                    'pt-BR',
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn-edit"
                                                                    onClick={() =>
                                                                        abrirModal(
                                                                            inv,
                                                                        )
                                                                    }
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    className="btn-delete"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            inv.id,
                                                                        )
                                                                    }
                                                                >
                                                                    🗑️
                                                                </button>
                                                                <button
                                                                    className="btn-simulate"
                                                                    onClick={() =>
                                                                        handleSimular(
                                                                            inv,
                                                                        )
                                                                    }
                                                                    title="Simular mercado (cria nova renda para o próximo mês)"
                                                                >
                                                                    🔁
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>

                                    {rendas.length > 0 && (
                                        <div className="renda-section">
                                            <h3>Rendas</h3>
                                            <ul className="renda-list">
                                                {rendas.map((r) => {
                                                    // tenta achar o investimento base (último investimento deste ativo antes da renda)
                                                    const base =
                                                        investimentosSomente
                                                            .filter(
                                                                (i) =>
                                                                    i.activeId ===
                                                                    r.activeId &&
                                                                    new Date(
                                                                        i.date,
                                                                    ) <=
                                                                    new Date(
                                                                        r.date,
                                                                    ),
                                                            )
                                                            .sort(
                                                                (a, b) =>
                                                                    new Date(
                                                                        b.date,
                                                                    ) -
                                                                    new Date(
                                                                        a.date,
                                                                    ),
                                                            )[0];
                                                    let displayAmount =
                                                        r.amount;
                                                    // se encontrarmos base e ambos tiverem amount numérico, mostramos apenas o delta
                                                    const amtR =
                                                        parseFloat(r.amount) ||
                                                        (typeof r.amountNum ===
                                                            'number'
                                                            ? r.amountNum
                                                            : NaN);
                                                    const amtBase = base
                                                        ? parseFloat(
                                                            base.amount,
                                                        ) ||
                                                        (typeof base.amountNum ===
                                                            'number'
                                                            ? base.amountNum
                                                            : NaN)
                                                        : NaN;
                                                    if (
                                                        !isNaN(amtR) &&
                                                        !isNaN(amtBase)
                                                    ) {
                                                        const delta = +(
                                                            amtR - amtBase
                                                        ).toFixed(2);
                                                        displayAmount = delta;
                                                    }

                                                    return (
                                                        <li
                                                            key={r.id}
                                                            className="renda-item"
                                                        >
                                                            {'\u00A0'}
                                                            {r.active?.name ||
                                                                activeById.get(
                                                                    r.activeId,
                                                                )?.name ||
                                                                `Ativo #${r.activeId}`}{' '}
                                                            —{' '}
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                displayAmount,
                                                            )}{' '}
                                                            —{' '}
                                                            {new Date(
                                                                r.date,
                                                            ).toLocaleDateString(
                                                                'pt-BR',
                                                            )}
                                                            <button
                                                                className="btn-delete"
                                                                style={{
                                                                    marginLeft: 8,
                                                                }}
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        r.id,
                                                                    )
                                                                }
                                                            >
                                                                🗑️
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* Modal Novo/Editar Investimento */}
                <Modal open={mostrarModal} onClose={fecharModal}>
                    <div className="modal-header">
                        <h3>{investimentoEditando ? '✏️ Editar Investimento' : '➕ Novo Investimento'}</h3>
                        <p>{investimentoEditando ? 'Atualize os dados do investimento' : 'Adicione um novo investimento ao portfólio'}</p>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label htmlFor="activeId">Ativo</label>
                                <select
                                    id="activeId"
                                    value={formData.activeId}
                                    onChange={(e) => setFormData({ ...formData, activeId: e.target.value })}
                                    required
                                >
                                    <option value="">Selecione um ativo...</option>
                                    {actives.map((active) => (
                                        <option key={active.id} value={active.id}>
                                            {active.name} ({active.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">Valor (R$)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 1000.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="kind">Tipo</label>
                                <select 
                                    id="kind"
                                    value={formData.kind} 
                                    onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                                >
                                    <option value="Investimento">Investimento</option>
                                    <option value="Renda">Renda</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="date">Data</label>
                                <input 
                                    id="date"
                                    type="date" 
                                    value={formData.date} 
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                                    required 
                                />
                            </div>
                            {autoPreencherErro && <p className="error-message">{autoPreencherErro}</p>}
                        </form>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleAutoPreencher}>Auto-preencher</button>
                        <button type="button" className="btn-cancel" onClick={fecharModal}>Cancelar</button>
                        <button type="button" className="btn-save" onClick={() => {
                            const form = document.querySelector('.modal-content form');
                            if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
                        }}>Salvar</button>
                    </div>
                </Modal>

                {/* Modal Simulação Completa */}
                <Modal open={mostrarModalSimulacao} onClose={() => !simulandoCompleto && setMostrarModalSimulacao(false)}>
                    <div className="modal-header">
                        <h3>🎯 Simulação Completa</h3>
                        <p>Simule o mercado para todos os seus investimentos</p>
                    </div>
                    <div className="modal-body">
                        {simulandoCompleto ? (
                            <div className="modal-loading">
                                <div className="spinner" />
                                <p className="modal-loading-text">Simulando investimentos...</p>
                                <p className="modal-loading-subtext">Por favor, aguarde enquanto processamos sua simulação.</p>
                            </div>
                        ) : (
                            <>
                                <p>Defina uma data alvo (máximo 12 meses no futuro) e deixe nossa IA simular o comportamento do mercado para todos os seus investimentos.</p>
                                <div className="form-group">
                                    <label htmlFor="dataTarget">Data Alvo</label>
                                    <input
                                        id="dataTarget"
                                        type="date"
                                        value={dataTarget}
                                        onChange={(e) => setDataTarget(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        max={(() => {
                                            const maxDate = new Date();
                                            maxDate.setMonth(maxDate.getMonth() + 12);
                                            return maxDate.toISOString().split('T')[0];
                                        })()}
                                        required
                                    />
                                    <small style={{ color: '#999', marginTop: '4px', display: 'block' }}>Máximo 12 meses a partir de hoje</small>
                                </div>
                            </>
                        )}
                    </div>
                    {!simulandoCompleto && (
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setMostrarModalSimulacao(false)}>Cancelar</button>
                            <button type="button" className="btn-save" onClick={handleSimulacaoCompleta}>Executar Simulação</button>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
