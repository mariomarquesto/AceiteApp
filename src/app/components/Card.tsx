export default function Card({
  title,
  value,
  subtitle,
  icon,
  color = "#0ea5e9",
  trend
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        {icon && (
          <div className="card-icon" style={{ background: color + "15", color }}>
            {icon}
          </div>
        )}
      </div>

      <div className="card-value">{value}</div>

      <div className="card-footer">
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
        {trend && (
          <div className={"card-trend " + (trend.positive ? "positive" : "negative")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>

      <div className="card-glow" style={{ background: color }} />
    </div>
  );
}
