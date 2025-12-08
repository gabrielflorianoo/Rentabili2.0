/**
 * Testes da API de Performance
 * Execute com: npm run test:routes
 * 
 * Nota: Certifique-se de que:
 * 1. O backend está rodando (npm run dev)
 * 2. Um usuário está autenticado
 * 3. Pelo menos um ativo com saldos históricos foi cadastrado
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Token de teste (substitua pelo seu)
const TOKEN = process.env.TEST_TOKEN || 'seu_token_jwt_aqui';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
};

async function test(name, url, method = 'GET', body = null) {
    try {
        console.log(`\n📝 Testando: ${name}`);
        console.log(`   ${method} ${url}`);

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            console.log(`   ✅ Status: ${response.status}`);
            console.log(`   📊 Resposta:`, JSON.stringify(data, null, 2).slice(0, 200) + '...');
        } else {
            console.log(`   ❌ Status: ${response.status}`);
            console.log(`   Erro:`, data);
        }

        return data;
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Iniciando testes da API de Performance...\n');

    // Teste 1: Performance geral
    await test(
        'Performance Geral (Todos os Ativos)',
        `${BASE_URL}/performance/all`
    );

    // Teste 2: Top performers
    await test(
        'Top Performers (Limite 5)',
        `${BASE_URL}/performance/top-performers?limit=5`
    );

    // Teste 3: Evolução da carteira
    await test(
        'Evolução da Carteira (12 meses)',
        `${BASE_URL}/performance/evolution?months=12`
    );

    // Teste 4: Alocação por tipo
    await test(
        'Alocação de Ativos por Tipo',
        `${BASE_URL}/performance/allocation`
    );

    // Teste 5: Datas de último saldo
    await test(
        'Datas de Último Saldo',
        `${BASE_URL}/performance/last-dates`
    );

    // Nota: Os testes abaixo requerem um activeId válido
    const ACTIVE_ID = 1; // Substitua pelo ID real do seu ativo

    // Teste 6: Ganho/Perda de um ativo
    await test(
        `Ganho/Perda do Ativo ${ACTIVE_ID}`,
        `${BASE_URL}/performance/active/${ACTIVE_ID}/gain-loss`
    );

    // Teste 7: Performance por períodos
    await test(
        `Performance por Períodos do Ativo ${ACTIVE_ID}`,
        `${BASE_URL}/performance/active/${ACTIVE_ID}/periods`
    );

    console.log('\n✅ Testes concluídos!\n');
}

// Executar testes
runTests().catch(console.error);
