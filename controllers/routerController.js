import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";

import mongoose from "mongoose";

// to add new router --
export const addRouter = async (req, res) => {
  const session = await mongoose.startSession(); 

  try {
    session.startTransaction(); 

    const user = req.user;
    const { dns, port, userName, password, hotspot, deviceName, callerId } = req.body;

    let router = await routerModel.findOne({ dns, port }).session(session);

    // if no exixting router, create one 
    if (!router) {
      const newRouter = new routerModel({
        dns,
        port,
        userName,
        password,
        hotspot,
        deviceName,
        callerId,
        userId: user._id
      });
      router = await newRouter.save({ session });
    }

    const existingUserRouter = await userRouterModel.findOne({
      routerId: router._id,
      userId: user._id
    }).session(session);

    if (existingUserRouter) {
      await session.abortTransaction(); 
      return res.status(409).json({ message: "Router already linked to user." });
    }

    await userRouterModel.create(
      [{ userId: user._id, routerId: router._id }],
      { session }
    );

    await session.commitTransaction(); 

    return res.status(201).json({ message: "Router added successfully" });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding router:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  } finally{
    session.endSession();
  }
};


// to get all routers of a user --
export const getUserRouters = async (req, res) => {

  /*
  find all the routers added by user from userRouter collection
  if empty return as empty message
  if found we will get, an array of object with object.routerId
  now aggregate and join this with the routers collections and get the details into it
  return the joined data 
  */
 try {
  const user = req.user



      // return res
      //   .status(404)
      //   .json({ message: "No routers found for this user" });

    // return res.status(200).json(userWithRouters.routers);
  } catch (error) {
    console.error("Error fetching routers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// to delete a router
// export const deleteOneRouter = async (req, res) => {
//   const authResult = await authenticateUser(req, res);
//   if (authResult.status !== 200) {
//     return res.status(authResult.status).json(authResult.response);
//   }

//   const { user } = authResult;
//   const { routerId } = req.params;

//   try {
//     const routerObjectId = mongoose.Types.ObjectId.createFromHexString(routerId)
//     const updatedUser = await userModel.findByIdAndUpdate(
//       user._id,
//       {
//         $pull: { routers: { router: routerObjectId } },
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const routerExists = updatedUser.routers.some(
//       (r) => r.router.toString() === routerId
//     );
//     if (routerExists) {
//       return res
//         .status(404)
//         .json({ message: "Router not found or not deleted" });
//     }

//     return res.status(200).json({ message: "Router deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting router:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
