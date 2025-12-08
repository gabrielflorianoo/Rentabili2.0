import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Cores usadas nos segmentos do gráfico.
// O índice é aplicado em loop usando o operador %.
const COLORS = ['#27ae60', '#2980b9', '#e67e22', '#7f8c8d'];

export default function GraficoDonut({ data }) {
    return (
        // ResponsiveContainer deixa o gráfico responsivo ao tamanho do pai
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    // Dados recebidos via props
                    data={data}

                    // Campo numérico usado nos cálculos dos tamanhos das fatias
                    dataKey="value"

                    // Nome exibido na legenda
                    nameKey="name"

                    // Define o donut (anel) interno e externo
                    innerRadius={60}
                    outerRadius={90}

                    // Espaçamento entre as fatias para um visual moderno
                    paddingAngle={3}
                >
                    {/* 
                        Mapeia cada item do dataset para uma célula colorida 
                        Cada Cell recebe uma cor com base no index 
                    */}
                    {data.map((_, index) => (
                        <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>

                {/* Legenda ao lado direito, vertical e centralizada */}
                <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
