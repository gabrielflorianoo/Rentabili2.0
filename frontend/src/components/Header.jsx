import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DarkModeToggle from "../components/DarkModeToggle";

export default function Header() {
    // Hook do React Router para navegação programática
    const navigate = useNavigate();

    return (
        <header className="header">
            {/* Marca / Logo */}
            <div className="brand">
                <div className="logo-icon">
                    {/* Ícone SVG da marca */}
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 3v18h18" />
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                    </svg>
                </div>
                <span className="logo-text">RENTABILI</span>
            </div>

            {/* Menu de navegação */}
            <nav className="menu">
                <Link to="/">Início</Link>
                <Link to="/resumo">Resumo</Link>
                <Link to="/planos">Planos</Link>
                <Link to="/sobre">Sobre</Link>
            </nav>

            {/* Lado direito do header: dark mode e botão de acesso */}
            <div className="header-right">
                {/* Componente para alternar tema dark/light */}
                <DarkModeToggle />

                {/* Botão que navega para a página de login */}
                <button
                    onClick={() => navigate('/login')}
                    className="btn-acesso"
                >
                    ACESSE AQUI
                </button>
            </div>
        </header>
    );
}
