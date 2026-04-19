import app from './server.js';
import { connectDb } from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`SilentClass API running on port ${PORT}`);
  });
});
