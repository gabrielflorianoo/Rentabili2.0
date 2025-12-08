import getPrismaClient from '../prismaClient.js';

const prisma = getPrismaClient();

async function checkInvestments() {
    try {
        const userId = 1; // Ajustar para seu userId
        
        const investments = await prisma.investment.findMany({
            where: { userId },
            include: { active: true },
            orderBy: [{ activeId: 'asc' }, { date: 'asc' }],
        });

        console.log('=== INVESTMENTS ===');
        let totalByKind = { 'Investimento': 0, 'Renda': 0 };
        let totalAll = 0;
        let previousInv = null;

        investments.forEach((inv, idx) => {
            const amount = Number(inv.amount || 0);
            console.log(`${idx + 1}. ID: ${inv.id}, ${inv.active.name} (${inv.kind}): R$ ${amount.toFixed(2)} - ${inv.date.toISOString().split('T')[0]}`);
            
            totalAll += amount;
            if (inv.kind === 'Renda') {
                totalByKind['Renda'] += amount;
            } else {
                totalByKind['Investimento'] += amount;
            }

            // Verificar duplicatas
            if (previousInv && previousInv.id === inv.id) {
                console.log('  ⚠️ DUPLICATA DETECTADA!');
            }
            previousInv = inv;
        });

        console.log('\n=== TOTALS ===');
        console.log(`Total Investimento: R$ ${totalByKind['Investimento'].toFixed(2)}`);
        console.log(`Total Renda: R$ ${totalByKind['Renda'].toFixed(2)}`);
        console.log(`TOTAL GERAL: R$ ${totalAll.toFixed(2)}`);
        
        // Verificar se há duplicatas por activeId + date + amount
        const grouped = {};
        investments.forEach(inv => {
            const key = `${inv.activeId}_${inv.date.toISOString().split('T')[0]}_${inv.amount}`;
            if (!grouped[key]) grouped[key] = 0;
            grouped[key]++;
        });

        console.log('\n=== DUPLICATA CHECK ===');
        Object.entries(grouped).forEach(([key, count]) => {
            if (count > 1) {
                console.log(`⚠️  DUPLICATA: ${key} (${count}x)`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkInvestments();
