import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const SidebarLayout = ({ aoSair }) => {
    return (
        <section style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar aoSair={aoSair} />
            <main style={{ 
                flex: 1, 
                marginLeft: '280px',
                width: 'calc(100% - 280px)',
                overflow: 'auto'
            }}>
                <Outlet />
            </main>
        </section>
    );
}

export default SidebarLayout;