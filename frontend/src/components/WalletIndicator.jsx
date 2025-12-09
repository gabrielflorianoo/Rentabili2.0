import React from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletIndicator = () => {
    const { selectedWallet } = useWallet();

    if (!selectedWallet) {
        return null;
    }

    return (
        <div style={{
            padding: '12px 15px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
        }}>
            <strong>Carteira Selecionada:</strong> {selectedWallet.name}
        </div>
    );
};

export default WalletIndicator;
