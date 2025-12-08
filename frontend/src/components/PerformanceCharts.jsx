import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Cores padrão para gráficos
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Componente para gráfico de linha (evolução da carteira)
 */
export const EvolutionLineChart = ({ data, title = "Evolução da Carteira" }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
                <p className="text-gray-400">Dados não disponíveis</p>
            </div>
        );
    }

    return (
        <div className="w-full h-80 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Componente para gráfico de pizza (alocação)
 */
export const AllocationPieChart = ({ data, title = "Alocação de Ativos" }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
                <p className="text-gray-400">Dados não disponíveis</p>
            </div>
        );
    }

    // Normalizar dados para garantir que têm as propriedades esperadas
    const normalizedData = data.map(item => ({
        type: item.type || item.name,
        percentage: item.percentage || 0,
        value: item.value || 0
    }));

    return (
        <div className="w-full h-80 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={normalizedData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {normalizedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Componente para gráfico de barras (performance comparativa)
 */
export const PerformanceBarChart = ({ data, title = "Performance dos Ativos" }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
                <p className="text-gray-400">Dados não disponíveis</p>
            </div>
        );
    }

    const chartData = data.map((item) => ({
        name: item.activeName || item.type || 'Ativo',
        percentage: item.percentage,
        gain: item.absoluteGain,
    }));

    return (
        <div className="w-full h-80 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                    />
                    <YAxis yAxisId="left" label={{ value: 'Ganho (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Ganho Absoluto (R$)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip
                        formatter={(value, name) => {
                            if (name === 'percentage') return [`${value.toFixed(2)}%`, 'Ganho %'];
                            return [`R$ ${value.toFixed(2)}`, 'Ganho Absoluto'];
                        }}
                    />
                    <Bar yAxisId="left" dataKey="percentage" fill="#3b82f6" name="Ganho %" />
                    <Bar
                        yAxisId="right"
                        dataKey="gain"
                        fill="#10b981"
                        name="Ganho Absoluto"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Componente para card de performance individual
 */
export const PerformanceCard = ({ active, performance }) => {
    const isPositive = performance.percentage >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

    return (
        <div className={`${bgColor} rounded-lg p-4 border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-gray-800">{active.name}</h4>
                    <p className="text-sm text-gray-600">{active.type}</p>
                </div>
                <div className={`text-right ${color}`}>
                    <p className="text-2xl font-bold">{performance.percentage.toFixed(2)}%</p>
                    <p className="text-sm">
                        {isPositive ? '+' : ''}R$ {performance.absoluteGain.toFixed(2)}
                    </p>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                <div className="flex justify-between">
                    <span>Inicial: R$ {performance.startValue.toFixed(2)}</span>
                    <span>Atual: R$ {performance.endValue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Componente para exibir top performers em layout card
 */
export const TopPerformersWidget = ({ topPerformers, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-center text-gray-400">Carregando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    if (!topPerformers || (!topPerformers.top && !topPerformers.worst)) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-center text-gray-400">Sem dados</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top 5 Melhores */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🚀 Top 5 Melhores Ativos
                </h3>
                <div className="space-y-3">
                    {topPerformers.top && topPerformers.top.length > 0 ? (
                        topPerformers.top.map((perf, idx) => (
                            <PerformanceCard
                                key={idx}
                                active={{
                                    name: perf.activeName,
                                    type: perf.activeType,
                                }}
                                performance={perf}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400">Sem ativos com ganho positivo</p>
                    )}
                </div>
            </div>

            {/* Top 5 Piores */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    ⚠️ Top 5 Piores Ativos
                </h3>
                <div className="space-y-3">
                    {topPerformers.worst && topPerformers.worst.length > 0 ? (
                        topPerformers.worst.map((perf, idx) => (
                            <PerformanceCard
                                key={idx}
                                active={{
                                    name: perf.activeName,
                                    type: perf.activeType,
                                }}
                                performance={perf}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400">Sem ativos com ganho negativo</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Componente para exibir múltiplos períodos de performance
 */
export const PerformanceByPeriod = ({ performance }) => {
    if (!performance) {
        return <p className="text-gray-400">Dados não disponíveis</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(performance).map(([key, data]) => (
                <div
                    key={key}
                    className={`rounded-lg p-4 border-l-4 ${
                        data.percentage >= 0
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                    }`}
                >
                    <p className="text-sm font-semibold text-gray-700">{data.label}</p>
                    <p
                        className={`text-2xl font-bold ${
                            data.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {data.percentage >= 0 ? '+' : ''}
                        {data.percentage.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                        R$ {data.absoluteGain.toFixed(2)}
                    </p>
                </div>
            ))}
        </div>
    );
};
