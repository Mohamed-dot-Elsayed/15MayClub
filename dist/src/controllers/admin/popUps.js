"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppPage = exports.updateAppPage = exports.createAppPage = exports.getAppPageById = exports.getAllAppPages = exports.deletePopUp = exports.updatePopUp = exports.getPopUpById = exports.getAllPopUps = exports.createPopUp = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const handleImages_1 = require("../../utils/handleImages");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const deleteImage_1 = require("../../utils/deleteImage");
const createPopUp = async (req, res) => {
    let { title, imagePath, startDate, endDate, status = "active", pageIds, } = req.body;
    const id = (0, uuid_1.v4)();
    imagePath = await (0, handleImages_1.saveBase64Image)(imagePath, id, req, "popups");
    await db_1.db.transaction(async (tx) => {
        await tx.insert(schema_1.popUpsImages).values({
            id,
            title,
            imagePath,
            startDate,
            endDate,
            status,
            createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
        });
        await tx.insert(schema_1.popUpsPages).values(pageIds.map((pageId) => ({
            id: (0, uuid_1.v4)(),
            imageId: id,
            pageId,
        })));
    });
    (0, response_1.SuccessResponse)(res, { message: "Popup created successfully" }, 201);
};
exports.createPopUp = createPopUp;
const getAllPopUps = async (_req, res) => {
    const result = await db_1.db
        .select()
        .from(schema_1.popUpsImages)
        .orderBy(schema_1.popUpsImages.createdAt);
    const formatted = result.map((popup) => ({
        ...popup,
        startDate: popup.startDate
            ? new Date(popup.startDate).toISOString().slice(0, 10)
            : null,
        endDate: popup.endDate
            ? new Date(popup.endDate).toISOString().slice(0, 10)
            : null,
    }));
    (0, response_1.SuccessResponse)(res, { popups: formatted }, 200);
};
exports.getAllPopUps = getAllPopUps;
const getPopUpById = async (req, res) => {
    const id = req.params.id;
    const [popup] = await db_1.db
        .select()
        .from(schema_1.popUpsImages)
        .where((0, drizzle_orm_1.eq)(schema_1.popUpsImages.id, id));
    if (!popup)
        throw new Errors_1.NotFound("Popup not found");
    const pages = await db_1.db
        .select({
        pageName: schema_1.appPages.name,
        pageId: schema_1.appPages.id,
    })
        .from(schema_1.popUpsPages)
        .where((0, drizzle_orm_1.eq)(schema_1.popUpsPages.imageId, id))
        .leftJoin(schema_1.appPages, (0, drizzle_orm_1.eq)(schema_1.appPages.id, schema_1.popUpsPages.pageId));
    const formattedPopup = {
        ...popup,
        startDate: popup.startDate
            ? new Date(popup.startDate).toISOString().slice(0, 10)
            : null,
        endDate: popup.endDate
            ? new Date(popup.endDate).toISOString().slice(0, 10)
            : null,
    };
    (0, response_1.SuccessResponse)(res, { popup: { ...formattedPopup, pages } }, 200);
};
exports.getPopUpById = getPopUpById;
const updatePopUp = async (req, res) => {
    let { title, imagePath, startDate, endDate, status = "active", pageIds, } = req.body;
    const id = req.params.id;
    const [pop] = await db_1.db
        .select()
        .from(schema_1.popUpsImages)
        .where((0, drizzle_orm_1.eq)(schema_1.popUpsImages.id, id));
    if (!pop)
        throw new Errors_1.NotFound("popup not found");
    const data = req.body;
    await db_1.db.transaction(async (tx) => {
        if (Object.keys(data).length > 0) {
            if (imagePath) {
                await (0, deleteImage_1.deletePhotoFromServer)(new URL(pop.imagePath).pathname);
                imagePath = await (0, handleImages_1.saveBase64Image)(imagePath, id, req, "popups");
            }
            await tx
                .update(schema_1.popUpsImages)
                .set({ title, imagePath, startDate, endDate, status })
                .where((0, drizzle_orm_1.eq)(schema_1.popUpsImages.id, id));
            if (pageIds) {
                await tx.delete(schema_1.popUpsPages).where((0, drizzle_orm_1.eq)(schema_1.popUpsPages.imageId, id));
                await tx.insert(schema_1.popUpsPages).values(pageIds.map((pageId) => ({
                    id: (0, uuid_1.v4)(),
                    imageId: id,
                    pageId,
                })));
            }
        }
    });
    (0, response_1.SuccessResponse)(res, { message: "Popup updated successfully" }, 200);
};
exports.updatePopUp = updatePopUp;
const deletePopUp = async (req, res) => {
    const id = req.params.id;
    const [popup] = await db_1.db
        .select()
        .from(schema_1.popUpsImages)
        .where((0, drizzle_orm_1.eq)(schema_1.popUpsImages.id, id));
    if (!popup)
        throw new Errors_1.NotFound("Popup not found");
    await (0, deleteImage_1.deletePhotoFromServer)(new URL(popup.imagePath).pathname);
    await db_1.db.transaction(async (tx) => {
        await tx.delete(schema_1.popUpsImages).where((0, drizzle_orm_1.eq)(schema_1.popUpsImages.id, id));
    });
    (0, response_1.SuccessResponse)(res, { message: "Popup deleted successfully" }, 200);
};
exports.deletePopUp = deletePopUp;
// App Pages
const getAllAppPages = async (req, res) => {
    const Apppages = await db_1.db.select().from(schema_1.appPages).orderBy(schema_1.appPages.createdAt);
    (0, response_1.SuccessResponse)(res, { Apppages }, 200);
};
exports.getAllAppPages = getAllAppPages;
const getAppPageById = async (req, res) => {
    const id = req.params.id;
    const [page] = await db_1.db.select().from(schema_1.appPages).where((0, drizzle_orm_1.eq)(schema_1.appPages.id, id));
    if (!page)
        throw new Errors_1.NotFound("App page not found");
    (0, response_1.SuccessResponse)(res, { page }, 200);
};
exports.getAppPageById = getAppPageById;
const createAppPage = async (req, res) => {
    const { name } = req.body;
    const id = (0, uuid_1.v4)();
    await db_1.db
        .insert(schema_1.appPages)
        .values({
        id,
        name,
        createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    });
    (0, response_1.SuccessResponse)(res, { message: "App page created successfully" }, 201);
};
exports.createAppPage = createAppPage;
const updateAppPage = async (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    await db_1.db.update(schema_1.appPages).set({ name }).where((0, drizzle_orm_1.eq)(schema_1.appPages.id, id));
    (0, response_1.SuccessResponse)(res, { message: "App page updated successfully" }, 200);
};
exports.updateAppPage = updateAppPage;
const deleteAppPage = async (req, res) => {
    const id = req.params.id;
    const [page] = await db_1.db.select().from(schema_1.appPages).where((0, drizzle_orm_1.eq)(schema_1.appPages.id, id));
    if (!page)
        throw new Errors_1.NotFound("App page not found");
    await db_1.db.delete(schema_1.appPages).where((0, drizzle_orm_1.eq)(schema_1.appPages.id, id));
    (0, response_1.SuccessResponse)(res, { message: "App page deleted successfully" }, 200);
};
exports.deleteAppPage = deleteAppPage;
