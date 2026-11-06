import PropTypes from "prop-types";
import { useContext } from "react";
import { BiCartAdd } from "react-icons/bi";
import MarketContext from "../../context/MarketContext";
import styles from "./ProductCard.module.css";

/**
 * O componente original esperava snake_case (uuid_produto, nome, ...), mas a
 * página Market passava camelCase (productId, name, ...). No modo debug as
 * duas formas são aceitas para o card realmente aparecer.
 */
const ProductCard = ({
  uuid_produto,
  productId,
  nome,
  name,
  descricao,
  description,
  imagem_url,
  imageUrl,
  preco,
  price,
  estoque,
  stock,
}) => {
  const { addProduct } = useContext(MarketContext);

  const id = uuid_produto ?? productId;
  const displayName = nome ?? name ?? "Produto";
  const displayDescription = descricao ?? description ?? "";
  const displayImage = imagem_url ?? imageUrl ?? "";
  const displayPrice = Number(preco ?? price ?? 0);
  const displayStock = estoque ?? stock ?? "—";

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(displayPrice);

  const addToCart = () => {
    addProduct({
      productId: id,
      name: displayName,
      description: displayDescription,
      imageUrl: displayImage,
      price: displayPrice,
      uuid_produto: id,
      nome: displayName,
      descricao: displayDescription,
      imagem_url: displayImage,
      preco: displayPrice,
    });
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.productName}>{displayName}</h3>
      </div>
      <div className={styles.cardBody}>
        <img src={displayImage} alt={displayName} className={styles.productImage} />
      </div>
      <div className={styles.cardFooter}>
        <p className={styles.productDesc}>{displayDescription}</p>
        <div className={styles.footerBottom}>
          <div className={styles.productInfo}>
            <span className={styles.productPrice}>{formattedPrice}</span>
            <span>Estoque: {displayStock}</span>
          </div>
          <button className={styles.addToCartButton} onClick={addToCart}>
            <BiCartAdd size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  uuid_produto: PropTypes.string,
  productId: PropTypes.string,
  nome: PropTypes.string,
  name: PropTypes.string,
  descricao: PropTypes.string,
  description: PropTypes.string,
  imagem_url: PropTypes.string,
  imageUrl: PropTypes.string,
  preco: PropTypes.number,
  price: PropTypes.number,
  estoque: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ProductCard;
