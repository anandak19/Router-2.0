import routerModel from "../models/router.model.js";


export const validateNewRouterData = (req, res, next) => {
  try {
    const { dns, port, userName, password, hotspot, deviceName } = req.body;

    if (!dns || !port || !userName || !password || !hotspot || !deviceName) {
      return res.status(400).json({ error: "All fields are required." });
    } 

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const varifyRouter = async (req, res, next) => {
  try {
    const { routerId } = req.params;

    if (!routerId) {
      return res.status(404).json({ message: "Please provide router" });
    }

    const router = await routerModel.findById(routerId);
    if (!router) {
      return res.status(404).json({ message: "Router not found" });
    }

    req.router = router;
    next();

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const validateNewVocherData = (req, res, next) => {
  try {
    const { couponNumber, profile, phoneNumber } = req.body;

    if (!couponNumber) {
      return res.status(400).json({ error: "Coupon number is needed" });
    }

    const profileRegex = /^(?:[1-9]|[12][0-9]|30)-D$/;
    if (
      !profile ||
      typeof profile !== "string" ||
      !profileRegex.test(profile)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid profile. It must be in the format 'X-D' where X is between 1 and 30.",
        });
    }

    if (phoneNumber) {
      const dubaiPhoneRegex = /^\d{9,15}$/;
      if (!dubaiPhoneRegex.test(phoneNumber)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
