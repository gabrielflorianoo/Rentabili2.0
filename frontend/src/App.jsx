import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'; // Importe o Outlet também (embora só seja necessário no Layout, teremos ele no App.js)
import { servicoAutenticacao } from './services/servicoAutenticacao';

// Importação das Páginas
import HomeHero from './pages/HomeHero';
import PaginaAutenticacao from './pages/PaginaAutenticacao';
import Dashboard from './pages/DashBoard';

// --- NOVAS IMPORTAÇÕES NECESSÁRIAS ---
import Resumo from './pages/Resumo';
import Planos from './pages/Planos';
import Sobre from './pages/Sobre';
import Investimentos from './pages/Investimentos';
import Relatorios from './pages/Relatorios';
import Ativos from './pages/Ativos';
import Transacoes from './pages/Transacoes';
import Simulador from './pages/Simulador';
import Historico from './pages/Historico';
import AnaliseDados from './pages/AnaliseDados';

// --- IMPORTAÇÃO DE COMPONENTES DE LAYOUT E ROTA ---
import RotaProtegida from './components/ProtectRout'; // Mantido
import Sidebar from './components/Sidebar'; // Ainda precisamos dele aqui se não usarmos o LayoutComponent
import SidebarLayout from './layouts/SidebarLayout'; // Adicione a importação do Layout
import './styles/estilo.css';
import './styles/improvements.css';
import './styles/sidebar.css';
import './styles/pages.css';
import './styles/performance.css';

const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
        servicoAutenticacao.sair();
        window.location.href = "/login";
    }
}

const ProtectedLayout = ({ aoSair }) => (
    <RotaProtegida>
        <SidebarLayout aoSair={aoSair} />
    </RotaProtegida>
);

export default function App() {
    return (
        <Router>
            <Routes>
                {/* ROTAS PÚBLICAS SEM SIDEBAR */}
                <Route path="/" element={<HomeHero />} />
                <Route path="/login" element={<PaginaAutenticacao />} />
                <Route path="/resumo" element={<Resumo />} />
                <Route path="/planos" element={<Planos />} />
                <Route path="/sobre" element={<Sobre />} />

                {/* -------------------------------------------------------------------- */}

                {/* ROTA PAI COM LAYOUT E PROTEÇÃO - O ProtectedLayout define o Sidebar e o Auth Guard */}
                <Route element={<ProtectedLayout aoSair={handleLogout} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/investimentos" element={<Investimentos />} />
                    <Route path="/transacoes" element={<Transacoes />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/actives" element={<Ativos />} />
                    <Route path="/simulador" element={<Simulador />} />
                    <Route path="/historico" element={<Historico />} />
                    <Route path="/analise" element={<AnaliseDados />} />
                </Route>

                {/* Rota 404 de fallback */}
                <Route path="*" element={<h1>404 | Página Não Encontrada</h1>} />

            </Routes>
        </Router>
    );
}