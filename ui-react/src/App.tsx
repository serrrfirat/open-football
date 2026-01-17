import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './routes/index';
import Inbox from './routes/inbox';
import Conversation from './routes/conversation';
import Squad from './routes/squad';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="conversation/:id" element={<Conversation />} />
        <Route path="squad" element={<Squad />} />
      </Route>
    </Routes>
  );
}

export default App;
