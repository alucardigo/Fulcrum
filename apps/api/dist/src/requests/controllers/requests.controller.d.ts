import { RequestsService } from '../services/requests.service';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    findAll(): any;
    findOne(id: string): any;
}
