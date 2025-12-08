import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export default function Modal({ children, open, onClose, className }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        if (open) {
            document.addEventListener('keydown', onKey);
            // Previne o scroll quando o modal está aberto
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', onKey);
            // Restaura o scroll quando o modal fecha
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    const modalContent = (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className={`modal-content ${className || ''}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}

// no prop-types to avoid extra dependency
