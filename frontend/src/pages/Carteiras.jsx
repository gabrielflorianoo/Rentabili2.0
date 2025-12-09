import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletsApi } from '../services/apis';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import { useWallet } from '../contexts/WalletContext';
import './Transacoes.css';

export default function Carteiras() {
    const navigate = useNavigate();
    const { selectedWallet, selectWallet } = useWallet();
    const [userData, setUserData] = useState({ name: 'Carregando...' });
    const [loading, setLoading] = useState(true);
    const [wallets, setWallets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);
    
    const [form, setForm] = useState({
        name: '',
        balance: '',
    });

    const loadWallets = async () => {
        try {
            setLoading(true);
            const data = await walletsApi.list().catch(() => []);
            setWallets(data || []);
        } catch (err) {
            console.error('Erro ao carregar carteiras:', err);
            if (err.response?.status === 401) {
                servicoAutenticacao.sair();
                navigate('/');
            }
        } finally {
            setLoading(false);
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
        loadWallets();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                name: form.name,
                balance: parseFloat(form.balance),
            };

            if (editingWallet) {
                await walletsApi.update(editingWallet.id, payload);
            } else {
                await walletsApi.create(payload);
            }

            setForm({ name: '', balance: '' });
            setShowForm(false);
            setEditingWallet(null);
            loadWallets();
        } catch (err) {
            console.error('Erro ao salvar carteira:', err);
            alert(
                'Erro ao salvar carteira: ' +
                    (err.response?.data?.error || err.message)
            );
        }
    };

    const handleEdit = (wallet) => {
        setEditingWallet(wallet);
        setForm({
            name: wallet.name,
            balance: wallet.balance.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta carteira?')) {
            return;
        }

        try {
            await walletsApi.remove(id);
            loadWallets();
        } catch (err) {
            console.error('Erro ao deletar carteira:', err);
            alert(
                'Erro ao deletar carteira: ' +
                    (err.response?.data?.error || err.message)
            );
        }
    };

    const handleCancel = () => {
        setForm({ name: '', balance: '' });
        setShowForm(false);
        setEditingWallet(null);
    };

    const handleSelectWallet = (wallet) => {
        selectWallet(wallet);
    };

    const formatBRL = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value || 0);
    };

    const totalBalance = useMemo(() => {
        return wallets.reduce((sum, wallet) => sum + (Number(wallet.balance) || 0), 0);
    }, [wallets]);

    return (
        <div className="dashboard-wrap">
            <div className="content">
                <header className="content-head">
                    <h2>💳 Carteiras</h2>
                    <div className="user-badge">👤 {userData.name}</div>
                </header>

                {/* Selected Wallet Indicator */}
                {selectedWallet && (
                    <div style={{
                        padding: '15px',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Carteira Selecionada:</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedWallet.name}</div>
                        </div>
                        <button
                            onClick={() => selectWallet(null)}
                            style={{
                                padding: '8px 15px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Desselecionar
                        </button>
                    </div>
                )}

                {/* Total Balance Summary */}
                <div className="summary-card" style={{ marginBottom: '20px' }}>
                    <h3>Saldo Total</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                        {formatBRL(totalBalance)}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                        {wallets.length} {wallets.length === 1 ? 'carteira' : 'carteiras'}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Carregando carteiras...</div>
                ) : (
                    <>
                        {/* Add Wallet Button */}
                        {!showForm && (
                            <button
                                className="btn-primary"
                                onClick={() => setShowForm(true)}
                                style={{ marginBottom: '20px' }}
                            >
                                ➕ Nova Carteira
                            </button>
                        )}

                        {/* Wallet Form */}
                        {showForm && (
                            <section className="form-section">
                                <h3>{editingWallet ? 'Editar Carteira' : 'Nova Carteira'}</h3>
                                <form className="trans-form" onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nome da Carteira</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Ex: Carteira Principal, Poupança"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Saldo Inicial</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.balance}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        balance: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row" style={{ justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={handleCancel}
                                            style={{ marginRight: '10px' }}
                                        >
                                            Cancelar
                                        </button>
                                        <button className="btn-primary" type="submit">
                                            {editingWallet ? 'Atualizar' : 'Criar'} Carteira
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}

                        {/* Wallets List */}
                        <section className="trans-list">
                            <h3>Minhas Carteiras</h3>
                            {wallets.length === 0 ? (
                                <div className="empty-message">
                                    Nenhuma carteira cadastrada ainda. Crie uma para começar!
                                </div>
                            ) : (
                                <div className="wallets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                     {wallets.map((wallet) => (
                                        <div
                                            key={wallet.id}
                                            className="wallet-card"
                                            style={{
                                                padding: '20px',
                                                border: selectedWallet?.id === wallet.id ? '2px solid #4CAF50' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                backgroundColor: selectedWallet?.id === wallet.id ? '#f0f9f0' : '#fff',
                                                boxShadow: selectedWallet?.id === wallet.id ? '0 4px 8px rgba(76, 175, 80, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                                            }}
                                        >
                                            {selectedWallet?.id === wallet.id && (
                                                <div style={{ 
                                                    marginBottom: '10px', 
                                                    fontSize: '0.85rem', 
                                                    color: '#4CAF50',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    ✓ Carteira Selecionada
                                                </div>
                                            )}
                                            <div style={{ marginBottom: '15px' }}>
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                                                    {wallet.name}
                                                </h4>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196F3' }}>
                                                    {formatBRL(wallet.balance)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>
                                                Criada em:{' '}
                                                {new Date(wallet.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                <button
                                                    onClick={() => handleEdit(wallet)}
                                                    className="btn-secondary"
                                                    style={{ flex: 1, padding: '8px' }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(wallet.id)}
                                                    className="btn-danger"
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: '#f44336',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleSelectWallet(wallet)}
                                                className="btn-primary"
                                                disabled={selectedWallet?.id === wallet.id}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: selectedWallet?.id === wallet.id ? '#ccc' : '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: selectedWallet?.id === wallet.id ? 'not-allowed' : 'pointer',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {selectedWallet?.id === wallet.id ? '✓ Selecionada' : '👆 Selecionar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
