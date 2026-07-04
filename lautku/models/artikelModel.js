const db = require('../config/db');

const artikelModel = {
  findAll: async (status = null) => {
    let ref = db.collection('artikel');
    if (status) ref = ref.where('status', '==', status);
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('artikel').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('artikel').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('artikel').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('artikel').doc(id).delete();
  }
};

module.exports = artikelModel;