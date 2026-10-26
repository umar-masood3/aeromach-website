import { describe, it, expect } from 'vitest';
import { printify, CreatePrintifyOrderPayload } from '../../lib/printify';

describe('Unit Tests: Printify API Client & Schema Conformance', () => {
  it('correctly reports configuration status based on environment', () => {
    // In dev / test, credentials are placeholder
    expect(typeof printify.isConfigured()).toBe('boolean');
  });

  it('retrieves shops list conforming to Printify schema', async () => {
    const shops = await printify.getShops();
    expect(Array.isArray(shops)).toBe(true);
    expect(shops.length).toBeGreaterThan(0);
    expect(shops[0]).toHaveProperty('id');
    expect(shops[0]).toHaveProperty('title');
  });

  it('constructs and submits valid Printify order payload', async () => {
    const payload: CreatePrintifyOrderPayload = {
      external_id: 'AM-TEST-7788',
      label: 'Aeromach Test Order',
      line_items: [
        {
          variant_id: 12002, // Bella+Canvas 3001 Medium
          quantity: 1,
        },
      ],
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: {
        first_name: 'Satish',
        last_name: 'Dhawan',
        email: 'dhawan@isro.aero',
        phone: '+919876543210',
        country: 'IN',
        region: 'Karnataka',
        address1: 'Department of Aerospace Engineering, IISc',
        city: 'Bengaluru',
        zip: '560012',
      },
    };

    const response = await printify.createOrder(payload);

    expect(response).toBeDefined();
    expect(response.id).toBeTruthy();
    expect(response.status).toBeTruthy();
    expect(response.line_items.length).toBe(1);
    expect(response.line_items[0].variant_id).toBe(12002);
  });

  it('retrieves order details with tracking and shipment structure', async () => {
    const order = await printify.getOrder('pf_ord_mock_123');
    expect(order).toBeDefined();
    expect(order.id).toBe('pf_ord_mock_123');
    expect(order.status).toBe('in_production');
    expect(order.shipments).toBeDefined();
  });
});
