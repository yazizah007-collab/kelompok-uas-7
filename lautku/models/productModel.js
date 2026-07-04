const db = require('../config/db');

const productModel = {
  findAll: async (filter = {}) => {
    let ref = db.collection('produk');
    if (filter.kategori_id) ref = ref.where('kategori_id', '==', filter.kategori_id);
    if (filter.status) ref = ref.where('status', '==', filter.status);
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('produk').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  findByNelayan: async (nelayan_id) => {
    const snapshot = await db.collection('produk')
      .where('nelayan_id', '==', nelayan_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  create: async (data) => {
    const ref = await db.collection('produk').add({
      ...data,
      status: 'tersedia',
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('produk').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('produk').doc(id).delete();
  }
};

module.exports = productModel;