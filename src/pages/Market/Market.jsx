import { useContext, useEffect, useState } from "react";
import { BiCart, BiX } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import CartPopup from "../../components/CartPopup/CartPopup";
import EmailPopup from "../../components/EmailPopup/EmailPopup";
import ProductCard from "../../components/ProductCard/ProductCard";
import MarketContext from "../../context/MarketContext";
import { api } from "../../lib/axios";
import semImagem from "../../assets/images/sem-imagem.webp";
import styles from "./Market.module.css";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";

const mockProducts = [
  {
    productId: "mock-prod-1",
    name: "Camisa oficial do SERCOMP",
    description: "Camisa do VII SERCOMP em algodão, tamanhos P ao GG.",
    imageUrl: semImagem,
    price: 59.9,
    stock: 42,
  },
  {
    productId: "mock-prod-2",
    name: "Caneca SERCOMP",
    description: "Caneca de cerâmica com o logo do evento.",
    imageUrl: semImagem,
    price: 34.9,
    stock: 18,
  },
  {
    productId: "mock-prod-3",
    name: "Kit adesivos",
    description: "Cartela com adesivos temáticos do sertão e da computação.",
    imageUrl: semImagem,
    price: 12.5,
    stock: 90,
  },
  {
    productId: "mock-prod-4",
    name: "Ecobag",
    description: "Sacola reutilizável de algodão cru com estampa do evento.",
    imageUrl: semImagem,
    price: 39.9,
    stock: 25,
  },
];

const Market = () => {
  const [marketProducts, setMarketProducts] = useState([]);
  const { products } = useContext(MarketContext);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mockMode, setMockMode] = useState(!import.meta.env.VITE_API_URL);

  async function fetchData() {
    if (!import.meta.env.VITE_API_URL) {
      setMarketProducts(mockProducts);
      setLoading(false);
      return;
    }

    setLoading(true);
    await api
      .get(`/events/${import.meta.env.VITE_EVENTO_UUID}/produtos`)
      .then((response) => {
        setMarketProducts(response.data);
      })
      .catch(() => {
        setMockMode(true);
        setMarketProducts(mockProducts);
        toast.warning("API indisponível — exibindo produtos fictícios de demonstração.");
      });
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCartPopup = () => {
    setShowCartPopup(!showCartPopup);
  };

  const handleBuyClick = () => {
    setShowCartPopup(false);
    setShowEmailPopup(true);
  };

  const handleCloseEmailPopup = () => {
    setShowEmailPopup(false);
  };

  return (
    <>
      <div className={styles.marketContainer}>
        <ToastContainer autoClose={2500} />
        <section className={styles.marketHeader}>
          <h3>🌵 Loja Online</h3>
          <div className={styles.headerCart}>
            <button className={styles.cartButton} onClick={toggleCartPopup}>
              {!showCartPopup ? <BiCart size={30} /> : <BiX size={30} />}
            </button>
            {products && products.length > 0 && (
              <div className={`${styles.notificationBadge} ${styles.bounce}`}>
                {products.reduce((total, product) => {
                  return total + product.quantity;
                }, 0)}
              </div>
            )}
            {showCartPopup && (
              <CartPopup products={products} handleBuyClick={handleBuyClick} />
            )}
          </div>
        </section>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            {mockMode && (
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
                MODO DEBUG · produtos fictícios de demonstração (API não configurada ou indisponível).
              </p>
            )}
            <div className={styles.productContainer}>
              {marketProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  productId={product.productId}
                  name={product.name}
                  description={product.description}
                  imageUrl={product.imageUrl}
                  price={product.price}
                  stock={product.stock}
                />
              ))}
            </div>
          </>
        )}

        {showEmailPopup && <EmailPopup onClose={handleCloseEmailPopup} />}
        <div className={styles.linkContainer}>
          <a href="/busca/inscricao/pagamentos">
            Já fez alguma compra? Busque aqui!
          </a>
        </div>
      </div>
    </>
  );
};

export default Market;
