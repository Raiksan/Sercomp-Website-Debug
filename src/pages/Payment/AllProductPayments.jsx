import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import DemoBanner from "../../components/DemoBanner/DemoBanner";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import useWindowWidth from "../../hooks/useWindowWidth";
import { api } from "../../lib/axios";
import semImagem from "../../assets/images/sem-imagem.webp";
import { withBase } from "../../utils/withBase";
import styles from "./Payment.module.css";
import moment from "moment";

const demoPurchase = {
  userName: "Participante de Demonstração",
  paymentStatus: "PENDENTE",
  creationDate: "01/05/2025 10:00:00",
  totalPrice: 94.8,
  products: [
    { quantity: 1, productId: "camisa-oficial", price: 59.9, name: "Camisa oficial do SERCOMP" },
    { quantity: 1, productId: "caneca-sercomp", price: 34.9, name: "Caneca SERCOMP" },
  ],
  transactionData: {
    qr_code: "00020126580014br.gov.bcb.pix0136demo-sercomp-loja",
    qr_code_base64: semImagem,
  },
};

const AllProductPayments = () => {
  const location = useLocation();
  const { user_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [mockMode, setMockMode] = useState(!import.meta.env.VITE_API_URL);

  const fullUrl = `${window.location.origin}${withBase(location.pathname)}${location.search}`;
  const windowWidth = useWindowWidth();

  useEffect(() => {
    async function fetchData() {
      if (!import.meta.env.VITE_API_URL) {
        setPurchases([demoPurchase]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`marketplace/user/${user_id}`);

        setPurchases(
          response.data.map((item) => {
            let formattedDate = moment(item.creationDate).format(
              "DD/MM/YYYY HH:mm:ss"
            );

            return {
              userName: item.user.name,
              paymentStatus: item.paymentStatus,
              creationDate: formattedDate,
              totalPrice: item.totalValue,
              products: item.sales.map((sale) => ({
                quantity: sale.quantity,
                productId: sale.product.productId,
                price: sale.product.price,
                name: sale.product.name,
              })),
              transactionData: item.transactionData,
            };
          })
        );
      } catch (error) {
        console.log(error);
        toast.error("Venda não encontrada!");
        setMockMode(true);
        setPurchases([demoPurchase]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user_id]);

  function handleCopyPix(code) {
    navigator.clipboard.writeText(code);
    toast.success("Chave copiada!");
  }

  if (loading) {
    return (
      <>
        <ToastContainer autoClose={1500} />
        <LoadingScreen />
      </>
    );
  }

  return (
    <section className={styles.container}>
      <ToastContainer autoClose={1500} />
      <h1 className="mainTitle">
        <strong>Pagamentos</strong>
      </h1>

      <section className={styles.sectionContainer}>
        {mockMode && (
          <DemoBanner>
            MODO DEBUG · recibo fictício de demonstração (API não configurada ou indisponível).
          </DemoBanner>
        )}
        <h2>Recibo de Compra - Loja Online</h2>
        <span>
          <span className={styles.detach}>Guarde esse link</span>, ele é útil
          para informar o status de pagamento da sua compra!
        </span>

        {purchases.length === 0 && (
          <p>Nenhuma compra encontrada para este link.</p>
        )}

        {purchases.length !== 0 && (
          <div>
            {purchases.map((userInformations, index) => (
              <div
                key={index}
                className={`${styles.paymentGroupDivider} ${styles.paymentGroup}`}
              >
                <div className={styles.infoGroup}>
                  <span>
                    <span className={styles.detach}>Participante: </span>{" "}
                    {userInformations.userName}
                  </span>
                  <div className={styles.payment}>
                    <span className={styles.detach}>Status pagamento: </span>{" "}
                    <div
                      className={
                        userInformations.paymentStatus === "REALIZADO"
                          ? styles.paid
                          : styles.pending
                      }
                    >
                      {userInformations.paymentStatus}
                    </div>
                  </div>
                  <span>
                    <span className={styles.detach}>
                      Preço total da compra:{" "}
                    </span>{" "}
                    R$ {userInformations.totalPrice.toFixed(2)}
                  </span>
                  <span>
                    <span className={styles.detach}>Data do pedido: </span>
                    {userInformations.creationDate}
                  </span>
                  <span>
                    <span className={styles.detach}>
                      Produtos comprados:{" "}
                    </span>{" "}
                    {userInformations.products.map((product) => (
                      <div key={product.productId}>
                        {product.name} - {product.quantity} x R${" "}
                        {product.price.toFixed(2)}{" "}
                      </div>
                    ))}
                  </span>
                </div>

                <div className={styles.QRContainer}>
                  <img
                    src={userInformations.transactionData.qr_code_base64}
                    className={styles.QRCode}
                    alt="QR Code"
                  />
                  <button onClick={() => handleCopyPix(userInformations.transactionData.qr_code)}>
                    Copiar pix <FaCopy />
                  </button>
                </div>
              </div>
            ))}
            <div className={styles.warning} style={{ marginTop: "16px" }}>
              <span>
                <span className={styles.detach}>*</span>Para validar esse
                recibo acesse:<span className={styles.detach}>*</span>
              </span>
              <a className={`${styles.link} ${styles.fullUrl}`} href={fullUrl}>
                {windowWidth > 600 ? fullUrl : "Aqui"}
              </a>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default AllProductPayments;
