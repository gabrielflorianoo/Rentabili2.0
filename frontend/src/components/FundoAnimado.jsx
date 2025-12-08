import React, { useEffect, useRef } from 'react';

const FundoAnimado = () => {
    // Referência ao elemento <canvas> que será usado para desenhar as animações
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const contexto = canvas.getContext('2d');

        // Guardará o ID da animação para permitir cancelar no cleanup
        let idAnimationFrame;

        // Array com todas as linhas animadas
        const linhas = [];

        // Quantidade total de linhas animadas no fundo
        const NUM_LINHAS = 60;

        /**
         * Ajusta o tamanho do canvas de acordo com o tamanho da janela,
         * levando em consideração o devicePixelRatio para evitar borrões.
         */
        const redimensionar = () => {
            const DPR = window.devicePixelRatio || 1;

            // Tamanho real do canvas (em pixels)
            canvas.width = Math.floor(window.innerWidth * DPR);
            canvas.height = Math.floor(window.innerHeight * DPR);

            // Tamanho aparente (em CSS)
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Escala para garantir nitidez em telas retina
            contexto.setTransform(DPR, 0, 0, DPR, 0, 0);
        };

        /**
         * Define valores aleatórios para uma linha.
         * Isso é usado tanto na criação inicial quanto no "reset"
         * quando a linha sai da tela.
         */
        const redefinirLinha = (linha) => {
            // Posição inicial horizontal (fora da tela para os lados)
            linha.x =
                Math.random() * (window.innerWidth * 1.5) -
                window.innerWidth * 0.25;

            // Começa abaixo da tela para subir
            linha.y = window.innerHeight + Math.random() * 200 + 20;

            // Tamanho da linha
            linha.comprimento = 80 + Math.random() * 220;

            // Velocidade de movimento
            linha.velocidade = 0.6 + Math.random() * 2.4;

            // Espessura aleatória — OBS: "Maath" está escrito errado no código original (erro)
            // Mantive sem alterar a lógica, conforme solicitado.
            linha.espessura = 1 + Math.random() * 2;

            // Transparência da linha
            linha.opacidade = 0.15 + Math.random() * 0.35;

            // Ângulo levemente variado, baseado em -45°
            linha.angulo = -Math.PI / 4 + (Math.random() - 0.5) * 0.25;

            // Geração de tom de verde aleatório
            const verde = 150 + Math.floor(Math.random() * 105);

            // Cor final da linha
            linha.cor = `rgba(0, ${verde}, 0, ${linha.opacidade})`;
        };

        /**
         * Cria as linhas iniciais com posições randomizadas.
         * Cada linha recebe um deslocamento extra para não começarem todas juntas.
         */
        for (let i = 0; i < NUM_LINHAS; i++) {
            const l = {};
            redefinirLinha(l);
            l.y += Math.random() * 800;
            linhas.push(l);
        }

        /**
         * Função principal de animação, chamada a cada frame.
         * Move e redesenha todas as linhas na tela.
         */
        const animar = () => {
            // Limpa todo o canvas antes de redesenhar
            contexto.clearRect(0, 0, canvas.width, canvas.height);

            linhas.forEach((linha) => {
                contexto.beginPath();
                contexto.strokeStyle = linha.cor;
                contexto.lineWidth = linha.espessura;
                contexto.lineCap = 'round';

                // Calcula a posição final da linha de acordo com o ângulo e comprimento
                const x2 = linha.x + Math.cos(linha.angulo) * linha.comprimento;
                const y2 = linha.y + Math.sin(linha.angulo) * linha.comprimento;

                // Desenha a linha
                contexto.moveTo(linha.x, linha.y);
                contexto.lineTo(x2, y2);
                contexto.stroke();

                // Atualiza posições (movimento inclinado)
                linha.y -= linha.velocidade;
                linha.x -= linha.velocidade * 0.9;

                // Quando a linha sai da tela, é reposicionada abaixo
                if (y2 < -50 || x2 < -200) {
                    redefinirLinha(linha);
                    linha.y = window.innerHeight + Math.random() * 300;
                }
            });

            // Solicita o próximo frame
            idAnimationFrame = requestAnimationFrame(animar);
        };

        // Ajusta o canvas ao tamanho atual da tela
        window.addEventListener('resize', redimensionar);
        redimensionar();

        // Inicia a animação
        animar();

        /**
         * Cleanup:
         * - Remove o listener de resize
         * - Cancela a animação ao desmontar o componente
         */
        return () => {
            window.removeEventListener('resize', redimensionar);
            cancelAnimationFrame(idAnimationFrame);
        };
    }, []);

    return (
        <div className="futuristic-background">
            <canvas ref={canvasRef} id="animatedLines" />
        </div>
    );
};

export default FundoAnimado;
