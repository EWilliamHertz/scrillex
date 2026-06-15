import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import scryfallRoutes from './routes/scryfall';
import collectionRoutes from './routes/collection';
import publicRoutes from './routes/public';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scryfall', scryfallRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
