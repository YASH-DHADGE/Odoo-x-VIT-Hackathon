export interface PaginationQuery {
    page?: number;
    limit?: number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare function paginate(query: PaginationQuery): {
    skip: number;
    take: number;
};
export declare function buildPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
