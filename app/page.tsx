import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#e5ac7a", 
        color: "#5A1E0E", 
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        Can You Find the Flame-Grilled King?
      </h1>

      <p
        style={{
          fontSize: "18px",
          lineHeight: "1.8",
          marginTop: "10px",
        }}
      >
        Explore the scene. <br />
        Spot the hidden Whopper. <br />
        Claim the crown.
      </p>

      <Link href="/game">
        <button
          style={{
            marginTop: "30px",
            padding: "14px 28px",
            fontSize: "18px",
            fontWeight: 600,
            backgroundColor: "#ec3535",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "8px",
            transition: "0.2s ease",
          }}
        >
          Start the Hunt
        </button>
      </Link>
    </main>
  );
}