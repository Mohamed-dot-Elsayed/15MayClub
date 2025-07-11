"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSliders = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const getActiveSliders = async (req, res) => {
    const data = await db_1.db
        .select()
        .from(schema_1.sliders)
        .where((0, drizzle_orm_1.eq)(schema_1.sliders.status, true))
        .leftJoin(schema_1.sliderImages, (0, drizzle_orm_1.eq)(schema_1.sliderImages.slider_id, schema_1.sliders.id))
        .orderBy(schema_1.sliders.order);
    (0, response_1.SuccessResponse)(res, { sliders: data }, 200);
};
exports.getActiveSliders = getActiveSliders;
