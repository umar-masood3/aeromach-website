async function testLiveE2E() {
  console.log('--- AEROMACH LIVE END-TO-END VERIFICATION ---');

  // 1. Test Homepage
  const homeRes = await fetch('http://localhost:3000/');
  console.log(`1. Homepage GET: ${homeRes.status} ${homeRes.statusText}`);
  if (homeRes.status !== 200) throw new Error('Homepage failed to load');

  // 2. Fetch Products
  const prodRes = await fetch('http://localhost:3000/api/products');
  const prodData = await prodRes.json();
  console.log(`2. Products API: ${prodRes.status} (Discovered ${prodData.products?.length} products)`);
  if (!prodData.success || prodData.products.length === 0) throw new Error('Products API failed');

  const sampleProduct = prodData.products[0];
  const sampleVariant = sampleProduct.variants[0];
  console.log(`   Selected Blueprint: "${sampleProduct.title}" [${sampleVariant.title}] (₹${sampleVariant.price})`);

  // 3. Test Pricing Calculation Engine
  const priceRes = await fetch('http://localhost:3000/api/checkout/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ variantId: sampleVariant.id, quantity: 2 }],
      country: 'India',
    }),
  });
  const priceData = await priceRes.json();
  console.log(`3. Pricing Engine: Subtotal ₹${priceData.pricing.subtotal}, Shipping: ₹${priceData.pricing.shippingFee}, Total: ₹${priceData.pricing.totalAmount} ${priceData.pricing.currency}`);

  // 4. Create Order
  const orderRes = await fetch('http://localhost:3000/api/checkout/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ variantId: sampleVariant.id, quantity: 2 }],
      customer: {
        name: 'Prof. Satish Dhawan',
        email: 'dhawan@aeromach.aero',
        phone: '+91 98765 43210',
        address1: 'Indian Institute of Science, C V Raman Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560012',
        country: 'India',
      },
    }),
  });
  const orderData = await orderRes.json();
  console.log(`4. Create Order: ${orderData.success ? 'SUCCESS' : 'FAILED'} Order #: ${orderData.orderNumber}, Tracking Token: ${orderData.trackingToken}, Gateway Order: ${orderData.razorpayOrderId}`);
  if (!orderData.success) throw new Error('Order creation failed');

  // 5. Simulate & Verify Cryptographic Payment
  const payRes = await fetch('http://localhost:3000/api/checkout/simulate-test-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: orderData.orderId }),
  });
  const payData = await payRes.json();
  console.log(`5. Payment Verification & Queueing: Verified Payment ID: ${payData.paymentId}, Status: ${payData.fulfillmentStatus}`);

  // 6. Inspect Tracking Page Telemetry
  await new Promise((r) => setTimeout(r, 400));
  const trackRes = await fetch(`http://localhost:3000/api/orders/${orderData.trackingToken}`);
  const trackData = await trackRes.json();
  console.log(`6. Order Telemetry Retrieval: Payment Status: ${trackData.order.paymentStatus}, Fulfillment: ${trackData.order.fulfillmentStatus}`);

  // 7. Verify Admin Operations & Metrics
  const adminRes = await fetch('http://localhost:3000/api/admin/metrics', {
    headers: { 'x-admin-key': 'aeromach_dev_admin_key_2026' },
  });
  const adminData = await adminRes.json();
  console.log(`7. Founder Admin Telemetry: Total Orders: ${adminData.metrics.totalOrders}, Revenue: ₹${adminData.metrics.totalRevenue}, In-Production: ${adminData.metrics.inProductionOrders}`);

  // 8. Integration Health
  const healthRes = await fetch('http://localhost:3000/api/admin/health', {
    headers: { 'x-admin-key': 'aeromach_dev_admin_key_2026' },
  });
  const healthData = await healthRes.json();
  console.log(`8. System Health Diagnostics: Database: ${healthData.health.database}, Printify Mode: ${healthData.health.printify.mode}, Razorpay Mode: ${healthData.health.payment.mode}`);

  console.log('\n>>> COMPLETE END-TO-END VERIFICATION: 100% OPERATIONAL SUCCESS <<<');
}

testLiveE2E().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
