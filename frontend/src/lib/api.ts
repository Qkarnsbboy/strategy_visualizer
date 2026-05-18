export const API_BASE = "http://localhost:8000";

export type OptionType = "call" | "put";

export interface PriceRequest {
  spot: number;
  strike: number;
  time: number;
  vol: number;
  rate: number;
  option_type: OptionType;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface PriceResponse {
  price: number;
  greeks: Greeks;
}

export interface Leg {
  option_type: OptionType;
  strike: number;
  quantity: number;
  premium: number;
}

export interface StrategyRequest {
  legs: Leg[];
  spot_min: number;
  spot_max: number;
  steps: number;
}

export interface PayoffPoint {
  spot: number;
  pnl: number;
}

export interface StrategyResponse {
  points: PayoffPoint[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export function postPrice(req: PriceRequest): Promise<PriceResponse> {
  return request<PriceResponse>("/api/price", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function postStrategy(req: StrategyRequest): Promise<StrategyResponse> {
  return request<StrategyResponse>("/api/strategy", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/api/health");
}
