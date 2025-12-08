import React, { useState } from 'react';
import FrenteCartao from './FrenteCartao';
import VersoCartao from './VersoCartao';

const CartaoAutenticacao = () => {
    const [estaVirado, setEstaVirado] = useState(false);

    const alternarGiro = () => {
        setEstaVirado(!estaVirado);
    };

    return (
        // O container principal recebe a classe 'flipped'
        <div className={`innovative-card ${estaVirado ? 'flipped' : ''}`}>
            
            {/* --- ADICIONADO: O WRAPPER É NECESSÁRIO PARA O GIRO FUNCIONAR --- */}
            <div className="card-wrapper">
                <FrenteCartao aoVirar={alternarGiro} />
                <VersoCartao aoVirar={alternarGiro} />
            </div>
            
        </div>
    );
};

export default CartaoAutenticacao;
