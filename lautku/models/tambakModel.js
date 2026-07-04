const db = require('../config/db');

const tambakModel = {
  findByNelayan: async (nelayan_id) => {
    const snapshot = await db.collection('tambak')
      .where('nelayan_id', '==', nelayan_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findById: async (id) => {
    const doc = await db.collection('tambak').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('tambak').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('tambak').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('tambak').doc(id).delete();
  }
};

module.exports = tambakModel;