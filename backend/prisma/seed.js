import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpeza de Dados
    await prisma.investment.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.historicalBalance.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.active.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Dados antigos limpos.');

    // Criação de um Usuário Investidor
    const passwordHash = await bcrypt.hash('123123@', 10);
    const investorEmail = 'email@example.com';

    const investor = await prisma.user.create({
        data: {
            name: 'Banco do Bradesco',
            email: investorEmail,
            password: passwordHash,
            birthday: new Date('0001-01-01'),
        },
    });

    console.log(`👤 Usuário criado: ${investor.name} (${investor.email})`);

    // Criação de Carteiras do Usuário
    const mainWallet = await prisma.wallet.create({
        data: {
            name: 'Carteira Principal',
            balance: 10000.0,
            userId: investor.id,
        },
    });

    console.log(`💳 Carteira criada: ${mainWallet.name}`);

    // Criação dos Ativos do Usuário
    const cdbActive = await prisma.active.create({
        data: {
            name: 'CDB Banco Seguro 120%',
            type: 'CDB',
            userId: investor.id,
        },
    });
    const fundActive = await prisma.active.create({
        data: {
            name: 'Fundo Multi Alpha',
            type: 'Fundo de Investimento',
            userId: investor.id,
        },
    });
    const stockActive = await prisma.active.create({
        data: {
            name: 'Ação Tech S.A. (TSA3)',
            type: 'Ação',
            userId: investor.id,
        },
    });

    console.log(
        `💰 3 Ativos de exemplo criados: ${cdbActive.name}, ${fundActive.name}, ${stockActive.name}`,
    );

    // Criação dos Saldos Históricos
    const historicalBalancesData = [
        // CDB - 12 months
        { activeId: cdbActive.id, date: new Date('2024-12-31'), value: 9500.0 },
        { activeId: cdbActive.id, date: new Date('2025-01-31'), value: 10000.0 },
        { activeId: cdbActive.id, date: new Date('2025-02-28'), value: 10080.0 },
        { activeId: cdbActive.id, date: new Date('2025-03-31'), value: 10165.0 },
        { activeId: cdbActive.id, date: new Date('2025-04-30'), value: 10250.0 },
        { activeId: cdbActive.id, date: new Date('2025-05-31'), value: 10340.0 },
        { activeId: cdbActive.id, date: new Date('2025-06-30'), value: 10425.0 },
        { activeId: cdbActive.id, date: new Date('2025-07-31'), value: 10515.0 },
        { activeId: cdbActive.id, date: new Date('2025-08-31'), value: 10600.0 },
        { activeId: cdbActive.id, date: new Date('2025-09-30'), value: 10690.0 },
        { activeId: cdbActive.id, date: new Date('2025-10-31'), value: 10775.0 },
        { activeId: cdbActive.id, date: new Date('2025-11-30'), value: 10865.0 },
        { activeId: cdbActive.id, date: new Date('2025-12-05'), value: 10900.0 },

        // Fundo - 12 months
        { activeId: fundActive.id, date: new Date('2024-12-31'), value: 48000.0 },
        { activeId: fundActive.id, date: new Date('2025-01-31'), value: 50000.0 },
        { activeId: fundActive.id, date: new Date('2025-02-28'), value: 50450.0 },
        { activeId: fundActive.id, date: new Date('2025-03-31'), value: 51200.0 },
        { activeId: fundActive.id, date: new Date('2025-04-30'), value: 51800.0 },
        { activeId: fundActive.id, date: new Date('2025-05-31'), value: 52500.0 },
        { activeId: fundActive.id, date: new Date('2025-06-30'), value: 53200.0 },
        { activeId: fundActive.id, date: new Date('2025-07-31'), value: 54000.0 },
        { activeId: fundActive.id, date: new Date('2025-08-31'), value: 54800.0 },
        { activeId: fundActive.id, date: new Date('2025-09-30'), value: 55600.0 },
        { activeId: fundActive.id, date: new Date('2025-10-31'), value: 56500.0 },
        { activeId: fundActive.id, date: new Date('2025-11-30'), value: 57400.0 },
        { activeId: fundActive.id, date: new Date('2025-12-05'), value: 58000.0 },

        // Ação - 12 months
        { activeId: stockActive.id, date: new Date('2024-12-31'), value: 18500.0 },
        { activeId: stockActive.id, date: new Date('2025-01-31'), value: 20000.0 },
        { activeId: stockActive.id, date: new Date('2025-02-28'), value: 19500.0 },
        { activeId: stockActive.id, date: new Date('2025-03-31'), value: 20300.0 },
        { activeId: stockActive.id, date: new Date('2025-04-30'), value: 21000.0 },
        { activeId: stockActive.id, date: new Date('2025-05-31'), value: 21800.0 },
        { activeId: stockActive.id, date: new Date('2025-06-30'), value: 22500.0 },
        { activeId: stockActive.id, date: new Date('2025-07-31'), value: 23200.0 },
        { activeId: stockActive.id, date: new Date('2025-08-31'), value: 24000.0 },
        { activeId: stockActive.id, date: new Date('2025-09-30'), value: 24800.0 },
        { activeId: stockActive.id, date: new Date('2025-10-31'), value: 25600.0 },
        { activeId: stockActive.id, date: new Date('2025-11-30'), value: 26400.0 },
        { activeId: stockActive.id, date: new Date('2025-12-05'), value: 27000.0 },
    ];

    await prisma.historicalBalance.createMany({
        data: historicalBalancesData,
    });

    console.log(
        `📈 ${historicalBalancesData.length} registros de saldos históricos criados para cálculo de performance.`,
    );

    // Criação de Transações
    const transactionsData = [
        {
            amount: 5000.0,
            type: 'income',
            description: 'Salário',
            date: new Date('2025-01-15'),
            userId: investor.id,
            walletId: mainWallet.id,
        },
        {
            amount: 1000.0,
            type: 'expense',
            description: 'Aluguel',
            date: new Date('2025-01-20'),
            userId: investor.id,
            walletId: mainWallet.id,
        },
        {
            amount: 2000.0,
            type: 'income',
            description: 'Freelance',
            date: new Date('2025-02-10'),
            userId: investor.id,
            walletId: mainWallet.id,
        },
    ];

    await prisma.transaction.createMany({
        data: transactionsData,
    });

    console.log(`💸 ${transactionsData.length} transações criadas.`);

    // Criação de Investimentos
    const investmentsData = [
        {
            amount: 10000.0,
            kind: 'CDB',
            activeId: cdbActive.id,
            userId: investor.id,
            date: new Date('2025-01-01'),
        },
        {
            amount: 50000.0,
            kind: 'Fundo',
            activeId: fundActive.id,
            userId: investor.id,
            date: new Date('2025-01-01'),
        },
        {
            amount: 20000.0,
            kind: 'Ação',
            activeId: stockActive.id,
            userId: investor.id,
            date: new Date('2025-01-01'),
        },
    ];

    await prisma.investment.createMany({
        data: investmentsData,
    });

    console.log(`📊 ${investmentsData.length} investimentos criados.`);

    console.log('🎉 Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
