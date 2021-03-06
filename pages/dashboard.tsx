import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({
    roles: ["administrator", "editor"],
    permissions: ["metrics.delete","metrics.list"],
  });

  useEffect(() => {
    api
      .get("/me")
      .then((response) => console.log(response))
      .catch((err) => console.log("Pages|Dashboard", err));
  }, []);

  return (
    <div>
      <h1>Dashboard: {user?.email}</h1>

      {userCanSeeMetrics && <div> Métricas </div>}
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get("/me");
  console.log(response.data);

  return {
    props: {},
  };
});
