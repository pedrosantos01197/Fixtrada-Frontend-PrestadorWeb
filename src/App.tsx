import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Cadastro from './pages/Cadastro';
import RecuperarCadastro from './pages/RecuperarCadastro';
import Home from './pages/Home.tsx';
import Servicos from './pages/Servicos.tsx';
import DetalhesServico from './pages/DetalhesServico.tsx';
import Chat from './pages/Chat.tsx';
import ChatList from './pages/ChatList.tsx';
import Perfil from './pages/Perfil.tsx';
import DadosPessoais from './pages/DadosPessoais.tsx';
import Seguranca from './pages/Seguranca.tsx';
import { AppLayout } from './layouts/AppLayout';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route path="/RecuperarCadastro" element={<RecuperarCadastro />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Servicos" element={<Servicos />} />
        <Route path="/DetalhesServico/:serviceId" element={<DetalhesServico />} />
        <Route path="/Chat/:chatId" element={<Chat />} />
        <Route path="/ChatList" element={<ChatList />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/DadosPessoais" element={<DadosPessoais />} />
        <Route path="/Seguranca" element={<Seguranca />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
