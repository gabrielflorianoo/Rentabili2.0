const base = 'http://localhost:3000';
let authToken = '';
let mockActiveId = null;
const AUTH_TEST_EMAIL = `auth_test_${Date.now()}@temp.com`;
const AUTH_TEST_PASSWORD = 'testpass123';

async function req(method, path, body, requiresAuth = true) {
    const url = base + path;
    const headers = { 'Content-Type': 'application/json' };
    const opts = { method, headers };

    if (requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (body !== undefined) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(url, opts);
        const text = await res.text();
        let data = text;
        try {
            data = JSON.parse(text);
        } catch (e) { }
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        return { error: err.message };
    }
}

function print(title) {
    console.log('\n=================================================');
    console.log('>>> ' + title);
    console.log('=================================================');
}

function show(res, successMsg = 'Sucesso', errorMsg = 'Falha') {
    if (res.error) {
        console.error('ERROR:', res.error);
    } else {
        const statusType = res.status >= 200 && res.status < 300 ? '✅' : '❌';
        const message = res.ok ? successMsg : errorMsg;
        console.log(`${statusType} ${message} - Status: ${res.status}`);
        console.log('Body:', res.data);
    }
}

async function testAuth() {
    print('AUTENTICAÇÃO: POST /auth/register (Criando Usuário para Teste)');
    const regRes = await req(
        'POST',
        '/auth/register',
        {
            name: 'Auth Test User',
            email: AUTH_TEST_EMAIL,
            password: AUTH_TEST_PASSWORD,
        },
        false,
    );

    show(
        regRes,
        'Usuário de teste registrado',
        'Falha no registro do usuário de teste',
    );

    if (!regRes.ok) {
        console.error(
            '🛑 Falha ao registrar usuário de teste. Não é possível prosseguir com o login.',
        );
        return;
    }

    print(
        'AUTENTICAÇÃO: POST /auth/login (Obtendo Token com credenciais registradas)',
    );
    const res = await req(
        'POST',
        '/auth/login',
        {
            email: AUTH_TEST_EMAIL,
            password: AUTH_TEST_PASSWORD,
        },
        false,
    );

    show(
        res,
        'Login bem-sucedido. Token obtido.',
        '❌ Falha no login (401 persistente)',
    );

    if (res.data?.token) {
        authToken = res.data.token;
    }
}

async function testDashboard() {
    print('DASHBOARD: GET /dashboard/summary (Requer Auth)');
    show(await req('GET', '/dashboard/summary'));

    print('DASHBOARD: GET /dashboard (Requer Auth)');
    show(await req('GET', '/dashboard'));
}

async function testActivesAndBalances() {
    print('ACTIVES: POST /actives (Criar Ativo)');
    const createdActive = await req('POST', '/actives', {
        name: 'Tesouro Selic 2029',
        type: 'bond',
    });
    show(createdActive, 'Ativo criado', 'Falha ao criar Ativo');
    mockActiveId = createdActive.data?.id;

    if (!mockActiveId) {
        console.error(
            'Não foi possível continuar os testes de Ativos/Balanços.',
        );
        return;
    }

    print('ACTIVES: GET /actives (Listar Ativos - Requer Auth)');
    show(await req('GET', '/actives'));

    print('HISTORICAL BALANCE: POST /historical-balances (Adicionar Balanço)');
    const createdBalance = await req('POST', '/historical-balances', {
        activeId: mockActiveId,
        date: new Date().toISOString(),
        value: 1000.55,
    });
    show(createdBalance, 'Balanço adicionado', 'Falha ao adicionar Balanço');

    print('HISTORICAL BALANCE: GET /historical-balances/active/:activeId');
    show(await req('GET', `/historical-balances/active/${mockActiveId}`));

    print('ACTIVES: DELETE /actives/:id (Limpar Ativo)');
    show(
        await req('DELETE', `/actives/${mockActiveId}`),
        'Ativo deletado',
        'Falha ao deletar Ativo',
    );

    mockActiveId = null;
}

