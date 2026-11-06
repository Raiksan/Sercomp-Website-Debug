import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa"; // Importe o ícone de Spinner
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { api } from "../../lib/axios";

import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Partners from "../../components/Partners/Partners";
import { withBase } from "../../utils/withBase";
import styles from "./Registrations.module.css";

const mockActivities = {
  minicursos: [
    { uuid_atividade: "mock-mini-1", nome: "English for Tech Interviews", _count: 12, max_participants: 30 },
    { uuid_atividade: "mock-mini-2", nome: "Produtividade sem Burnout", _count: 21, max_participants: 30 },
    { uuid_atividade: "mock-mini-3", nome: "Blockchain na Prática", _count: 8, max_participants: 25 },
  ],
  workshops: [
    { uuid_atividade: "mock-work-1", nome: "Docker 101", _count: 18, max_participants: 40 },
    { uuid_atividade: "mock-work-2", nome: "Power BI", _count: 25, max_participants: 40 },
  ],
  oficinas: [
    { uuid_atividade: "mock-ofi-1", nome: "UI/UX no Figma", _count: 15, max_participants: 30 },
    { uuid_atividade: "mock-ofi-2", nome: "Spring Boot CRUD", _count: 10, max_participants: 30 },
  ],
};

const mockLotes = [
  { uuid_lote: "mock-lote-1", nome: "Lote 1 — Estudante", preco: 40 },
  { uuid_lote: "mock-lote-2", nome: "Lote 2 — Profissional", preco: 80 },
];

