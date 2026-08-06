export default function Card({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,.08)",
      }}
    >
      {children}
    </div>
  );
}