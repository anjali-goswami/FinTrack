
const SummaryCard = ({
  title,
  amount,
  icon,
  color,
  trend,
  trendLabel,
}) => {
  const iconComponent =
    typeof icon === "string" ? (
      <span role="img" aria-label="" style={{ fontSize: "1.5rem" }}>
        {icon}
      </span>
    ) : (
      icon
    );

  const isPercentage = title.toLowerCase().includes("rate");

  const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  return (
    <article
      className={`stat-card ${color}`}
      style={{
        "--card-accent": `var(--color-${color})`,
        "--card-icon-bg": `var(--color-${color}-light)`,
        "--card-icon-color": `var(--color-${color})`,
      }}
    >
      <div className="stat-card-icon" aria-hidden="true">
        {iconComponent}
      </div>

      <div className="stat-card-content">
        <p className="stat-card-label">{title}</p>

        <p className="stat-card-value">
          {isPercentage ? `${formattedAmount}%` : `₹${formattedAmount}`}
        </p>

        {trend !== undefined && (
          <div
            className={`stat-card-trend ${
              trend >= 0 ? "positive" : "negative"
            }`}
          >
            <span>
              {trendLabel || (trend >= 0 ? "+" : "")}
              {trend.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

export default SummaryCard;
