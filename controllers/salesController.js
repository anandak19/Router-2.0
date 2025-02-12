import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import voucherModel from "../models/voucher.model.js";


/*
period params 
startDate, endDate eg: ?startDate=2024-02-01&endDate=2024-02-10
day, week, thisMonth, lastMonth  eg: ?period=day

returns: totalVouchers and totalSales in amount
*/

// show vouchers sales under the requested router
export const getSalesByRouter = async (req, res) => {
  const routerId = req.router._id;
  const {
    period,
    startDate: startDateQuery,
    endDate: endDateQuery,
  } = req.query;

  let startDate, endDate;

  try {
    const now = new Date();

    // if custome date range is provided
    if (startDateQuery && endDateQuery) {
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);
      endDate.setUTCHours(23, 59, 59, 999);
    } else {
      // if no custom date is prodvided
      switch (period) {
        case "day":
          startDate = new Date();
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "week":
          startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date(now.setDate(now.getDate() + (6 - now.getDay()))); // End of the week (Saturday)
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the current month
          endDate.setUTCHours(23, 59, 59, 999); // End of the last day of the month
          break;

        case "lastMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        default:
          return res
            .status(400)
            .json({ error: "Invalid period parameter or missing date range" });
      }
    }

    // Debugging logs
    console.log(
      `StartDate: ${startDate.toISOString()}, EndDate: ${endDate.toISOString()}`
    );

    //   pipeline for total Cost
    const totalCostPipeline = [
      {
        $match: {
          routerId: routerId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          totalSales: [
            {
              $group: {
                _id: null,
                totalSalesAmount: { $sum: "$cost" },
              },
            },
          ],
          totalVouchers: [
            {
              $count: "totalVouchers",
            },
          ],
        },
      },
    ];

    // pipline for profile wise count

    const salesData = await voucherModel.aggregate(totalCostPipeline);
    console.log("totalCost", salesData);

    const totalSales =
      salesData[0].totalSales.length > 0
        ? salesData[0].totalSales[0].totalSalesAmount
        : 0;
    const totalVouchers =
      salesData[0].totalVouchers.length > 0
        ? salesData[0].totalVouchers[0].totalVouchers
        : 0;

    return res.status(200).json({
      message: "Sales data fetched successfully.",
      routerId,
      period: period || "custom",
      totalSales,
      totalVouchers,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error("Error adding voucher:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};


//show total vouchers and cost by a user in all router

//show total vouchers and cost by a user in one router only


export const totalSalesByUser = async (req, res) => {
  try {
    const user = req.user




    
  } catch (error) {
    
  }
}