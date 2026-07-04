const db = require('../config/db');

const orderModel = {
  findAll: async () => {
    const snapshot = await db.collection('orders').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findByPembeli: async (pembeli_id) => {
    const snapshot = await db.collection('orders')
      .where('pembeli_id', '==', pembeli_id)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  findByNelayan: async (nelayan_id) => {
    const snapshot = await db.collection('order_detail')
      .where('nelayan_id', '==', nelayan_id)
      .get();
    const orderIds = [...new Set(snapshot.docs.map(doc => doc.data().order_id))];
    const orders = await Promise.all(orderIds.map(id => orderModel.findById(id)));
    return orders.filter(Boolean);
  },

  findById: async (id) => {
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  create: async (data) => {
    const ref = await db.collection('orders').add({
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return ref.id;
  },

  update: async (id, data) => {
    await db.collection('orders').doc(id).update(data);
  }
};

module.exports = orderModel;