async function testWalletsAndTransactions() {
    print('WALLETS: POST /wallets (Criar Carteira - Requer Auth)');
    const createdWallet = await req('POST', '/wallets', {
        name: 'Carteira Teste Auth',
        balance: 500,
        // userId: 1, // Não é mais necessário, deve vir do token
    });
    show(createdWallet);
    const walletId = createdWallet.data?.id;

    if (!walletId) {
        console.error(
            'Não foi possível continuar os testes de Carteira/Transações.',
        );
        return;
    }

    print('TRANSACTIONS: POST (income) /transactions');
    const income = await req('POST', '/transactions', {
        type: 'income',
        amount: 250,
        walletId,
        // userId: 1, // Não é mais necessário, deve vir do token
        description: 'Receita teste',
    });
    show(income);

    print('WALLETS: GET /wallets (Listar - Requer Auth)');
    show(await req('GET', '/wallets'));

    print('WALLETS: DELETE /wallets/:id');
    show(
        await req('DELETE', `/wallets/${walletId}`),
        'Carteira deletada',
        'Falha ao deletar Carteira',
    );
}

async function testPublicRoutes() {
    print('PUBLIC: GET /users (Listar Usuários - Acesso Público)');
    show(await req('GET', '/users', undefined, false));

    print('PUBLIC: POST /users (Criar Novo Usuário - Acesso Público)');
    show(
        await req(
            'POST',
            '/users',
            {
                name: 'User Public',
                email: `public_${Date.now()}@example.com`,
                password: 'publicpassword',
            },
            false,
        ),
    );
}

async function testRateLimiterAndCaching() {
    print('RATE LIMITER: Teste de Força Bruta (5 tentativas em 5 minutos)');
    // Usamos um email inválido para garantir que o login falhe e o rate limit seja acionado
    const loginPayload = { email: 'invalid@test.com', password: 'wrong' };
    const maxAttempts = 5;
    let limitReached = false;

    for (let i = 1; i <= maxAttempts + 1; i++) {
        const attempt = await req('POST', '/auth/login', loginPayload, false);
        console.log(`Tentativa ${i}: Status ${attempt.status}`);

        if (attempt.status === 429) {
            show(
                attempt,
                'Limite de Requisições ATINGIDO',
                'Status inesperado na tentativa de limite',
            );
            limitReached = true;
            break;
        }
        if (i === maxAttempts && attempt.status !== 429) {
            console.error(
                '❌ Falha: O limite de taxa não foi atingido após o número máximo de tentativas.',
            );
        }
    }

    if (!limitReached) {
        console.error(
            '🛑 Teste de Rate Limiter falhou: O status 429 não foi retornado.',
        );
    }

    print('CACHING: Teste de Desempenho (HIT vs MISS)');

    if (!authToken) {
        console.log(
            '🛑 Caching test skipped: Authentication token is required.',
        );
        return;
    }

    console.time('Tempo MISS');
    const miss = await req('GET', '/dashboard');
    console.timeEnd('Tempo MISS');
    show(miss, 'Dashboard MISS (Primeira chamada)', 'Falha na requisição MISS');

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.time('Tempo HIT');
    const hit = await req('GET', '/dashboard');
    console.timeEnd('Tempo HIT');
    show(hit, 'Dashboard HIT (Segunda chamada)', 'Falha na requisição HIT');
}

(async function main() {
    console.log(
        'Iniciando testes de rotas. Certifique-se de que o servidor está rodando em http://localhost:3000',
    );
    if (typeof fetch === 'undefined') {
        console.error(
            'fetch não disponível no runtime Node. Execute com Node >= 18 ou instale um polyfill (node-fetch).',
        );
        process.exit(1);
    }

    await testPublicRoutes();

    // 🛑 O problema de login é resolvido aqui, registrando e logando com credenciais conhecidas.
    await testAuth();

    if (!authToken) {
        console.error(
            '\n🛑 Não foi possível obter o token. Testes autenticados CANCELADOS.',
        );

        // Tentativa de limpar o usuário de teste após falha, se existir
        await req('DELETE', `/users/${AUTH_TEST_EMAIL}`, undefined, false);
        return;
    }

    // Testes autenticados
    await testDashboard();
    await testActivesAndBalances();
    await testWalletsAndTransactions();

    // Teste de Limitação de Taxa e Cache
    await testRateLimiterAndCaching();

    console.log('\nTestes finalizados.');
})();
