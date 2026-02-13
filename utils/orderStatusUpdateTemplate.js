// utils/orderStatusUpdateTemplate.js
module.exports = (order) => `
  <h2>Hi ${order.user.name},</h2>
  <p>Your order with ID <strong>${order._id}</strong> status has been updated to <strong>${order.orderStatus}</strong>.</p>
  <p>Thank you for shopping with us!</p>
`;
