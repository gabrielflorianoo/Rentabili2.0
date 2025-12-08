import React, { useState } from 'react';
import InputFlutuante from '../InputFlutuante';
import { servicoAutenticacao } from '../../services/servicoAutenticacao';
import imgLogo from '../../assets/logo.jpeg';

const VersoCartao = ({ aoVirar }) => {
    const [sucesso, setSucesso] = useState(false);
    const [carregando, setCarregando] = useState(false);
    
    // Estado dos dados
    const [dadosForm, setDadosForm] = useState({ 
        nome: '', 
        email: '', 
        nascimento: '', 
        senha: '', 
        confirmarSenha: '' 
    });
    
    // Estado dos erros
    const [erros, setErros] = useState({});

    const lidarComMudanca = (eOrId, maybeValue) => {
        if (eOrId && eOrId.target) {
            const { id, value } = eOrId.target;
            setDadosForm((prev) => ({ ...prev, [id]: value }));
            if (erros[id]) setErros((prev) => ({ ...prev, [id]: '' }));
        } else {
            setDadosForm((prev) => ({ ...prev, [eOrId]: maybeValue }));
        }
    };

    const validar = () => {
        const novosErros = {};
        const regexEspecial = /[!@#$%^&*(),.?":{}|<>]/;

        if (!dadosForm.nome) novosErros.nome = 'Nome é obrigatório';
        if (!dadosForm.email) novosErros.email = 'Email é obrigatório';

        if (!dadosForm.nascimento) {
            novosErros.nascimento = 'Data obrigatória';
        } else {
            const hoje = new Date();
            const nascimento = new Date(dadosForm.nascimento);
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;

            if (idade < 18) novosErros.nascimento = 'Apenas maiores de 18 anos.';
        }

        if (!dadosForm.senha) novosErros.senha = 'Senha obrigatória';
        else if (dadosForm.senha.length < 6) novosErros.senha = 'Mínimo 6 caracteres';
        else if (!regexEspecial.test(dadosForm.senha)) novosErros.senha = 'Exige 1 caractere especial (@#$)';

        if (dadosForm.senha !== dadosForm.confirmarSenha) novosErros.confirmarSenha = 'As senhas não conferem';
        
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const lidarComCadastro = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setCarregando(true);
        const resposta = await servicoAutenticacao.cadastrar(dadosForm);
        setCarregando(false);

        if (resposta.sucesso) {
            setSucesso(true);
        } else {
            setErros({ geral: resposta.erro });
        }
    };

    const preencherAuto = () => {
        setDadosForm({
            nome: 'Usuário Teste',
            email: `teste${Math.floor(Math.random()*1000)}@exemplo.com`,
            nascimento: '2000-01-01',
            senha: '123123@',
            confirmarSenha: '123123@'
        });
        setErros({});
    };

    return (
        <div className="card-face card-back">
            
            {/* ESQUERDA: Formulário (Branco) */}
            <div className="card-section form-section">
                {!sucesso ? (
                    <div className="form-content fade-in-up">
                        <div className="form-header">
                            <h2 className="form-title">Crie sua conta</h2>
                            <p className="form-subtitle">Preencha seus dados abaixo</p>
                        </div>

                        <form onSubmit={lidarComCadastro}>
                            <InputFlutuante id="nome" type="text" rotulo="Nome Completo" valor={dadosForm.nome} aoMudar={lidarComMudanca} erro={erros.nome} required />
                            <InputFlutuante id="email" type="email" rotulo="E-mail" valor={dadosForm.email} aoMudar={lidarComMudanca} erro={erros.email} required />
                            <InputFlutuante id="nascimento" type="date" rotulo="Nascimento" valor={dadosForm.nascimento} aoMudar={lidarComMudanca} erro={erros.nascimento} required />
                            
                            <InputFlutuante id="senha" type="password" rotulo="Senha" valor={dadosForm.senha} aoMudar={lidarComMudanca} erro={erros.senha} required />
                            {!erros.senha && <span className="dica-campo">6 dígitos + 1 especial (@#$)</span>}
                            
                            <InputFlutuante id="confirmarSenha" type="password" rotulo="Confirmar Senha" valor={dadosForm.confirmarSenha} aoMudar={lidarComMudanca} erro={erros.confirmarSenha} required />

                            {erros.geral && <div className="error-message">{erros.geral}</div>}

                            <button type="submit" className="holo-button" disabled={carregando}>
                                {carregando ? 'Cadastrando...' : 'Criar Conta'}
                            </button>

                            <button type="button" className="holo-button secondary-button" onClick={preencherAuto}>
                                Preencher Auto
                            </button>
                        </form>
                    </div>
                ) : (
                    // TELA DE SUCESSO
                    <div className="form-content fade-in-up" style={{textAlign:'center'}}>
                        <div className="form-header">
                            <h2 className="form-title" style={{color: '#00a651'}}>Sucesso!</h2>
                            <p className="form-subtitle">Sua conta foi criada.</p>
                        </div>
                        <button className="holo-button" onClick={() => aoVirar()}>
                            Fazer Login Agora
                        </button>
                    </div>
                )}
            </div>

            {/* DIREITA: Verde (Branding) */}
            <div className="card-section welcome-section">
                <div className="welcome-content fade-in-up">
                    <div className="logo-container">
                        <img src={imgLogo} alt="Logo" className="logo-img" />
                    </div>
                    <h1 className="welcome-title">Controle Total</h1>
                    <p className="welcome-subtitle">Comece a investir hoje mesmo.</p>
                </div>

                <button className="flip-button" onClick={() => aoVirar()}>
                    ← Voltar ao Login
                </button>
            </div>
        </div>
    );
};

export default VersoCartao;
