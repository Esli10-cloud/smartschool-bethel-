export default function StatsCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
      }}
    >
      <div style={{fontSize:"35px"}}>{icon}</div>

      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}