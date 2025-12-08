import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './HomeHero.css';
import rentabil from '../assets/rentabil.png';

export default function HomeHero() {
    const navigate = useNavigate();

    const irParaLogin = () => {
        navigate('/login');
    };

    return (
        <div className="home-container">
            <Header /> {/* Usando o componente compartilhado */}
            <main className="hero">
                <section className="hero-left">
                    <h1 className="hero-title">
                        SISTEMA GERADOR DE
                        <br />
                        <strong>
                            RENTABILIDADE E<br />
                            INVESTIMENTO
                        </strong>
                    </h1>
                    <p className="hero-sub">
                        Acompanhe o desempenho de sua carteira de investimentos
                        de forma simples e eficiente.
                    </p>
                    <button onClick={irParaLogin} className="btn-cad">
                        cadastre-se
                    </button>

                    <div className="info-list">
                        <div className="info-item">
                            <span>Mais recursos</span>
                            <span className="arrow">↓</span>
                        </div>
                        <div className="info-item">
                            <span>Mais acessibilidade</span>
                            <span className="arrow">↓</span>
                        </div>
                        <div className="info-item">
                            <span>Melhor para você</span>
                            <span className="arrow">↓</span>
                        </div>
                    </div>
                </section>

   <aside className="hero-right">

    <div className="circle-wrapper-3">

        {/* Círculo 1 – Principal (topo esquerdo) */}
        <div className="hero-circle circle-main">
            <img 
                src="https://img.freepik.com/fotos-gratis/homem-de-negocios-feliz-apontando-para-o-lado_1149-1233.jpg?w=740"
                alt="Homem apontando"
            />
        </div>

        {/* Círculo 2 – Inferior direito */}
        <div className="hero-circle circle-secondary">
            <img 
                src="https://img.freepik.com/free-photo/happy-entrepreneur-using-digital-tablet-reading-something-while-working-office_637285-806.jpg?w=1480"
                alt="Empresário usando tablet"
            />
        </div>

        {/* Círculo 3 – Superior direito (nova imagem) */}
        <div className="hero-circle circle-third">
            <img 
                src="https://img.freepik.com/free-photo/cheerful-entrepreneur-saying-hello-talking-video-call-using-phone-businessman-course-important-video-conference-while-doing-overtime-office_482257-10312.jpg?w=1480"
                alt="Empresário acenando em vídeo"
            />
        </div>

    </div>

</aside>
            </main>
            <Footer />
        </div>
    );
}
