import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resetMasterRouter from "./resetMaster";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resetMasterRouter);

export default router;
