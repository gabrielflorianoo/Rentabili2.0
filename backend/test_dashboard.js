import getPrismaClient from './prismaClient.js';

const prisma = getPrismaClient();

async function testDashboard() {
    try {
        const userId = 1; // Ou o ID correto do usuário
        
        // Buscar todos os investimentos
        const investments = await prisma.investment.findMany({
            where: { userId },
            include: { active: true },
        });
        
        console.log('=== INVESTIMENTOS ===');
        investments.forEach((inv) => {
            console.log(`${inv.active.name} (${inv.kind}): R$ ${inv.amount} - ${inv.date}`);
        });
        
        // Calcular totais
        const totalInvested = investments
            .filter((inv) => inv.kind !== 'Renda')
            .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        
        const totalRenda = investments
            .filter((inv) => inv.kind === 'Renda')
            .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        
        console.log(`\nTotal Investido: R$ ${totalInvested}`);
        console.log(`Total Renda: R$ ${totalRenda}`);
        
        // Buscar ativos com balances
        const actives = await prisma.active.findMany({
            where: { userId },
            include: {
                balances: { orderBy: { date: 'desc' }, take: 1 },
                investments: true,
            },
        });
        
        console.log('\n=== ATIVOS ===');
        let totalBalance = 0;
        actives.forEach((active) => {
            const investmentsInActive = (active.investments || []);
            const activeTotal = investmentsInActive.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
            const balance = active.balances.length > 0 ? Number(active.balances[0].value) : activeTotal;
            totalBalance += balance;
            console.log(`${active.name}: R$ ${balance}`);
        });
        
        console.log(`\nPatrimônio Total: R$ ${totalBalance}`);
        
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDashboard();
