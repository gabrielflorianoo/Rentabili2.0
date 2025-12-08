import axios from 'axios';

const BASE_URL = import.meta.env.PRODUCTION ? 'https://backend-rentabili.vercel.app' : import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cria uma instância do axios com baseURL e headers padrão
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

/**
 * Função para tratar a resposta de uma requisição Axios.
 * @param {Promise} responsePromise - A promessa retornada por uma chamada do axios.
 * @returns {Promise<any>} O dado da resposta ou null em caso de erro.
 */
const handleResponse = async (responsePromise) => {
    try {
        const response = await responsePromise;
        return response.data;
    } catch (error) {
        // Você pode adicionar tratamento de erro específico aqui (ex: redirecionar no 401)
        console.error('Erro na Requisição API:', error);
        // Lança o erro novamente para que o código de chamada possa tratá-lo (opcional, mas recomendado)
        throw error;
    }
};

// Interceptor para adicionar token quando presente
apiClient.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem('rentabil_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // localStorage pode falhar em ambientes não-browser
    }
    return config;
});

// --- Funções Auxiliares Genéricas ---
// Cria uma função auxiliar para aplicar o handleResponse a todas as chamadas.

const get = (url, config) => handleResponse(apiClient.get(url, config));
const post = (url, data, config) =>
    handleResponse(apiClient.post(url, data, config));
const put = (url, data, config) =>
    handleResponse(apiClient.put(url, data, config));
const remove = (url, config) => handleResponse(apiClient.delete(url, config));

// Auth API
export const authApi = {
    login: (email, password) => post('/auth/login', { email, password }),
    register: (payload) => post('/auth/register', payload),
};

// Users API
export const userApi = {
    list: () => get('/users'),
    getById: (id) => get(`/users/${id}`),
    create: (payload) => post('/users', payload),
    update: (id, payload) => put(`/users/${id}`, payload),
    remove: (id) => remove(`/users/${id}`),
};

// Transactions API
export const transactionsApi = {
    list: () => get('/transactions'),
    getById: (id) => get(`/transactions/${id}`),
    create: (payload) => post('/transactions', payload),
    update: (id, payload) => put(`/transactions/${id}`, payload),
    remove: (id) => remove(`/transactions/${id}`),
};

// Investments API
export const investmentsApi = {
    list: () => get('/investments'),
    getById: (id) => get(`/investments/${id}`),
    create: (payload) => post('/investments', payload),
    update: (id, payload) => put(`/investments/${id}`, payload),
    remove: (id) => remove(`/investments/${id}`),
    getTotalInvested: () => get('/investments/total-invested'),
    getGainLoss: () => get('/investments/gain-loss'),
    simulateInvestment: (payload) => post('/investments/simulate', payload),
};

// Wallets API
export const walletsApi = {
    list: () => get('/wallets'),
    getById: (id) => get(`/wallets/${id}`),
    create: (payload) => post('/wallets', payload),
    update: (id, payload) => put(`/wallets/${id}`, payload),
    remove: (id) => remove(`/wallets/${id}`),
};

// Dashboard API
export const dashboardApi = {
    getSummary: () => get('/dashboard/dashboard'),
    getDashboard: () => get('/dashboard/dashboard'),
};

// Actives API
export const activesApi = {
    list: () => get('/actives'),
    getById: (id) => get(`/actives/${id}`),
    create: (payload) => post('/actives', payload),
    update: (id, payload) => put(`/actives/${id}`, payload),
    remove: (id) => remove(`/actives/${id}`),
};

// Historical Balances API
export const historicalBalancesApi = {
    listByActive: (activeId) => get(`/historical-balances/active/${activeId}`),
    getById: (id) => get(`/historical-balances/${id}`),
    create: (payload) => post('/historical-balances', payload),
    update: (id, payload) => put(`/historical-balances/${id}`, payload),
    remove: (id) => remove(`/historical-balances/${id}`),
};

// Performance API
export const performanceApi = {
    getGainLoss: (activeId, startDate, endDate) => 
        get(`/performance/active/${activeId}/gain-loss`, {
            params: { startDate, endDate }
        }),
    getPerformanceByPeriod: (activeId) => 
        get(`/performance/active/${activeId}/periods`),
    getAllPerformance: (startDate, endDate) =>
        get('/performance/all', {
            params: { startDate, endDate }
        }),
    getTopPerformers: (limit) =>
        get('/performance/top-performers', {
            params: { limit }
        }),
    getPortfolioEvolution: (months) =>
        get('/performance/evolution', {
            params: { months }
        }),
    getAllocation: () =>
        get('/performance/allocation'),
    getLastBalanceDates: () =>
        get('/performance/last-dates'),
};

export default apiClient;
