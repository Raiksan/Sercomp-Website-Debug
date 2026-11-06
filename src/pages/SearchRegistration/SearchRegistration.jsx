import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import DemoBanner from "../../components/DemoBanner/DemoBanner";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { api } from "../../lib/axios";

import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import styles from "./SearchRegistration.module.css";

const SearchRegistration = () => {
  const { searchType } = useParams();

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    mode: "all",
  });

  const [isLoading, setIsLoading] = useState(false);
  const mockMode = !import.meta.env.VITE_API_URL;

  async function onSubmit(data) {
    setIsLoading(true);

    if (mockMode) {
      // Modo demonstração: qualquer e-mail abre um recibo fictício.
      if (!searchType) {
        navigate("/pagamento/user/demo-user/lote/demo-lote");
      } else {
        navigate("/market/user/demo-user/pagamentos");
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(
        `events/${import.meta.env.VITE_EVENTO_UUID}/inscricoes/find`,
        data
      );

      if (!searchType) {
        navigate(
          `/pagamento/user/${response.data.uuid_user}/lote/${response.data.uuid_lote}`
        );
      } else {
        navigate(`/market/user/${response.data.uuid_user}/pagamentos`);
      }
    } catch (err) {
      toast.error("Erro ao buscar usuario");
    }

    setIsLoading(false);
  }

  return (
    <section className={styles.container}>
      <ToastContainer autoClose={1500} />
      <h1 className="mainTitle">
        <strong>Buscar Inscrição</strong>
      </h1>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.formContainer}
        >
          {mockMode && (
            <DemoBanner>
              MODO DEBUG · busca simulada: qualquer e-mail abre um recibo fictício (API não configurada).
            </DemoBanner>
          )}
          <div className={styles.inputGroup}>
            <div>
              <p>E-mail</p>
              <input
                disabled={isSubmitting}
                required
                type="email"
                placeholder="E-mail"
                {...register("email", { required: true })}
              />
            </div>
          </div>

          <div className={styles.submitButtonContainer}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Aguarde...
                </>
              ) : (
                "Pesquisar"
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default SearchRegistration;
