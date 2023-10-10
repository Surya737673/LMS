import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/cathAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import NotificationModel from "../models/notificationModel";
import cron from "node-cron"

// get all notifications
export const getNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        created: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// update notification status
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if(!notification){
          return next(new ErrorHandler("Notification not found", 400))
      }else{
        notification.status ? (notification.status = "read") : notification?.status
      }

      await notification.save()

      const notifications = await NotificationModel.find().sort({createdAt: -1});

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);


// delete notificatiion --only admin
cron.schedule("0 0 0 * * *", async() => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({status:"read", createdAt: {$lt: thirtyDaysAgo}});
  console.log("deleted read notifications")
})
