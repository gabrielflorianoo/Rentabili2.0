// Script para verificar investimentos e calcular patrimônio
import getPrismaClient from './prismaClient.js';

const prisma = getPrismaClient();

async function reportInvestments() {
    try {
        console.log('📊 Iniciando relatório de investimentos...\n');

        // Buscar todos os investimentos agrupados por ativo e data
        const investments = await prisma.investment.findMany({
            orderBy: [
                { activeId: 'asc' },
                { date: 'asc' }
            ],
            include: {
                active: true
            }
        });

        console.log(`📊 Total de investimentos encontrados: ${investments.length}\n`);

        // Agrupar por ativo
        const investmentsByActive = {};
        investments.forEach(inv => {
            if (!investmentsByActive[inv.activeId]) {
                investmentsByActive[inv.activeId] = {
                    activeName: inv.active.name,
                    investments: []
                };
            }
            investmentsByActive[inv.activeId].investments.push(inv);
        });

        console.log(`📦 Ativos com investimentos: ${Object.keys(investmentsByActive).length}\n`);

        // Para cada ativo, calcular saldos acumulados
        for (const [activeId, data] of Object.entries(investmentsByActive)) {
            const { activeName, investments } = data;
            console.log(`\n💼 ${activeName} (ID: ${activeId})`);
            console.log(`   Total de transações: ${investments.length}`);

            // Separar investimentos (aportes) de rendas (lucros/perdas)
            const aportes = investments.filter(inv => inv.kind !== 'Renda');
            const rendas = investments.filter(inv => inv.kind === 'Renda');

            console.log(`   📊 Aportes: ${aportes.length} | Rendas: ${rendas.length}`);

            // Calcular total aportado (apenas dinheiro colocado pelo usuário)
            const totalAportado = aportes.reduce((sum, inv) => sum + Number(inv.amount), 0);
            
            // Calcular total de rendas acumuladas (ganhos/perdas ao longo do tempo)
            const totalRendas = rendas.reduce((sum, inv) => sum + Number(inv.amount), 0);
            
            // Patrimônio atual = aportes + rendas acumuladas
            const patrimonioAtual = totalAportado + totalRendas;

            console.log(`   💰 Total Aportado: R$ ${totalAportado.toFixed(2)}`);
            console.log(`   📈 Total Rendas: R$ ${totalRendas.toFixed(2)}`);
            console.log(`   💎 Patrimônio Atual: R$ ${patrimonioAtual.toFixed(2)}`);
        }

        console.log('\n✅ Relatório concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o relatório:', error);
    } finally {
        await prisma.$disconnect();
    }
}

reportInvestments();
