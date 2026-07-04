const db = require('../config/db');

const pengeluaranModel = {
  findByTambak: async (tambak_id) => {
    const snapshot = await db.collection('pengeluaran_tambak')
      .where('tambak_id', '==', tambak_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('pengeluaran_tambak').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('pengeluaran_tambak').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('pengeluaran_tambak').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('pengeluaran_tambak').doc(id).delete();
  },

  findByPeriode: async (tambak_id, dari, sampai) => {
    const snapshot = await db.collection('pengeluaran_tambak')
      .where('tambak_id', '==', tambak_id)
      .where('tanggal', '>=', dari)
      .where('tanggal', '<=', sampai)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = pengeluaranModel;