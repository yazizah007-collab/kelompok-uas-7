const db = require('../config/db');

const panenModel = {
  findByTambak: async (tambak_id) => {
    const snapshot = await db.collection('siklus_panen')
      .where('tambak_id', '==', tambak_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('siklus_panen').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('siklus_panen').add({
      ...data,
      status: 'berlangsung',
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('siklus_panen').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('siklus_panen').doc(id).delete();
  }
};

module.exports = panenModel;