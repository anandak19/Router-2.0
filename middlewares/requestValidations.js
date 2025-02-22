import mongoose from "mongoose";

export const validateObjectId = (req, res, next) => {
    const { id, requestedUserId, routerId } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }

    if (requestedUserId && !mongoose.Types.ObjectId.isValid(requestedUserId)) {
        return res.status(400).json({ error: "Invalid requested user ID format" });
    }

    if (routerId && !mongoose.Types.ObjectId.isValid(routerId)) {
        return res.status(400).json({ error: "Invalid requested router ID format" });
    }
    

    next(); 
};

