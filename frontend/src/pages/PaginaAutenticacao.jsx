import React from 'react';
import FundoAnimado from '../components/FundoAnimado'; // O fundo canvas
import CartaoAutenticacao from '../components/CartaoAutenticacao'; // O cartão 3D

const PaginaAutenticacao = () => {
    return (

        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
            
            {/* CAMADA 1: Fundo (Fica fixo atrás) */}
            <FundoAnimado />
            <main className="main-container">
                <CartaoAutenticacao />
            </main>
            
        </div>
    );
};

export default PaginaAutenticacao;
