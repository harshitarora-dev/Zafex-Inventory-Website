import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import adminRouter from "./admin";
import adminProductsRouter from "./admin-products";
import adminHomepageRouter from "./admin-homepage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(adminRouter);
router.use(adminProductsRouter);
router.use(adminHomepageRouter);

export default router;
