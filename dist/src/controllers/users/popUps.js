"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePopUpsForPage = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const getActivePopUpsForPage = async (req, res) => {
    const pageName = req.params.pageId;
    const [page] = await db_1.db
        .select()
        .from(schema_1.appPages)
        .where((0, drizzle_orm_1.eq)(schema_1.appPages.name, pageName));
    if (!page)
        throw new Errors_1.NotFound("Page not found");
    const results = await db_1.db
        .select()
        .from(schema_1.popUpsImages)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.popUpsPages.pageId, page.id), (0, drizzle_orm_1.eq)(schema_1.popUpsImages.status, "active")));
    (0, response_1.SuccessResponse)(res, { popups: results }, 200);
};
exports.getActivePopUpsForPage = getActivePopUpsForPage;
