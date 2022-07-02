import { ThemeProvider } from "styled-components";
import { Routes, Route } from "react-router-dom";
import { Home, NewRoom } from "./screens";
import { GlobalStyle, THEME } from "./styles/theme";

export default function App() {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={THEME}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-room" element={<NewRoom />} />
          <Route path="*" element={<h1>404</h1>} />
        </Routes>
      </ThemeProvider>
    </>
  );
}
