const db = require('../config/db');

const orderDetailModel = {
  findByOrder: async (order_id) => {
    const snapshot = await db.collection('order_detail')
      .where('order_id', '==', order_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  create: async (data) => {
    const ref = await db.collection('order_detail').add(data);
    return ref.id;
  },

  createBatch: async (items) => {
    const batch = db.batch();
    items.forEach(item => {
      const ref = db.collection('order_detail').doc();
      batch.set(ref, item);
    });
    await batch.commit();
  }
};

module.exports = orderDetailModel;