export class VaultSearchDto {
  query: string;
  tenantId?: string;
  language?: string;
  framework?: string;
  cefrLevel?: string;
  resourceId?: string;
  limit?: number;
  rrfK?: number;
  diversifyClusters?: boolean;
}

