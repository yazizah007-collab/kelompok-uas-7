const db = require('../config/db');

const kategoriModel = {
  findAll: async () => {
    const snapshot = await db.collection('kategori').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('kategori').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('kategori').add(data);
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('kategori').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('kategori').doc(id).delete();
  }
};

module.exports = kategoriModel;