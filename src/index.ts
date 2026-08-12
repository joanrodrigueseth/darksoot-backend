import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { contactsRouter } from './routes/contacts';
import { chatsRouter } from './routes/chats';
import { chaptersRouter } from './routes/chapters';
import { minigamesRouter } from './routes/minigames';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'darksoot-api' });
});

app.use('/auth', authRouter);
app.use('/contacts', contactsRouter);
app.use('/chats', chatsRouter);
app.use('/chapters', chaptersRouter);
app.use('/minigames', minigamesRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Darksoot API listening on :${PORT}`);
});
