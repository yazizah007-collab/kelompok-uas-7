const db = require('../config/db');

const userModel = {
  findByEmail: async (email) => {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  findById: async (id) => {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('users').add({
      ...data,
      status: 'aktif',
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('users').doc(id).update(data);
  },

  delete: async (id) => {
    await db.collection('users').doc(id).delete();
  },

  findAll: async () => {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  suspend: async (id, status) => {
    await db.collection('users').doc(id).update({ status });
  }
};

module.exports = userModel;