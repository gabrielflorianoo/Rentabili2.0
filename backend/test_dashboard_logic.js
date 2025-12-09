/**
 * TESTE DE LÓGICA DO DASHBOARD
 * 
 * Este arquivo testa os cálculos financeiros para garantir que:
 * 1. totalBalance = totalPatrimonio + carteiras
 * 2. totalGain = totalBalance - totalAportado
 * 3. profitability = (totalGain / totalAportado) * 100
 * 
 * Os valores devem fazer sentido: +359.3% rentabilidade é SUSPEITOSAMENTE alto
 * R$ 364.548,64 de lucro também é muito grande se não houve muito aporte
 */

// Casos de teste
const testCases = [
    {
        name: "Caso Normal - Pequeno Ganho",
        totalAportado: 10000,
        totalPatrimonio: 12000,
        walletsTotal: 3000,
        expected: {
            totalBalance: 15000,
            totalGain: 5000,
            profitability: 50.00
        }
    },
    {
        name: "Caso Suspeito - Grande Ganho",
        totalAportado: 1000,
        totalPatrimonio: 100000,
        walletsTotal: 264548.64,
        expected: {
            totalBalance: 364548.64,
            totalGain: 363548.64,
            profitability: 36354.86
        }
    },
    {
        name: "Caso Negativo - Prejuízo",
        totalAportado: 10000,
        totalPatrimonio: 8000,
        walletsTotal: 1000,
        expected: {
            totalBalance: 9000,
            totalGain: -1000,
            profitability: -10.00
        }
    },
    {
        name: "Caso Zero - Sem Aporte",
        totalAportado: 0,
        totalPatrimonio: 5000,
        walletsTotal: 0,
        expected: {
            totalBalance: 5000,
            totalGain: 5000,
            profitability: 0
        }
    }
];

function toFixed2(value) {
    return parseFloat(value.toFixed(2));
}

function runTests() {
    console.log("=== TESTE DE LÓGICA DO DASHBOARD ===\n");
    
    testCases.forEach(test => {
        console.log(`\n📊 ${test.name}`);
        console.log("─".repeat(60));
        
        const { totalAportado, totalPatrimonio, walletsTotal, expected } = test;
        
        // Calcular valores
        const totalBalance = totalPatrimonio + walletsTotal;
        const totalGain = totalBalance - totalAportado;
        const profitability = totalAportado > 0 
            ? toFixed2((totalGain / totalAportado) * 100)
            : 0;
        
        // Log dos valores
        console.log(`Total Aportado:      R$ ${toFixed2(totalAportado).toLocaleString('pt-BR')}`);
        console.log(`Patrimônio Ativos:   R$ ${toFixed2(totalPatrimonio).toLocaleString('pt-BR')}`);
        console.log(`Carteiras (Caixa):   R$ ${toFixed2(walletsTotal).toLocaleString('pt-BR')}`);
        console.log(`─`.repeat(60));
        console.log(`TOTAL BALANCE:       R$ ${toFixed2(totalBalance).toLocaleString('pt-BR')} ${toFixed2(totalBalance) === expected.totalBalance ? '✅' : '❌'}`);
        console.log(`TOTAL GAIN/LOSS:     R$ ${toFixed2(totalGain).toLocaleString('pt-BR')} ${toFixed2(totalGain) === expected.totalGain ? '✅' : '❌'}`);
        console.log(`PROFITABILITY:       ${profitability.toLocaleString('pt-BR')}% ${profitability === expected.profitability ? '✅' : '❌'}`);
        
        if (profitability !== expected.profitability || 
            toFixed2(totalBalance) !== expected.totalBalance ||
            toFixed2(totalGain) !== expected.totalGain) {
            console.log("\n⚠️  VALORES ESPERADOS:");
            console.log(`  TOTAL BALANCE:    R$ ${toFixed2(expected.totalBalance).toLocaleString('pt-BR')}`);
            console.log(`  TOTAL GAIN/LOSS:  R$ ${toFixed2(expected.totalGain).toLocaleString('pt-BR')}`);
            console.log(`  PROFITABILITY:    ${expected.profitability.toLocaleString('pt-BR')}%`);
        }
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("\n📈 ANÁLISE CRÍTICA:");
    console.log("\nSe você está vendo +359.3% de rentabilidade com R$ 364.548,64 de lucro:");
    console.log("✅ Isso é CORRETO se:");
    console.log("   - Você aportou ~R$ 1.000 (1K)");
    console.log("   - Seu patrimônio subiu para R$ 365.548 (365K+)");
    console.log("   - Ganho = 365K - 1K = 364K");
    console.log("   - Profitabilidade = 364K / 1K * 100 = 36.400% = +36.400%");
    console.log("\n❌ Isso é ERRADO se você aportou mais dinheiro");
    console.log("   - Verifique o banco de dados se há aportes não contabilizados");
    console.log("   - Verifique se há 'Renda' sendo somada no totalAportado");
    console.log("   - Verifique se há saldos negativos nos históricos");
}

runTests();
