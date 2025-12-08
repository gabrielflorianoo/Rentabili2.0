import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputFlutuante from '../InputFlutuante';
import { servicoAutenticacao } from '../../services/servicoAutenticacao';
import imgLogo from '../../assets/logo.jpeg';

const FrenteCartao = ({ aoVirar }) => {
    const navigate = useNavigate();
    
    // Estados para controlar o fluxo (Login -> Recuperar -> Validar)
    const [visualizacao, setVisualizacao] = useState('login');
    const [dadosForm, setDadosForm] = useState({ email: '', senha: '', codigo: '', novaSenha: '' });
    const [carregando, setCarregando] = useState(false);
    const [erros, setErros] = useState({});

    // Atualiza inputs
    const lidarComMudanca = (e) => {
        setDadosForm({ ...dadosForm, [e.target.id]: e.target.value });
        if (erros[e.target.id]) setErros({ ...erros, [e.target.id]: '' });
    };

    // --- FUNÇÕES DE LÓGICA ---

    const lidarComLogin = async (e) => {
        e.preventDefault();
        setCarregando(true);
        const resposta = await servicoAutenticacao.entrar(dadosForm.email, dadosForm.senha);
        setCarregando(false);

        if (resposta.sucesso) navigate('/dashboard');
        else setErros({ [resposta.campo || 'geral']: resposta.erro });
    };

    const lidarComEsqueciSenha = (e) => {
        e.preventDefault();
        if (!dadosForm.email) {
            setErros({ email: 'Digite seu e-mail para continuar.' });
            return;
        }
        alert(`SIMULAÇÃO: Código enviado para ${dadosForm.email} (Use: 123456)`);
        setVisualizacao('validar');
        setErros({});
    };

    const lidarComValidacao = (e) => {
        e.preventDefault();
        if (dadosForm.codigo !== '123456') {
            setErros({ codigo: 'Código inválido.' });
            return;
        }
        if (dadosForm.novaSenha.length < 6) {
            setErros({ novaSenha: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }
        alert('Senha redefinida com sucesso! Faça login.');
        setVisualizacao('login');
        setDadosForm(prev => ({ ...prev, senha: '', codigo: '', novaSenha: '' }));
    };

    // Preenchimento automático para testes
    const preencherAutomaticamente = () => {
        setDadosForm({ ...dadosForm, email: 'email@example.com', senha: '123123@' });
        setErros({});
    };

    return (
        <div className="card-face card-front">
            
            {/* LADO ESQUERDO: VERDE (Boas Vindas) */}
            <div className="card-section welcome-section">
                <div className="welcome-content fade-in-up">
                    <div 
                        className="logo-container" 
                        onClick={() => navigate('/')}
                        title="Voltar para Home"
                    >
                        <img src={imgLogo} alt="Logo" className="logo-img" />
                    </div>
                    <h1 className="welcome-title">Rentabili Investidor</h1>
                    <p className="welcome-subtitle">Bem-vindo ao futuro dos investimentos.</p>
                </div>
                
                {/* Botão que chama a função de virar o cartão */}
                <button className="flip-button" onClick={aoVirar}>
                    Criar Conta Nova →
                </button>
            </div>

            {/* LADO DIREITO: BRANCO (Formulários Dinâmicos) */}
            <div className="card-section form-section">
                
                {/* TELA 1: LOGIN */}
                {visualizacao === 'login' && (
                    <div className="form-content fade-in-up">
                        <div className="form-header">
                            <h2 className="form-title">Acesse sua conta</h2>
                            <p className="form-subtitle">Entre com suas credenciais</p>
                        </div>

                        <form onSubmit={lidarComLogin}>
                            <InputFlutuante 
                                id="email" type="email" rotulo="E-mail" 
                                valor={dadosForm.email} aoMudar={lidarComMudanca} erro={erros.email} required 
                            />
                            <InputFlutuante 
                                id="senha" type="password" rotulo="Senha" 
                                valor={dadosForm.senha} aoMudar={lidarComMudanca} erro={erros.senha} required 
                            />
                            
                            {erros.geral && <span className="error-message">{erros.geral}</span>}

                            <button type="submit" className="holo-button" disabled={carregando}>
                                {carregando ? 'Entrando...' : 'Entrar na Conta'}
                            </button>

                            <button type="button" className="holo-button secondary-button" onClick={preencherAutomaticamente}>
                                Preencher Auto
                            </button>
                        </form>

                        <a href="#" className="form-link" onClick={(e) => { e.preventDefault(); setVisualizacao('recuperar'); }}>
                            Esqueceu sua senha?
                        </a>
                    </div>
                )}

                {/* TELA 2: RECUPERAR (Pedir E-mail) */}
                {visualizacao === 'recuperar' && (
                    <div className="form-content fade-in-up">
                        <div className="form-header">
                            <h2 className="form-title">Recuperar Senha</h2>
                            <p className="form-subtitle">Informe seu e-mail</p>
                        </div>
                        <form onSubmit={lidarComEsqueciSenha}>
                            <InputFlutuante 
                                id="email" type="email" rotulo="Seu E-mail" 
                                valor={dadosForm.email} aoMudar={lidarComMudanca} erro={erros.email} required 
                            />
                            <button type="submit" className="holo-button">Enviar Código</button>
                        </form>
                        <a href="#" className="form-link" onClick={(e) => { e.preventDefault(); setVisualizacao('login'); }}>
                            ← Voltar para Login
                        </a>
                    </div>
                )}

                {/* TELA 3: VALIDAR CÓDIGO */}
                {visualizacao === 'validar' && (
                    <div className="form-content fade-in-up">
                        <div className="form-header">
                            <h2 className="form-title">Redefinir</h2>
                            <p className="form-subtitle">Código enviado para seu e-mail</p>
                        </div>
                        <form onSubmit={lidarComValidacao}>
                            <InputFlutuante 
                                id="codigo" type="text" rotulo="Código (Use 123456)" 
                                valor={dadosForm.codigo} aoMudar={lidarComMudanca} erro={erros.codigo} required 
                            />
                            <InputFlutuante 
                                id="novaSenha" type="password" rotulo="Nova Senha" 
                                valor={dadosForm.novaSenha} aoMudar={lidarComMudanca} erro={erros.novaSenha} required 
                            />
                            <button type="submit" className="holo-button">Salvar Nova Senha</button>
                        </form>
                        <a href="#" className="form-link" onClick={(e) => { e.preventDefault(); setVisualizacao('login'); }}>
                            Cancelar
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FrenteCartao;
