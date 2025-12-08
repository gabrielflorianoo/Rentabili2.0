import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activesApi } from '../services/apis';
import { generateActive } from '../utils/fakeData';
import { servicoAutenticacao } from '../services/servicoAutenticacao';
import './Ativos.css';
import Modal from '../components/Modal';

export default function Ativos() {
    const navigate = useNavigate();

    // Estado do usuário logado
    const [userData, setUserData] = useState({ name: 'Carregando...' });

    // Estado da lista de ativos
    const [actives, setActives] = useState([]);

    // Estado de carregamento
    const [loading, setLoading] = useState(true);

    // Controle de exibição do modal
    const [showModal, setShowModal] = useState(false);

    // Controle do ativo sendo editado
    const [editing, setEditing] = useState(null);

    // ALTERAÇÃO: Estado do formulário usando chaves em inglês (name, type, userId)
    const [form, setForm] = useState({ name: '', type: '', userId: '' });

    const [erro, setErro] = useState("");

    // Carrega usuário e ativos ao montar o componente
    useEffect(() => {
        const user = servicoAutenticacao.obterUsuarioAtual();
        const token = servicoAutenticacao.obterToken();

        if (!user || !token) {
            navigate('/');
            return;
        }

        setUserData(user);
        loadActives();
    }, [navigate]);

    const loadActives = async () => {
        try {
            setLoading(true);
            const res = await activesApi.list();
            setActives(res || []);
        } catch (err) {
            console.error('Erro ao carregar ativos:', err);
            if (err?.response?.status === 401) {
                servicoAutenticacao.sair();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    // Abre o modal para criar ou editar um ativo
    const openModal = (item = null) => {
        if (item) {
            setEditing(item);
            // ALTERAÇÃO: Mapeando propriedades em inglês e garantindo fallback
            setForm({ 
                name: item.name || '', 
                type: item.type || '',
                userId: item.userId || '' 
            });
        } else {
            setEditing(null);
            setForm({ name: '', type: '', userId: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', type: '', userId: '' });
    };

    // Submete o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ALTERAÇÃO: Payload já está em inglês baseado no state 'form'
            const payload = { ...form, userId: userData.id };

            if (editing) {
                await activesApi.update(editing.id, payload);
            } else {
                await activesApi.create(payload);
            }

            closeModal();
            loadActives();
        } catch (err) {
            console.error('Erro ao salvar ativo:', err);
            setErro(err.response?.data?.error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este ativo?')) return;

        try {
            await activesApi.remove(id);
            loadActives();
        } catch (err) {
            console.error('Erro ao excluir ativo:', err);
            alert(
                'Erro ao excluir ativo: ' +
                (err.response?.data?.error || err.message),
            );
        }
    };

    // Função auxiliar para gerar dados fake (certifique-se que generateActive retorna name/type em inglês também)
    const handleAutoFill = () => {
        const fake = generateActive();
        // Garante que o fake data mapeie para o inglês se a função original retornar portugues
        setForm({
            name: fake.name || fake.nome || '',
            type: fake.type || fake.tipo || '',
            userId: ''
        });
    }

    return (
        <div className="dashboard-wrap">
            <div className="content">
                <header className="content-head">
                    <h2>Ativos</h2>
                    <div className="user-badge">👤 {userData.name}</div>
                </header>

                <div className="actions-bar">
                    <button className="btn-primary" onClick={() => openModal()}>
                        + Novo Ativo
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Carregando ativos...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actives.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                            Nenhum ativo cadastrado
                                        </td>
                                    </tr>
                                ) : (
                                    actives.map((a) => (
                                        <tr key={a.id}>
                                            <td>{a.id}</td>
                                            {/* ALTERAÇÃO: Renderizando propriedades em inglês */}
                                            <td>{a.name}</td>
                                            <td>{a.type}</td>
                                            <td>
                                                <button className="btn-edit" onClick={() => openModal(a)}>✏️</button>
                                                <button className="btn-delete" onClick={() => handleDelete(a.id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal open={showModal} onClose={closeModal}>
                    <div className="modal-header">
                        <h3>{editing ? '✏️ Editar Ativo' : '➕ Novo Ativo'}</h3>
                        <p>{editing ? 'Atualize as informações do ativo' : 'Adicione um novo ativo ao seu portfólio'}</p>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label htmlFor="name">Nome do Ativo</label>
                                <input 
                                    id="name"
                                    placeholder="Ex: Ação PETR4"
                                    value={form.name || ''} 
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="type">Tipo</label>
                                <input 
                                    id="type"
                                    placeholder="Ex: Ação, Fundo, ETF"
                                    value={form.type || ''} 
                                    onChange={(e) => setForm({ ...form, type: e.target.value })} 
                                    required 
                                />
                            </div>
                            {erro && <p className="error-message">{erro}</p>}
                        </form>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleAutoFill}>Auto-preencher</button>
                        <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                        <button type="button" className="btn-save" onClick={() => {
                            const form = document.querySelector('.modal-content form');
                            if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
                        }}>Salvar</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}