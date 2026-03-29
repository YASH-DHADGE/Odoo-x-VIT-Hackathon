"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
exports.buildPaginatedResult = buildPaginatedResult;
function paginate(query) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    return { skip: (page - 1) * limit, take: limit };
}
function buildPaginatedResult(data, total, page, limit) {
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=pagination.util.js.map