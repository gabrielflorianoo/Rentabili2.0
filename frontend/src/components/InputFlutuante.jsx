import React from 'react';

const InputFlutuante = ({
    type,       // Tipo do input (text, email, password, etc.)
    id,         // ID do input, usado também no label
    rotulo,     // Texto do rótulo que "flutua" acima do input
    valor,      // Valor controlado do input (state externo)
    aoMudar,    // Função chamada ao mudar o valor do input
    erro,       // Mensagem de erro a ser exibida (opcional)
    ...props    // Outros props adicionais passados para o input
}) => {
    return (
        <div className="floating-input-group">
            {/* Input controlado */}
            <input
                id={id}
                type={type}
                className={`floating-input ${erro ? 'input-error' : ''}`} // Aplica classe de erro se houver
                placeholder=" "  // Placeholder vazio necessário para efeito de label flutuante
                value={valor}    // Valor controlado
                onChange={aoMudar} // Callback de mudança
                {...props}       // Passa qualquer outro prop extra
            />

            {/* Label flutuante */}
            <label className="floating-label" htmlFor={id}>
                {rotulo}
            </label>

            {/* Mensagem de erro opcional */}
            {erro && <span className="error-message">{erro}</span>}
        </div>
    );
};

export default InputFlutuante;
