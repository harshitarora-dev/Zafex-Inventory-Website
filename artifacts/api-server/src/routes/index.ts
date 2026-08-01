import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import authRouter from "./auth";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import ordersRouter from "./orders";
import paymentRouter from "./payment";
import reviewsRouter from "./reviews";
import contactRouter from "./contact";
import adminRouter from "./admin";
import adminProductsRouter from "./admin-products";
import adminHomepageRouter from "./admin-homepage";
import adminDashboardRouter from "./admin-dashboard";
import adminOrdersRouter from "./admin-orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(authRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(ordersRouter);
router.use(paymentRouter);
router.use(reviewsRouter);
router.use(contactRouter);
router.use(adminRouter);
router.use(adminProductsRouter);
router.use(adminHomepageRouter);
router.use(adminDashboardRouter);
router.use(adminOrdersRouter);

export default router;
