/**
 * @module controllers/userAnalytics
 * @requires UserActivity
 * @requires UserDemographics
 * @requires Event
 * @exports getUserJourney
 * @exports getUserDemographics
 * @exports getUserRetention
 * @exports getConversionRate
 * @exports getUserRegistrationRate
 * @exports indexPageVisit
 * @exports getEventConversionRate
 * @exports getEventVisits
 * @description This is the user analytics controller.
 */
import UserActivity from "../models/userActivities.js";
import UserDemographics from "../models/userDemographics.js";
import Event from "../models/events.js";

/**
 * @function getUserJourney
 * @description This function gets the user journey.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Object} The user journey.
 * @throws {Object} The error object.
 */
export const getUserJourney = async (req, res, next) => {
  try {
    const userJourney = await UserActivity.find({ user: req.body.user })
      .populate("user")
      .sort({ timestamp: -1 });
    if (!userJourney) {
      return next({
        message: "No user journey found",
        statusCode: 404,
      });
    }
    res.status(200).json({
      success: true,
      data: userJourney,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getUserDemographics
 * @description This function gets the user demographics.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Object} The user demographics.
 * @throws {Object} The error object.
 */
export const getUserDemographics = async (req, res, next) => {
  try {
    const userDemographics = await UserDemographics.findOne({
      user: req.body.user,
    }).populate("user");
    if (!userDemographics) {
      return next({
        message: "No user demographics found",
        statusCode: 404,
      });
    }
    res.status(200).json({
      success: true,
      data: userDemographics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getUserRetention
 * @description This function gets the user retention.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Number} The user retention.
 * @throws {Object} The error object.
 */
export const getUserRetention = async (req, res, next) => {
  const query = req.query;
  const startDate = query?.startDate;
  const endDate = query?.endDate;
  let match;
  if (startDate) {
    match = {
      activityType: "visit",
      timestamp: {
        $gte: new Date(startDate),
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };
  } else {
    match = {
      activityType: "visit",
    };
  }
  try {
    const users = await UserActivity.aggregate([
      { $match: { ...match } },
      {
        $group: { _id: "$user", visits: { $push: "$activityData.timestamp" } },
      },
      { $project: { user: "$_id", numberOfVisits: { $size: "$visits" } } },
    ]);
    const retention =
      users.filter((user) => user.numberOfVisits > 1).length / users.length;
    res.status(200).json({
      success: true,
      data: retention,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getConversionRate
 * @description This function gets the conversions.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Number} The conversions.
 * @throws {Object} The error object.
 */
export const getConversionRate = async (req, res, next) => {
  const query = req.query;
  const startDate = query?.startDate;
  const endDate = query?.endDate;
  let match;
  if (startDate) {
    match = {
      activityType: "ticketPurchase",
      timestamp: {
        $gte: new Date(startDate),
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };
  } else {
    match = {
      activityType: "ticketPurchase",
    };
  }
  try {
    const conversions = await UserActivity.find({
      ...match,
    }).countDocuments();
    const totalVisits = await UserActivity.find({
      ...match,
      activityType: "visit",
    }).countDocuments();
    res.status(200).json({
      success: true,
      data: conversions / totalVisits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function indexPageVisit
 * @description This function indexes the page visit.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Object} Acknowledgement of the page visit indexing.
 */
export const indexPageVisit = async (req, res, next) => {
  try {
    await UserActivity.create({
      activityType: "visit",
      activityData: JSON.stringify({ page: req.body.page }),
      user: req.body.user,
    });
    res.status(200).json({
      success: true,
      message: "Page visit indexed",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getUserRegistrationRate
 * @description This function gets the user registration rate.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Number} The user registration rate.
 * @throws {Object} The error object.
 */
export const getUserRegistrationRate = async (req, res, next) => {
  const query = req.query;
  const startDate = query?.startDate;
  const endDate = query?.endDate;
  let match;
  if (startDate) {
    match = {
      activityType: "userRegistered",
      timestamp: {
        $gte: new Date(startDate),
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };
  } else {
    match = {
      activityType: "userRegistered",
    };
  }
  try {
    const registrations = await UserActivity.find({
      ...match,
    }).countDocuments();
    const totalVisits = await UserActivity.find({
      ...match,
      activityType: "visit",
    }).countDocuments();
    res.status(200).json({
      success: true,
      data: registrations / totalVisits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getEventVisits
 * @description This function gets the event visits.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware.
 * @returns {Number} The event visits per specified period or all the event visits.
 */
export const getEventVisits = async (req, res, next) => {
  const query = req.query;
  const startDate = query?.startDate;
  const endDate = query?.endDate;
  try {
    let match;
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      next({
        message: "The requested event does not exist",
        statusCode: 404,
      });
      return;
    }
    if (startDate) {
      match = {
        activityType: "eventVisit",
        eventData: JSON.stringify(event),
        timestamp: {
          $gte: new Date(startDate),
          $lte: endDate ? new Date(endDate) : new Date(),
        },
      };
    } else {
      match = {
        activityType: "eventVisit",
        eventData: JSON.stringify(event),
      };
    }
    const eventVisits = await UserActivity.find({
      ...match,
    }).countDocuments();
    res.status(200).json({
      success: true,
      data: {
        event: event,
        visits: eventVisits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function getEventConversionRate
 * @description This function gets the event conversion rate.
 * @param {Object} req - The request.
 * @param {Object} res - The response.
 * @param {Function} next - The next middleware function.
 * @returns {Number} The event conversion rate.
 */
export const getEventConversionRate = async (req, res, next) => {
  const query = req.query;
  const startDate = query?.startDate;
  const endDate = query?.endDate;
  try {
    let match;
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      next({
        message: "The requested event does not exist",
        statusCode: 404,
      });
      return;
    }
    if (startDate) {
      match = {
        activityType: "ticketPurchase",
        eventData: JSON.stringify(event),
        timestamp: {
          $gte: new Date(startDate),
          $lte: endDate ? new Date(endDate) : new Date(),
        },
      };
    } else {
      match = {
        activityType: "ticketPurchase",
        eventData: JSON.stringify(event),
      };
    }
    const eventVisits = await UserActivity.find({
      ...match,
      eventType: "eventVisit",
    }).countDocuments();
    const eventConversions = await UserActivity.find({
      ...match,
    }).countDocuments();
    const eventConversionRate = eventConversions / eventVisits;
    res.status(200).json({
      success: true,
      data: {
        event: event,
        conversionRate: eventConversionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};
