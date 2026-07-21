import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-primary">{payload[0].value?.toFixed(2)} LPM</p>
      </div>
    );
  }
  return null;
};

export default function FlowChart({ readings }) {
  const data = readings.map((r) => ({
    time: format(new Date(r.timestamp || r.created_date), "HH:mm"),
    flow: Number(r.flow_lpm),
  })).reverse();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Flow Rate</h3>
          <p className="text-muted-foreground text-xs mt-0.5">Real-time water flow (L/min)</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Live</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="flow" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#flowGradient)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}