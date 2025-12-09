import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [selectedWallet, setSelectedWallet] = useState(null);

    // Load selected wallet from localStorage on mount
    useEffect(() => {
        const savedWallet = localStorage.getItem('rentabil_selected_wallet');
        if (savedWallet) {
            try {
                const parsed = JSON.parse(savedWallet);
                // Validate that the parsed object has required properties
                if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
                    setSelectedWallet(parsed);
                } else {
                    console.warn('Invalid wallet data in localStorage');
                    localStorage.removeItem('rentabil_selected_wallet');
                }
            } catch (e) {
                console.error('Failed to parse saved wallet:', e);
                localStorage.removeItem('rentabil_selected_wallet');
            }
        }
    }, []);

    // Save selected wallet to localStorage whenever it changes
    const selectWallet = (wallet) => {
        setSelectedWallet(wallet);
        if (wallet) {
            localStorage.setItem('rentabil_selected_wallet', JSON.stringify(wallet));
        } else {
            localStorage.removeItem('rentabil_selected_wallet');
        }
    };

    const clearSelectedWallet = () => {
        setSelectedWallet(null);
        localStorage.removeItem('rentabil_selected_wallet');
    };

    return (
        <WalletContext.Provider
            value={{
                selectedWallet,
                selectWallet,
                clearSelectedWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
