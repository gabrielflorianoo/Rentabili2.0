import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsApi, walletsApi } from '../services/apis';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import { useWallet } from '../contexts/WalletContext';
import WalletIndicator from '../components/WalletIndicator';
import './Transacoes.css';
import { generateTransaction } from '../utils/fakeData';

export default function Transacoes() {
    const navigate = useNavigate();
    const { selectedWallet } = useWallet();
    const [userData, setUserData] = useState({ name: 'Carregando...' });
    const [carregando, setCarregando] = useState(true);
    const [transacoes, setTransacoes] = useState([]);
    const [wallets, setWallets] = useState([]);

    // Form
    const [form, setForm] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'income', // 'income' ou 'expense'
        walletId: null,
    });

    const carregarTransacoes = async () => {
        try {
            setCarregando(true);
            const data = await transactionsApi.list().catch(() => []);
            setTransacoes(data || []);
        } catch (err) {
            console.error('Erro ao carregar transações:', err);
            if (err.response?.status === 401) {
                servicoAutenticacao.sair();
                navigate('/');
            }
        } finally {
            setCarregando(false);
        }
    };

    const carregarCarteiras = async () => {
        try {
            const data = await walletsApi.list().catch(() => []);
            setWallets(data || []);
            // Set default wallet: prioritize selected wallet, then first wallet
            if (selectedWallet && data?.some(w => w.id === selectedWallet.id)) {
                setForm(prev => ({ ...prev, walletId: selectedWallet.id }));
            } else if (data && data.length > 0 && !form.walletId) {
                setForm(prev => ({ ...prev, walletId: data[0].id }));
            }
        } catch (err) {
            console.error('Erro ao carregar carteiras:', err);
        }
    };

    useEffect(() => {
        const user = servicoAutenticacao.obterUsuarioAtual();
        const token = servicoAutenticacao.obterToken();

        if (!user || !token) {
            navigate('/');
            return;
        }
        setUserData(user);

        carregarTransacoes();
        carregarCarteiras();
    }, [navigate]);

    // Update form when selectedWallet changes
    useEffect(() => {
        if (selectedWallet && wallets.length > 0) {
            const walletExists = wallets.some(w => w.id === selectedWallet.id);
            if (walletExists) {
                setForm(prev => ({ ...prev, walletId: selectedWallet.id }));
            }
        }
    }, [selectedWallet?.id, wallets.length]); // Only re-run when selectedWallet.id or wallets count changes

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                description: form.description,
                amount: parseFloat(form.amount),
                date: new Date(form.date).toISOString(),
                type: form.type,
                walletId: form.walletId ? parseInt(form.walletId) : null,
            };

            console.log('Payload enviado:', payload);

            await transactionsApi.create(payload);
            setForm({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                walletId: selectedWallet?.id || (wallets.length > 0 ? wallets[0].id : null),
            });
            carregarTransacoes();
            carregarCarteiras(); // Reload wallets to update balances
        } catch (err) {
            console.error('Erro ao criar transação:', err);
            alert(
                'Erro ao salvar transação: ' +
                (err.response?.data?.error || err.message),
            );
        }
    };

    return (
        <div className="dashboard-wrap">
            <div className="content">
                <header className="content-head">
                    <h2>Transações</h2>
                    <div className="user-badge">👤 {userData.name}</div>
                </header>

                <WalletIndicator />

                {carregando ? (
                    <div className="loading">Carregando transações...</div>
                ) : (
                    <>
                        <section className="form-section">
                            <h3>Nova Transação</h3>
                            <form
                                className="trans-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Descrição</label>
                                        <input
                                            type="text"
                                            value={form.description}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Ex: Salário, Compra mercado"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Valor</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    amount: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Data</label>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    date: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Carteira</label>
                                        <select
                                            value={form.walletId}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    walletId: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Nenhuma (Opcional)</option>
                                            {wallets.map((wallet) => (
                                                <option key={wallet.id} value={wallet.id}>
                                                    {wallet.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row align-center">
                                    <div className="toggle-group">
                                        <span
                                            className={`toggle-label ${form.type === 'income' ? 'active' : ''}`}
                                        >
                                            Despesa
                                        </span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form.type === 'expense'
                                                }
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        type: e.target.checked
                                                            ? 'expense'
                                                            : 'income',
                                                    })
                                                }
                                            />
                                            <span className="slider" />
                                        </label>

                                    </div>

                                    <div style={{ marginLeft: 'auto' }}>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() =>
                                                setForm(generateTransaction())
                                            }
                                            style={{
                                                padding: '8px 10px',
                                                borderRadius: 6,
                                                border: '1px solid #ccc',
                                                background: '#fff',
                                            }}
                                        >
                                            Auto-preencher
                                        </button>
                                        <button
                                            className="btn-primary"
                                            type="submit"
                                        >
                                            Salvar Transação
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </section>

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
                                        {transacoes.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '40px',
                                                    }}
                                                >
                                                    Nenhuma transação encontrada
                                                </td>
                                            </tr>
                                        ) : (
                                            transacoes.map((trans) => (
                                                <tr key={trans.id}>
                                                    <td>
                                                        {new Date(
                                                            trans.date,
                                                        ).toLocaleDateString(
                                                            'pt-BR',
                                                        )}
                                                    </td>
                                                    <td>
                                                        {trans.description ||
                                                            'Sem descrição'}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${trans.type === 'income' ? 'badge-green' : 'badge-red'}`}
                                                        >
                                                            {trans.type ===
                                                                'income'
                                                                ? 'Receita'
                                                                : 'Despesa'}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={
                                                            trans.type ===
                                                                'income'
                                                                ? 'text-green'
                                                                : 'text-red'
                                                        }
                                                    >
                                                        {trans.type === 'income'
                                                            ? '+'
                                                            : '-'}
                                                        {new Intl.NumberFormat(
                                                            'pt-BR',
                                                            {
                                                                style: 'currency',
                                                                currency: 'BRL',
                                                            },
                                                        ).format(
                                                            Math.abs(
                                                                trans.amount,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
