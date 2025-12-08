import React from 'react';
import { Navigate } from 'react-router-dom';
import { servicoAutenticacao } from '../services/servicoAutenticacao';

export default function RotaProtegida({ children }) {
    // Obtém o usuário atual do serviço de autenticação
    const usuario = servicoAutenticacao.obterUsuarioAtual();

    // Obtém o token de autenticação do serviço
    const token = servicoAutenticacao.obterToken();

    // Se não houver usuário ou token válido, redireciona para a página inicial
    if (!usuario || !token) {
        return <Navigate to="/" replace />; // 'replace' evita histórico duplicado
    }

    // Caso o usuário esteja autenticado, renderiza os filhos (conteúdo protegido)
    return children;
}
