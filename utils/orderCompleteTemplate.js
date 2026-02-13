module.exports = (order) => `
  <h2>Hi ${order.customer.name || "Customer"},</h2>
  <p>Your order with ID <strong>${order._id}</strong> has been placed successfully.</p>
  <p>Total Amount: ₹${order.totalAmount}</p>
  <p>Thank you for shopping with us!</p>
`;
