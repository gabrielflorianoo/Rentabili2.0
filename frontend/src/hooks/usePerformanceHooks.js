import { useState, useCallback, useEffect } from 'react';
import { performanceApi } from '../services/apis';

/**
 * Hook para gerenciar dados de performance de um ativo
 */
export const usePerformance = (activeId) => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPerformance = useCallback(async () => {
        if (!activeId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getPerformanceByPeriod(activeId);
            setPerformance(data);
        } catch (err) {
            console.error('Erro ao buscar performance:', err);
            setError(err.message || 'Erro ao buscar performance');
        } finally {
            setLoading(false);
        }
    }, [activeId]);

    useEffect(() => {
        fetchPerformance();
    }, [fetchPerformance]);

    return { performance, loading, error, refetch: fetchPerformance };
};

/**
 * Hook para gerenciar dados de ganho/perda com intervalo de datas
 */
export const useGainLoss = (activeId, startDate = null, endDate = null) => {
    const [gainLoss, setGainLoss] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGainLoss = useCallback(async () => {
        if (!activeId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getGainLoss(activeId, startDate, endDate);
            setGainLoss(data);
        } catch (err) {
            console.error('Erro ao buscar ganho/perda:', err);
            setError(err.message || 'Erro ao buscar ganho/perda');
        } finally {
            setLoading(false);
        }
    }, [activeId, startDate, endDate]);

    useEffect(() => {
        fetchGainLoss();
    }, [fetchGainLoss]);

    return { gainLoss, loading, error, refetch: fetchGainLoss };
};

/**
 * Hook para gerenciar performance de todos os ativos
 */
export const useAllPerformance = (startDate = null, endDate = null) => {
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllPerformance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getAllPerformance(startDate, endDate);
            setPerformances(data);
        } catch (err) {
            console.error('Erro ao buscar performance geral:', err);
            setError(err.message || 'Erro ao buscar performance');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchAllPerformance();
    }, [fetchAllPerformance]);

    return { performances, loading, error, refetch: fetchAllPerformance };
};

/**
 * Hook para gerenciar top performers
 */
export const useTopPerformers = (limit = 5) => {
    const [topPerformers, setTopPerformers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTopPerformers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getTopPerformers(limit);
            setTopPerformers(data);
        } catch (err) {
            console.error('Erro ao buscar top performers:', err);
            setError(err.message || 'Erro ao buscar top performers');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchTopPerformers();
    }, [fetchTopPerformers]);

    return { topPerformers, loading, error, refetch: fetchTopPerformers };
};

/**
 * Hook para gerenciar evolução da carteira
 */
export const usePortfolioEvolution = (months = 12) => {
    const [evolution, setEvolution] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvolution = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getPortfolioEvolution(months);
            setEvolution(data);
        } catch (err) {
            console.error('Erro ao buscar evolução:', err);
            setError(err.message || 'Erro ao buscar evolução');
        } finally {
            setLoading(false);
        }
    }, [months]);

    useEffect(() => {
        fetchEvolution();
    }, [fetchEvolution]);

    return { evolution, loading, error, refetch: fetchEvolution };
};

/**
 * Hook para gerenciar alocação de ativos
 */
export const useAllocation = () => {
    const [allocation, setAllocation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllocation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getAllocation();
            setAllocation(data);
        } catch (err) {
            console.error('Erro ao buscar alocação:', err);
            setError(err.message || 'Erro ao buscar alocação');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllocation();
    }, [fetchAllocation]);

    return { allocation, loading, error, refetch: fetchAllocation };
};

/**
 * Hook para gerenciar datas de último saldo
 */
export const useLastBalanceDates = () => {
    const [lastDates, setLastDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLastDates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await performanceApi.getLastBalanceDates();
            setLastDates(data);
        } catch (err) {
            console.error('Erro ao buscar datas:', err);
            setError(err.message || 'Erro ao buscar datas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLastDates();
    }, [fetchLastDates]);

    return { lastDates, loading, error, refetch: fetchLastDates };
};
