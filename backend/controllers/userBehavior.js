import UserActivity from "../models/userActivities.js"

/**
 * 
 * @param {Object} req The request
 * @param {Object} res The response
 * @param {Function} next The next Function 
 * @returns 
 */
export const getPopularity = async(req, res, next) => {
  let endDate = req?.endDate;
  let match;

  if (endDate) {
    match = {date: {$gte: new Date(new Date() - endDate)}};
  } else {
    match = {date: {$gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)}}// Filter activities within the last week
  }
  try {
    const rankPopularity = await UserActivity.aggregate([{
      $match: { ...match 
            // date: {
            //   $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) // Filter activities within the last week
            // }
      }
    },{
      $group: {
        _id: "$activityType",
        totalInteractions: { $sum: 1 }
    }
    },{
      $sort: { totalInteractions: -1 }
    }
  ]);

  if (!rankPopularity) {
    return res.status(400).json({
      message: "We could not find event insights",
    });
  }
  res.status(200).json({
    message: "event popularity",
    rankPopularity
  })
  } catch (error) {
    next(error);
  }
}
/**
 * 
 * @param {Object} req The request
 * @param {Object} res The response
 * @param {Function} next The next Function
 */


/** 
 * 
 * //want to rank event popularity by categoty here 
 * ?
 * ?
 */
export const getPopularityByCategory = async(req, res, next) => {
  let endDate = req?.endDate;
  let match;

  if (endDate) {
    match = {date: {$gte: new Date(new Date() - endDate)}};
  } else {
    match = {date: {$gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)}}// Filter activities within the last week
  }
  try {
    const rankPopularity = await UserActivity.aggregate([{
      $match: { ...match
        // date: {
        //   $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) // Filter activities within the last week
        // }
      }
    },{
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category"
      }
    },{
      $unwind: "$category"
    },{
      $group: {
        _id: "$category.name",
        totalInteractions: { $sum: 1 }
      }
    },{
      $sort: { totalInteractions: -1 }
    }
  ]);

  if (!rankPopularity) {
    return res.status(400).json({
      message: "We could not find event insights",
    });
  }
  res.status(200).json({
    message: "event popularity",
    rankPopularity
  })
  } catch (error) {
    next(error);
  }
}

export const generateUserBehaviorReport = async(req, res, next) => {
  let startDate = req?.startDate;
  let endDate = req?.endDate;
  let eventId = req?.eventId;
  let userid = req?.userid;
  let match;

  if (startDate && endDate && eventId && userid) {
    match = {date: {$gte: new Date(startDate - endDate)}};
  } else {
    match = {date: {$gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)}}// Filter activities within the last week
  }

  try {

    // Generate report using MongoDB aggregate pipeline
    const report = await UserActivity.aggregate([
      {
        $group: {
          _id: null,
          totalAttendees: { $sum: { $cond: [{ $eq: ['$activityType', 'attendEvent'] }, 1, 0] } },
          totalInteractions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalAttendees: 1,
          totalInteractions: 1,
          averageEngagementRate: { $divide: ['$totalInteractions', '$totalAttendees'] }
        }
      }
    ]).toArray();

    console.log("report>>>>>>>>>>: ", report);
    res.status(200).json(report[0]);
  } catch (error) {
    next(error);
  }

}