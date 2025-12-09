/**
 * SCRIPT DE DIAGNÓSTICO DO ADMIN@EXAMPLE.COM
 * Verifica todos os dados financeiros para identificar inconsistências
 */

import getPrismaClient from './prismaClient.js';

const prisma = getPrismaClient();

async function diagnosisAdmin() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@example.com' }
        });

        if (!user) {
            console.log('❌ Usuário admin@example.com não encontrado');
            return;
        }

        console.log('\n' + '='.repeat(70));
        console.log('🔍 DIAGNÓSTICO: admin@example.com');
        console.log('='.repeat(70));

        // 1. Buscar todos os ativos
        const allActives = await prisma.active.findMany({
            where: { userId: user.id }
        });

        console.log(`\n📍 ATIVOS CADASTRADOS: ${allActives.length}`);

        // 2. Para cada ativo, verificar dados
        let totalAportado = 0;
        let totalPatrimonio = 0;

        for (const active of allActives) {
            const investments = await prisma.investment.findMany({
                where: { activeId: active.id }
            });

            const latestBalance = await prisma.historicalBalance.findFirst({
                where: { activeId: active.id },
                orderBy: { date: 'desc' }
            });

            const aportes = investments.filter(i => i.kind !== 'Renda');
            const totalAporteAativo = aportes.reduce((sum, i) => sum + Number(i.amount), 0);
            const totalRendas = investments.filter(i => i.kind === 'Renda').reduce((sum, i) => sum + Number(i.amount), 0);
            const saldoAtual = latestBalance ? Number(latestBalance.value) : 0;

            totalAportado += totalAporteAativo;
            totalPatrimonio += saldoAtual;

            console.log(`\n  ${active.name} (${active.type})`);
            console.log(`  ├─ Movimentações: ${investments.length}`);
            console.log(`  ├─ Aportes: R$ ${totalAporteAativo.toFixed(2)}`);
            if (totalRendas > 0) {
                console.log(`  ├─ Rendas: R$ ${totalRendas.toFixed(2)}`);
            }
            console.log(`  ├─ Saldo Atual: R$ ${saldoAtual.toFixed(2)}`);
            console.log(`  └─ Ganho (saldo - aporte): R$ ${(saldoAtual - totalAporteAativo).toFixed(2)}`);

            // Alertas de inconsistência
            if (saldoAtual < 0) {
                console.log(`  ⚠️  ALERTA: Saldo negativo!`);
            }
            if (saldoAtual > 1000000) {
                console.log(`  ⚠️  ALERTA: Saldo extremamente alto! Verificar se está correto.`);
            }
        }

        // 3. Buscar carteiras
        const wallets = await prisma.wallet.findMany({
            where: { userId: user.id }
        });

        console.log(`\n💳 CARTEIRAS: ${wallets.length}`);
        let walletsTotal = 0;
        wallets.forEach(w => {
            const balance = Number(w.balance);
            walletsTotal += balance;
            console.log(`  • ${w.name}: R$ ${balance.toFixed(2)}`);
            if (balance > 1000000) {
                console.log(`    ⚠️  ALERTA: Saldo extremamente alto!`);
            }
        });

        // 4. Calcular totais
        const totalBalance = totalPatrimonio + walletsTotal;
        const totalGain = totalBalance - totalAportado;
        const profitability = totalAportado > 0 ? (totalGain / totalAportado) * 100 : 0;

        console.log('\n' + '='.repeat(70));
        console.log('📊 RESUMO FINANCEIRO CALCULADO');
        console.log('='.repeat(70));
        console.log(`\nTotal Aportado:      R$ ${totalAportado.toFixed(2)}`);
        console.log(`Total Patrimônio:    R$ ${totalPatrimonio.toFixed(2)}`);
        console.log(`Total Carteiras:     R$ ${walletsTotal.toFixed(2)}`);
        console.log(`─`.repeat(70));
        console.log(`TOTAL BALANCE:       R$ ${totalBalance.toFixed(2)}`);
        console.log(`TOTAL GAIN/LOSS:     R$ ${totalGain.toFixed(2)}`);
        console.log(`PROFITABILITY:       ${profitability.toFixed(2)}%`);

        // 5. Verificar se há aportes registrados
        const allInvestments = await prisma.investment.findMany({
            where: { userId: user.id }
        });

        console.log('\n' + '='.repeat(70));
        console.log('📝 MOVIMENTAÇÕES (Últimas 20)');
        console.log('='.repeat(70));
        
        const sorted = allInvestments.sort((a, b) => new Date(b.date) - new Date(a.date));
        sorted.slice(0, 20).forEach(inv => {
            const symbol = inv.kind === 'Renda' ? '📈' : '📥';
            console.log(`${symbol} ${new Date(inv.date).toLocaleDateString('pt-BR')} - ${inv.kind}: R$ ${Number(inv.amount).toFixed(2)}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('⚠️  VERIFICAÇÕES IMPORTANTES');
        console.log('='.repeat(70));

        if (totalAportado === 0) {
            console.log('❌ Nenhum aporte encontrado! Verifique se há investimentos cadastrados.');
        } else if (profitability > 100) {
            console.log('⚠️  Rentabilidade > 100%. Isso é possível, mas raro.');
            console.log(`   Se aportou R$ ${totalAportado.toFixed(2)} e tem R$ ${totalBalance.toFixed(2)}`);
            console.log(`   É porque o patrimônio cresceu muito. Verifique se os valores estão corretos.`);
        }

        if (walletsTotal > totalPatrimonio) {
            console.log('⚠️  Saldo em carteiras > patrimônio em ativos. Investir mais?');
        }

        console.log('\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosisAdmin();
