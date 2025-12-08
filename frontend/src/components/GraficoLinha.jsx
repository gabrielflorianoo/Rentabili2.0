import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function GraficoLinha({ data }) {
    return (
        // Container responsivo que ajusta o gráfico ao tamanho do elemento pai
        <ResponsiveContainer width="100%" height={200}>
            {/* LineChart: componente principal do gráfico de linha */}
            <LineChart data={data}>
                
                {/* 
                    XAxis: eixo horizontal.
                    'dataKey="mes"' indica que o eixo X usará o campo "mes"
                    de cada objeto do array 'data'.
                */}
                <XAxis dataKey="mes" />

                {/* Eixo vertical padrão (valores numéricos) */}
                <YAxis />

                {/* Tooltip: exibe valores ao passar o mouse sobre o gráfico */}
                <Tooltip />

                {/* 
                    Line: a linha do gráfico.
                    type="monotone" gera curva suave entre os pontos.
                    dataKey="valor" indica o campo usado como valor.
                 */}
                <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#2ecc71"   // Cor verde
                    strokeWidth={3}    // Espessura da linha
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
