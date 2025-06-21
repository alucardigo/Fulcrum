import { Counter, Histogram } from 'prom-client';
export declare class MetricsService {
    private readonly httpRequestDuration;
    private readonly httpRequestsTotal;
    private readonly purchaseRequestsTotal;
    private readonly purchaseRequestsByState;
    constructor(httpRequestDuration: Histogram<string>, httpRequestsTotal: Counter<string>, purchaseRequestsTotal: Counter<string>, purchaseRequestsByState: Counter<string>);
    recordHttpRequest(method: string, path: string, statusCode: number, duration: number): void;
    recordPurchaseRequest(type: 'created' | 'updated' | 'deleted'): void;
    recordPurchaseRequestStateChange(fromState: string, toState: string): void;
}
