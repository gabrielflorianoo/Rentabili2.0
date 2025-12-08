import investmentRepository from '../repositories/investmentRepository.js';

class InvestmentService {
    async getAll(userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            if (process.env.USE_DB !== 'true') {
                return this.investments;
            }
            const investments = await investmentRepository.findAll(userId);
            return investments;
        } catch (error) {
            console.error('Erro ao buscar investimentos:', error);
            throw new Error(error.message);
        }
    }

    async getTotalInvested(userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const investments = await investmentRepository.findAll(userId);
            const totalInvested = investments
                .filter((it) => it.kind !== 'Renda') // Excluir 'Renda' do total investido
                .reduce((acc, it) => acc + this.parseAmount(it.amount), 0);
            return totalInvested;
        } catch (error) {
            console.error('Erro ao buscar total investido:', error);
            throw new Error(error.message);
        }
    }

    async getDifferentActivesCount(userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const investments = await investmentRepository.findAll(userId);
            // Contar apenas os ativos que têm investimentos (não rendas)
            const uniqueActives = new Set(
                investments
                    .filter((it) => it.kind !== 'Renda')
                    .map((it) => it.activeId)
            );
            return uniqueActives.size;
        } catch (error) {
            console.error('Erro ao buscar número de ativos diferentes:', error);
            throw new Error(error.message);
        }
    }

    parseAmount(val) {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        const s = String(val).trim();
        if (s === '') return 0;
        try {
            if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
                return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
            }
            if (s.indexOf(',') > -1 && s.indexOf('.') === -1) {
                return parseFloat(s.replace(',', '.')) || 0;
            }
            return parseFloat(s) || 0;
        } catch (e) {
            return 0;
        }
    }

    async getGainLoss(userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const investments = await investmentRepository.findAll(userId);
            const normalized = investments.map((i) => ({
                ...i,
                amountNum: this.parseAmount(i.amount),
            }));

            const investmentsByActive = normalized
                .filter((it) => it.kind !== 'Renda')
                .reduce((map, it) => {
                    if (!map[it.activeId]) map[it.activeId] = [];
                    map[it.activeId].push(it);
                    return map;
                }, {});

            Object.keys(investmentsByActive).forEach((k) =>
                investmentsByActive[k].sort(
                    (a, b) => new Date(a.date) - new Date(b.date),
                ),
            );

            let gain = 0;
            normalized
                .filter((it) => it.kind === 'Renda')
                .forEach((renda) => {
                    const list = investmentsByActive[renda.activeId] || [];
                    const base = list
                        .slice()
                        .reverse()
                        .find(
                            (inv) => new Date(inv.date) <= new Date(renda.date),
                        );
                    if (base) {
                        const delta =
                            (renda.amountNum || 0) - (base.amountNum || 0);
                        gain += delta;
                    } else {
                        gain += renda.amountNum || 0; // Fallback if no base found
                    }
                });
            return gain;
        } catch (error) {
            console.error('Erro ao buscar ganho/perda:', error);
            throw new Error(error.message);
        }
    }

    async getById(id) {
        try {
            if (process.env.USE_DB !== 'true') {
                const item = this.investments.find((i) => i.id === id);
                if (!item) {
                    throw new Error('Investimento não encontrado');
                }
                return item;
            }
            const investment = await investmentRepository.findById(id);
            if (!investment) {
                throw new Error('Investimento não encontrado');
            }
            return investment;
        } catch (error) {
            console.error('Erro ao buscar investimento por ID:', error);
            throw new Error(error.message);
        }
    }

    async create(amount, activeId, date, kind, userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const newInvestment = await investmentRepository.create(
                amount,
                activeId,
                date,
                kind,
                userId,
            );
            return newInvestment;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async update(id, amount, activeId, date, kind, userId) {
        try {
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }
            const updatedInvestment = await investmentRepository.update(
                id,
                amount,
                activeId,
                date,
                kind,
                userId,
            );
            return updatedInvestment;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async remove(id) {
        try {
            await investmentRepository.remove(id);
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    async simulateInvestment(
        initialAmount,
        taxRate,
        periodMonths,
        monthlyContribution,
    ) {
        let balance = initialAmount || 0;
        const monthlyRate = (taxRate || 0) / 100 / 12;
        const history = [];

        for (let month = 1; month <= periodMonths; month++) {
            balance += monthlyContribution || 0;
            balance += balance * monthlyRate;
            history.push({
                month,
                balance: parseFloat(balance.toFixed(2)),
            });
        }

        return { finalBalance: parseFloat(balance.toFixed(2)), history };
    }
}

export default new InvestmentService();