const Inscricoes = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    mode: "all",
  });

  const [activities, setActivities] = useState({
    minicursos: [],
    oficinas: [],
    workshops: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mockMode, setMockMode] = useState(!import.meta.env.VITE_API_URL);

  const [lotes, setLotes] = useState([]);

  const selectedLote = watch("lote");

  useEffect(() => {
    async function fecthApiData() {
      if (!import.meta.env.VITE_API_URL) {
        setActivities(mockActivities);
        setLotes(mockLotes);
        setIsLoading(false);
        return;
      }

      try {
        const ativitiesPromise = api.get(
          `/events/${import.meta.env.VITE_EVENTO_UUID}/atividades`
        );
        const lotesPromise = api.get(
          `/events/${import.meta.env.VITE_EVENTO_UUID}/lotes`
        );

        const [ativitiesResponse, lotesResponse] = await Promise.all([
          ativitiesPromise,
          lotesPromise,
        ]);

        setActivities(ativitiesResponse.data);
        setLotes(lotesResponse.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        // No modo debug não recarrega a página em loop: exibe dados fictícios.
        setActivities(mockActivities);
        setLotes(mockLotes);
        setMockMode(true);
        setIsLoading(false);
        toast.warning("API indisponível — exibindo dados fictícios de demonstração.");
      }
    }

    fecthApiData();
  }, [navigate]);

  async function onSubmit(data) {
    const workshop_id = data.workshop;
    const minicurso_id = data.oficina;
    const oficina_id = data.minicurso;

    const { nome, nome_cracha, email, instituicao, lote } = data;

    if (!lote) {
      toast.error("O lote é obrigatório!");
    }

    if (mockMode) {
      toast.success("Modo demonstração: inscrição simulada (nenhum dado foi enviado).");
      return;
    }

    const requestData = {
      nome,
      nome_cracha,
      email,
      instituicao,
      atividades: { workshop_id, minicurso_id, oficina_id },
      lote_id: lote || lotes[0].uuid_lote,
    };

    try {
      const { data } = await api.post(
        `/register/${import.meta.env.VITE_EVENTO_UUID}`,
        requestData
      );

      toast.success("Inscrição realizada!");
      await new Promise((r) => setTimeout(r, 3000));

      navigate(`/pagamento/user/${data.uuid_user}/lote/${selectedLote}`);
    } catch (error) {
      toast.error(error.response.data);
    }
  }

  return (
    <>
      <section className={styles.container}>
        <ToastContainer autoClose={2500} />
        <h1 className="mainTitle">
          <strong>Inscrição</strong>
        </h1>

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
            MODO DEBUG · dados fictícios de demonstração (API não configurada ou indisponível). Nenhuma inscrição real será enviada.
          </p>
        )}

        {isLoading ? (
          <LoadingScreen />
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.formContainer}
          >
            <div className={styles.inputGroup}>
              <div>
                <p>Nome completo</p>
                <input
                  disabled={isSubmitting}
                  required
                  type="text"
                  placeholder="Nome completo"
                  {...register("nome", { required: true })}
                />
              </div>
              <div>
                <p>Nome no crachá</p>
                <input
                  disabled={isSubmitting}
                  required
                  type="text"
                  placeholder="Nome no crachá"
                  {...register("nome_cracha", { required: true })}
                />
              </div>
              <div>
                <p>E-mail</p>
                <input
                  disabled={isSubmitting}
                  required
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: true })}
                />
              </div>
              <div>
                <p>Instituição</p>
                <input
                  disabled={isSubmitting}
                  required
                  type="text"
                  placeholder="Instituição"
                  {...register("instituicao", { required: true })}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <p>Selecione o lote</p>
              <div className={styles.inputGroupLotes}>
                {lotes.map((lote) => (
                  <label
                    key={lote.uuid_lote}
                    htmlFor={lote.uuid_lote}
                    className={`${styles.loteContainer} ${
                      selectedLote === lote.uuid_lote
                        ? styles.loteContainerChecked
                        : ""
                    }`}
                  >
                    <div className={styles.loteContent}>
                      {lote.nome} <br />{" "}
                      <span> Valor - R${lote.preco.toFixed(2)}</span>{" "}
                    </div>
                    <input
                      id={lote.uuid_lote}
                      type="radio"
                      value={lote.uuid_lote}
                      checked={selectedLote === lote.uuid_lote}
                      disabled={isSubmitting}
                      {...register("lote")}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.selectContainer}>
              <span className={styles.selectContainerAlert}>
                <strong>Aviso: </strong>
                Os minicursos e oficinas acontecem pela manhã, e os workshops
                pela noite. Se não puder participar em algum desses
                horários, não é preciso selecioná-los. Inscreva-se apenas nas
                atividades em que estiver disponível.
              </span>
              <div className={styles.selectGroup}>
                <p>Minicursos</p>
                <select {...register("minicurso")}>
                  <option value="">Selecione...</option>
                  {activities.minicursos.map((minicurso) => (
                    <option
                      key={minicurso.uuid_atividade}
                      value={minicurso.uuid_atividade}
                    >
                      {minicurso.nome} - Vagas{" "}
                      {`(${minicurso._count}/${minicurso.max_participants})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectGroup}>
                <p>Workshops</p>
                <select {...register("workshop")}>
                  <option value="">Selecione...</option>
                  {activities.workshops.map((workshop) => (
                    <option
                      key={workshop.uuid_atividade}
                      value={workshop.uuid_atividade}
                    >
                      {workshop.nome} - Vagas{" "}
                      {`(${workshop._count}/${workshop.max_participants})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectGroup}>
                <p>Oficinas</p>
                <select {...register("oficina")}>
                  <option value="">Selecione...</option>
                  {activities.oficinas.map((oficina) => (
                    <option
                      key={oficina.uuid_atividade}
                      value={oficina.uuid_atividade}
                    >
                      {oficina.nome} - Vagas{" "}
                      {`(${oficina._count}/${oficina.max_participants})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.linkContainer}>
              <a href={withBase("/busca/inscricao")}>
                Já está inscrito? Busque sua inscrição aqui!
              </a>
            </div>

            <div className={styles.submitButtonContainer}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className={styles.spinner} />
                    Aguarde...
                  </>
                ) : (
                  "Inscrever-se"
                )}
              </button>
            </div>
          </form>
        )}
      </section>
      <Partners />
    </>
  )
};

export default Inscricoes;