import { Router } from "express";
import { QueueController } from "../controllers/queue.controller";

const router = Router();
const queueController = new QueueController();

// Join queue
router.post(
  "/:companyId/join",
  queueController.joinQueue.bind(queueController)
);

// Get user's position in queue
router.get(
  "/:companyId/position/:userId",
  queueController.getPosition.bind(queueController)
);

// Get queue status
router.get(
  "/:companyId/status",
  queueController.getQueueStatus.bind(queueController)
);

// Serve next customer (admin)
router.post(
  "/:companyId/next",
  queueController.nextCustomer.bind(queueController)
);

// Leave queue
router.post(
  "/:companyId/leave/:userId",
  queueController.leaveQueue.bind(queueController)
);

// Get queue list
router.get(
  "/:companyId/list",
  queueController.getQueueList.bind(queueController)
);

export default router;
