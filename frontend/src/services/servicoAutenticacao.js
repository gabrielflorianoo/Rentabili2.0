import { authApi } from './apis';

export const servicoAutenticacao = {
    entrar: async (email, password) => {
        try {
            const response = await authApi.login(email, password);
            const data = response;

            // Salva token e usuário
            if (data.accessToken) {
                localStorage.setItem('rentabil_token', data.accessToken);
            }
            if (data.user) {
                localStorage.setItem(
                    'rentabil_user',
                    JSON.stringify(data.user),
                );
            }

            return { sucesso: true, usuario: data.user };
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.error || 'Falha ao entrar';
            return { sucesso: false, erro: msg, campo: 'email' };
        }
    },

    cadastrar: async (dados) => {
        try {
            const payload = {
                name: dados.nome,
                email: dados.email,
                password: dados.senha,
                phone: dados.nascimento,
            };
            const response = await authApi.register(payload);
            if (response.user) {
                return { sucesso: true };
            }
            return {
                sucesso: false,
                erro: response.data?.error || 'Erro ao cadastrar',
                campo: 'email',
            };
        } catch (error) {
            const msg = error?.response?.data?.error || 'Erro de conexão.';
            return { sucesso: false, erro: msg, campo: 'email' };
        }
    },

    sair: () => {
        localStorage.removeItem('rentabil_token');
        localStorage.removeItem('rentabil_user');
    },

    obterUsuarioAtual: () => {
        const user = localStorage.getItem('rentabil_user');
        return user ? JSON.parse(user) : null;
    },

    obterToken: () => {
        return localStorage.getItem('rentabil_token');
    },
};
