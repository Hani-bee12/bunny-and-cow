import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatRupiah } from '../lib/format'

export default function CategoryPie({ data }) {
  if (!data.length) {
    return (
      <div className="empty-state">
        <div className="emoji">🍩</div>
        <p>Belum ada pengeluaran konsumtif bulan ini.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            cornerRadius={6}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatRupiah(value), name]}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12.5 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
