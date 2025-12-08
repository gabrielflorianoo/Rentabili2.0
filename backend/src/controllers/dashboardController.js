import dashboardService from '../services/dashboardService.js';
import dashboardRepository from '../repositories/dashboardRepository.js';

class DashboardController {
    async getSummary(req, res) {
        const userId = req.userId;

        try {
            const summary = await dashboardService.getSummary(userId);

            return res.json(summary);
        } catch (error) {
            console.error(error);
            if (error.message === 'Not Found') {
                return res.status(404).json({ error: 'Not Found' });
            }
            return res.status(500).json({ error: 'Erro ao processar dados financeiros' });
        }
    }

    async getDashboard(req, res) {
        const userId = req.userId;

        try {
            const dashboardData = await dashboardService.getDashboard(userId);

            return res.json(dashboardData);
        } catch (error) {
            console.error(error);
            if (error.message === 'Not Found') {
                return res.status(404).json({ error: 'Not Found' });
            }
            return res.status(500).json({ error: 'Erro ao processar dados financeiros' });
        }
    }

    async getDebug(req, res) {
        const userId = req.userId;

        try {
            const investments = await dashboardRepository.findInvestments(userId);
            
            // Agrupar por tipo
            const byKind = {};
            let totalAll = 0;
            let totalWithoutRenda = 0;
            
            investments.forEach((inv) => {
                const kind = inv.kind;
                if (!byKind[kind]) {
                    byKind[kind] = { count: 0, total: 0 };
                }
                const amount = Number(inv.amount || 0);
                byKind[kind].count += 1;
                byKind[kind].total += amount;
                totalAll += amount;
                
                if (kind !== 'Renda') {
                    totalWithoutRenda += amount;
                }
            });

            return res.json({
                userId,
                totalInvestments: investments.length,
                byKind,
                totalAll,
                totalWithoutRenda,
                investments: investments.map(i => ({
                    id: i.id,
                    active: i.active.name,
                    amount: Number(i.amount),
                    kind: i.kind,
                    date: i.date,
                }))
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default DashboardController;