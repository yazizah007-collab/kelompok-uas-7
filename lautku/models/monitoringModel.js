const db = require('../config/db');

const monitoringModel = {
  findByTambak: async (tambak_id) => {
    const snapshot = await db.collection('monitoring_air')
      .where('tambak_id', '==', tambak_id)
      .orderBy('tanggal', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('monitoring_air').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('monitoring_air').add({
      ...data,
      tanggal: new Date().toISOString()
    });
    return ref.id;
  },

  delete: async (id) => {
    await db.collection('monitoring_air').doc(id).delete();
  }
};

module.exports = monitoringModel;