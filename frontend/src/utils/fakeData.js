// Utilitário para gerar dados plausíveis e aleatórios para preencher formulários durante desenvolvimento
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) =>
    (Math.random() * (max - min) + min).toFixed(decimals);

const recentDateISO = (daysBack = 120) => {
    const days = randomInt(0, daysBack);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

export function generateTransaction() {
    const incomeDescriptions = [
        'Salário',
        'Pagamento Freelance',
        'Recebimento venda',
        'Bônus',
        'Dividendos',
    ];
    const expenseDescriptions = [
        'Compra Supermercado',
        'Restaurante',
        'Conta Luz',
        'Aluguel',
        'Transporte',
    ];

    const isExpense = Math.random() > 0.5;
    const type = isExpense ? 'expense' : 'income';
    const description = isExpense
        ? randomFrom(expenseDescriptions)
        : randomFrom(incomeDescriptions);
    const amount = isExpense ? randomFloat(5, 1200) : randomFloat(200, 8000);

    return {
        description,
        amount: String(amount),
        date: recentDateISO(180),
        type,
    };
}

export function generateInvestment(actives = []) {
    if (actives.length < 1) {
        throw new Error("Nenhum ativo encontrado, porfavor crie ativos antes de criar algum investimento.");
    }

    const activeId = actives[randomInt(0, actives.length - 1)];
    const amount = randomFloat(50, 20000);
    return {
        activeId: String(activeId),
        amount: String(amount),
        date: recentDateISO(365),
        kind: 'Investimento',
    };
}

export function generateActive() {
    const names = [
        'Ação XYZ',
        'FII Alpha',
        'Tesouro Selic',
        'ETF IBOV',
        'CDB Banco A',
    ];
    const types = ['Ação', 'FII', 'Renda Fixa', 'ETF'];
    return {
        nome: randomFrom(names),
        tipo: randomFrom(types),
    };
}

export default { generateTransaction, generateInvestment, generateActive };
