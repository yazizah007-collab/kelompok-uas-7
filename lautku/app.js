const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/produk', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tambak', require('./routes/tambakRoutes'));
app.use('/api/monitoring', require('./routes/monitoringRoutes'));
app.use('/api/artikel', require('./routes/artikelRoutes'));
app.use('/api/panen', require('./routes/panenRoutes'));
app.use('/api/cuaca', require('./routes/cuacaRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'LautKu API berjalan!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));