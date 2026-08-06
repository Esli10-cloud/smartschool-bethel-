export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "12px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      {children}
    </button>
  );
}