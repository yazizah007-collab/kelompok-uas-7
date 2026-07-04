const db = require('../config/db');

const keranjangModel = {
  findByPembeli: async (pembeli_id) => {
    const snapshot = await db.collection('keranjang')
      .where('pembeli_id', '==', pembeli_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('keranjang').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  findItem: async (pembeli_id, produk_id) => {
    const snapshot = await db.collection('keranjang')
      .where('pembeli_id', '==', pembeli_id)
      .where('produk_id', '==', produk_id)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('keranjang').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('keranjang').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('keranjang').doc(id).delete();
  },

  deleteByPembeli: async (pembeli_id) => {
    const snapshot = await db.collection('keranjang')
      .where('pembeli_id', '==', pembeli_id)
      .get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
};

module.exports = keranjangModel;