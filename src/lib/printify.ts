/**
 * Aeromach Printify API Client
 * Conforms strictly to official Printify REST API v1 (https://developers.printify.com/)
 */

export interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyOrderLineItem {
  product_id?: string;
  variant_id: number;
  quantity: number;
  print_provider_id?: number;
  blueprint_id?: number;
}

export interface CreatePrintifyOrderPayload {
  external_id: string;
  label?: string;
  line_items: PrintifyOrderLineItem[];
  shipping_method?: number; // 1 = Standard, 2 = Express
  send_shipping_notification?: boolean;
  address_to: PrintifyAddress;
}

export interface PrintifyOrderResponse {
  id: string;
  address_to: PrintifyAddress;
  line_items: Array<{
    id: string;
    product_id: string;
    variant_id: number;
    quantity: number;
    status: string;
    cost?: number;
  }>;
  status: string; // "pending", "payment_not_received", "processing", "on_hold", "fulfilled"
  total_price: number;
  total_shipping: number;
  total_tax: number;
  created_at: string;
  shipments?: Array<{
    carrier: string;
    number: string;
    url: string;
    delivered_at?: string;
  }>;
}

class PrintifyClient {
  private apiToken: string | undefined;
  private shopId: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.PRINTIFY_API_TOKEN;
    this.shopId = process.env.PRINTIFY_SHOP_ID;
    this.baseUrl = (process.env.PRINTIFY_API_BASE_URL || 'https://api.printify.com/v1').replace(/\/$/, '');
  }

  public isConfigured(): boolean {
    return (
      Boolean(this.apiToken) &&
      this.apiToken !== 'your_printify_personal_access_token' &&
      this.apiToken !== 'printify_token_placeholder' &&
      Boolean(this.shopId) &&
      this.shopId !== 'your_printify_shop_id' &&
      this.shopId !== 'printify_shop_placeholder'
    );
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 2): Promise<T> {
    if (!this.isConfigured()) {
      return this.handleMockRequest<T>(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
      'User-Agent': 'Aeromach-Storefront/1.0',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 429 && retries > 0) {
        // Rate limited - exponential backoff
        const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = errorText;
        try {
          parsedError = JSON.parse(errorText);
        } catch {
          // keep as text
        }
        throw new Error(
          `Printify API error [${response.status}] ${response.statusText}: ${JSON.stringify(parsedError)}`
        );
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (retries > 0 && error.name === 'FetchError') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Mock fallback when live credentials are not configured
   */
  private async handleMockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (endpoint.includes('/shops.json')) {
      return [
        {
          id: 998877,
          title: 'Aeromach Test Shop (Sandbox Adapter)',
          sales_channel: 'custom_integration',
        },
      ] as unknown as T;
    }

    if (endpoint.includes('/orders.json') && options.method === 'POST') {
      const body: CreatePrintifyOrderPayload = JSON.parse((options.body as string) || '{}');
      const mockOrderId = `pf_ord_${Math.random().toString(36).substring(2, 10)}`;

      const mockResponse: PrintifyOrderResponse = {
        id: mockOrderId,
        address_to: body.address_to,
        line_items: body.line_items.map((item, idx) => ({
          id: `line_${idx}_${item.variant_id}`,
          product_id: item.product_id || 'pf_prod_mock',
          variant_id: item.variant_id,
          quantity: item.quantity,
          status: 'pending',
          cost: 850,
        })),
        status: 'pending',
        total_price: 1499,
        total_shipping: 150,
        total_tax: 270,
        created_at: new Date().toISOString(),
        shipments: [],
      };
      return mockResponse as unknown as T;
    }

    if (endpoint.includes('/send_to_production.json')) {
      return { status: 'in_production', message: 'Sent to production (Sandbox Mock)' } as unknown as T;
    }

    if (endpoint.includes('/orders/') && !options.method) {
      // Order status lookup
      const orderIdMatch = endpoint.match(/\/orders\/([^/]+)\.json/);
      const orderId = orderIdMatch ? orderIdMatch[1] : 'mock_order';
      return {
        id: orderId,
        status: 'in_production',
        total_price: 1499,
        total_shipping: 150,
        total_tax: 270,
        created_at: new Date().toISOString(),
        shipments: [
          {
            carrier: 'BlueDart / FedEx Express',
            number: 'BD-8849201948',
            url: 'https://track.bluedart.com/track?ref=BD-8849201948',
          },
        ],
      } as unknown as T;
    }

    if (endpoint.includes('/products.json')) {
      return { current_page: 1, data: [] } as unknown as T;
    }

    return {} as unknown as T;
  }

  // --- Public Provider Operations ---

  public async getShops(): Promise<PrintifyShop[]> {
    return this.request<PrintifyShop[]>('/shops.json');
  }

  public async createOrder(payload: CreatePrintifyOrderPayload): Promise<PrintifyOrderResponse> {
    const shop = this.shopId || 'mock_shop';
    return this.request<PrintifyOrderResponse>(`/shops/${shop}/orders.json`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async sendToProduction(printifyOrderId: string): Promise<any> {
    const shop = this.shopId || 'mock_shop';
    return this.request<any>(`/shops/${shop}/orders/${printifyOrderId}/send_to_production.json`, {
      method: 'POST',
    });
  }

  public async getOrder(printifyOrderId: string): Promise<PrintifyOrderResponse> {
    const shop = this.shopId || 'mock_shop';
    return this.request<PrintifyOrderResponse>(`/shops/${shop}/orders/${printifyOrderId}.json`);
  }

  public async calculateShipping(address: Partial<PrintifyAddress>, lineItems: PrintifyOrderLineItem[]): Promise<any> {
    const shop = this.shopId || 'mock_shop';
    return this.request<any>(`/shops/${shop}/orders/calculate_shipping.json`, {
      method: 'POST',
      body: JSON.stringify({
        address_to: address,
        line_items: lineItems,
      }),
    });
  }
}

export const printify = new PrintifyClient();
