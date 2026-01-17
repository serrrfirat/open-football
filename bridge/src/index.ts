import { createServer } from './server.js';

const PORT = process.env.PORT || 3001;

const server = createServer();

server.listen(PORT, () => {
  console.log(`Bridge server running on http://localhost:${PORT}`);
  console.log(`Agent token required: ${process.env.AGENT_BRIDGE_TOKEN ? 'Yes' : 'No (dev mode)'}`);
});
