
/*
period params 
startDate, endDate eg: ?startDate=2024-02-01&endDate=2024-02-10
day, week, thisMonth, lastMonth  eg: ?period=day

*/

export const getStartDateEndDate = async (req, res, next) => {
  try {
    const {
      period,
      startDate: startDateQuery,
      endDate: endDateQuery,
    } = req.query;

    let startDate, endDate;

    const now = new Date();
    let selectedPeriod = "All";

    // if custome date range is provided
    if (startDateQuery && endDateQuery) {
      selectedPeriod = "custom";
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);
      endDate.setUTCHours(23, 59, 59, 999);
    } else if (period) {
      // if no custom date is prodvided
      switch (period) {
        case "day":
          selectedPeriod = "today";
          startDate = new Date();
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "week":
          selectedPeriod = "This week";
          startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date(now.setDate(now.getDate() + (6 - now.getDay()))); // End of the week (Saturday)
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "thisMonth":
          selectedPeriod = "This month";
          startDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
          );
          endDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)
          );
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "lastMonth":
          selectedPeriod = "Last month";
          startDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
          );
          endDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)
          );
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        default:
          return res
            .status(400)
            .json({ error: "Invalid period parameter or missing date range" });
      }
    }

    req.startDate = startDate;
    req.endDate = endDate;
    req.period = selectedPeriod;

    next()
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
