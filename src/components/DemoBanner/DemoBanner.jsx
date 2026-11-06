import PropTypes from "prop-types";

/**
 * Aviso exibido nas páginas que caem em dados fictícios quando a API do evento
 * não está configurada (build de demonstração publicado no GitHub Pages).
 */
export default function DemoBanner({ children }) {
  return (
    <p
      style={{
        maxWidth: "760px",
        margin: "0 auto 1rem",
        padding: "10px 14px",
        border: "1px dashed #f7c94b",
        borderRadius: "8px",
        color: "#f7c94b",
        fontSize: "0.85rem",
        textAlign: "center",
      }}
    >
      {children}
    </p>
  );
}

DemoBanner.propTypes = {
  children: PropTypes.node.isRequired,
};
