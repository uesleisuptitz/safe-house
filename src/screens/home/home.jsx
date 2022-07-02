import { ButtonLink, Header, Title } from "../../components";
import * as s from "./style";

const Home = () => {
  return (
    <s.Container>
      <Header />
      <s.Main>
        <Title />
        <s.Grid>
          <ButtonLink href="/salas">Buscar sala</ButtonLink>
          <ButtonLink href="/nova-sala">Criar uma sala</ButtonLink>
        </s.Grid>
      </s.Main>
    </s.Container>
  );
};

export default Home;
