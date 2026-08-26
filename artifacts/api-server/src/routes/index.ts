import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import ordersRouter from "./orders";
import paymentRouter from "./payment";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import contactRouter from "./contact";
import adminRouter from "./admin";
import adminProductsRouter from "./admin-products";
import adminOrdersRouter from "./admin-orders";
import adminDashboardRouter from "./admin-dashboard";
import adminHomepageRouter from "./admin-homepage";
import homepageRouter from "./homepage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(ordersRouter);
router.use(paymentRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(contactRouter);
router.use(adminRouter);
router.use(adminProductsRouter);
router.use(adminOrdersRouter);
router.use(adminDashboardRouter);
router.use(adminHomepageRouter);
router.use(homepageRouter);

export default router;
