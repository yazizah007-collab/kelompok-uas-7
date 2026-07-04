const tambakModel = require('../models/tambakModel');

const WEATHER_LABELS = {
  0: { label: 'Cerah', icon: '☀️' },
  1: { label: 'Cerah Berawan', icon: '🌤️' },
  2: { label: 'Berawan Sebagian', icon: '⛅' },
  3: { label: 'Mendung', icon: '☁️' },
  45: { label: 'Berkabut', icon: '🌫️' },
  48: { label: 'Berkabut Tebal', icon: '🌫️' },
  51: { label: 'Gerimis Ringan', icon: '🌦️' },
  53: { label: 'Gerimis', icon: '🌦️' },
  55: { label: 'Gerimis Lebat', icon: '🌧️' },
  61: { label: 'Hujan Ringan', icon: '🌧️' },
  63: { label: 'Hujan Sedang', icon: '🌧️' },
  65: { label: 'Hujan Lebat', icon: '🌧️' },
  80: { label: 'Hujan Lokal Ringan', icon: '🌦️' },
  81: { label: 'Hujan Lokal Sedang', icon: '🌧️' },
  82: { label: 'Hujan Lokal Lebat', icon: '⛈️' },
  95: { label: 'Badai Petir', icon: '⛈️' },
  96: { label: 'Badai Petir + Hujan Es', icon: '⛈️' },
  99: { label: 'Badai Petir Kuat', icon: '⛈️' }
};

const getWeatherInfo = (code) => WEATHER_LABELS[code] || { label: 'Tidak diketahui', icon: '❓' };

const searchLocation = async (query) => {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=id&format=json`
  );
  const geoData = await geoRes.json();
  return geoData.results && geoData.results.length > 0 ? geoData.results[0] : null;
};

const resolveLocation = async (lokasi) => {
  let result = await searchLocation(lokasi);
  if (result) return result;

  const bagianLokasi = lokasi.split(',').map(s => s.trim()).filter(Boolean);
  for (const bagian of bagianLokasi) {
    result = await searchLocation(bagian);
    if (result) return result;
  }

  return null;
};

exports.getByTambak = async (req, res) => {
  try {
    const tambak = await tambakModel.findById(req.params.tambak_id);
    if (!tambak) return res.status(404).json({ message: 'Tambak tidak ditemukan' });
    if (tambak.nelayan_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    if (!tambak.lokasi) {
      return res.status(400).json({ message: 'Tambak belum memiliki data lokasi' });
    }

    const lokasiDitemukan = await resolveLocation(tambak.lokasi);

    if (!lokasiDitemukan) {
      return res.status(404).json({
        message: `Lokasi "${tambak.lokasi}" tidak ditemukan di layanan cuaca. Coba isi lokasi dengan nama kota/kabupaten yang lebih spesifik.`
      });
    }

    const { latitude, longitude, name } = lokasiDitemukan;

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=Asia%2FJakarta&forecast_days=3`
    );
    const weatherData = await weatherRes.json();

    const current = weatherData.current;
    const currentInfo = getWeatherInfo(current.weather_code);

    const forecast = weatherData.daily.time.map((tanggal, i) => {
      const info = getWeatherInfo(weatherData.daily.weather_code[i]);
      return {
        tanggal,
        kondisi: info.label,
        icon: info.icon,
        suhu_max: weatherData.daily.temperature_2m_max[i],
        suhu_min: weatherData.daily.temperature_2m_min[i],
        curah_hujan: weatherData.daily.precipitation_sum[i]
      };
    });

    res.json({
      lokasi: name,
      saat_ini: {
        suhu: current.temperature_2m,
        kelembapan: current.relative_humidity_2m,
        curah_hujan: current.precipitation,
        kecepatan_angin: current.wind_speed_10m,
        kondisi: currentInfo.label,
        icon: currentInfo.icon
      },
      prakiraan_3_hari: forecast
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data cuaca', error: err.message });
  }
};