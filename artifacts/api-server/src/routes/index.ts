import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import socialAccountsRouter from "./social-accounts";
import automationsRouter from "./automations";
import aiRouter from "./ai";
import agentAppsRouter from "./agent-apps";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/social-accounts", socialAccountsRouter);
router.use("/automations", automationsRouter);
router.use("/ai", aiRouter);
router.use("/agent-apps", agentAppsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);

export default router;
