

export const validateNewRouterData = (req, res, next) => {
  try {
    const { dns, port, userName, password, hotspot, deviceName } =
      req.body;

      if (!dns || !port || !userName || !password || !hotspot || !deviceName) {
        return res.status(400).json({ error: "All fields are required." });
      }

      next()

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal server error." });
  }
};


