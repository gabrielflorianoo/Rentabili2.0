// Script para recalcular os balances históricos baseado nos investimentos
import getPrismaClient from './prismaClient.js';

const prisma = getPrismaClient();

async function recalculateBalances() {
    try {
        console.log('🔄 Iniciando recálculo de balances históricos...\n');

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

        // Para cada ativo, calcular saldos acumulados CORRETAMENTE
        for (const [activeId, data] of Object.entries(investmentsByActive)) {
            const { activeName, investments } = data;
            console.log(`\n💼 Processando: ${activeName} (ID: ${activeId})`);
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

            // Usar a data mais recente (última transação) para o balance atual
            const todasTransacoes = [...aportes, ...rendas].sort((a, b) => new Date(b.date) - new Date(a.date));
            const dataUltimaTransacao = todasTransacoes.length > 0 
                ? new Date(todasTransacoes[0].date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            // Criar/atualizar o HistoricalBalance mais recente
            try {
                const date = new Date(dataUltimaTransacao);
                // Tentar atualizar ou criar o balance mais recente
                await prisma.historicalBalance.upsert({
                    where: {
                        activeId_date: {
                            activeId: parseInt(activeId),
                            date: date
                        }
                    },
                    update: {
                        value: patrimonioAtual
                    },
                    create: {
                        activeId: parseInt(activeId),
                        date: date,
                        value: patrimonioAtual
                    }
                });
                
                console.log(`   ✅ Balance histórico atualizado para ${dataUltimaTransacao}`);
            } catch (error) {
                console.error(`   ❌ Erro ao salvar balance:`, error.message);
            }
        }

        console.log('\n✅ Recálculo concluído com sucesso!');
        
        // Mostrar resumo
        const totalBalances = await prisma.historicalBalance.count();
        console.log(`\n📈 Total de balances históricos no banco: ${totalBalances}`);

    } catch (error) {
        console.error('❌ Erro durante o recálculo:', error);
    } finally {
        await prisma.$disconnect();
    }
}

recalculateBalances();
