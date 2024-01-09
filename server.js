import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const app = express();

const PORT = process.env.PORT;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});
