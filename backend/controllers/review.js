/**
 * 
 * @function createReview
 * @description This function create an event review 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method POST /api/v1/reviews
 * @access Public
 * @example http://localhost:5000/api/v1/reviews
 * @example request
 * {
 * "event": "3501b2dae720c575f8e4e8eb",
 * "rating": "5",
 * "comment": "this is dope",
 * "user":"4701b2dae720c575f8e4e8eb"
 * }
 * @example response - 200 OK
 * {
 * "event": "3501b2dae720c575f8e4e8eb",
 * "rating": "5",
 * "comment": "this is dope",
 * "user":"4701b2dae720c575f8e4e8eb"
 * }
 */

import Review from "../models/review.js";

export const createReview = async (req, res, next) => {
  const reviewData = req.body;
  try{
    const review = await Review.create(reviewData);
    if (!review){
      return res.status(400).json({
        message:"failed to create review"
      });
    }
    res.status(200).json({
      message :"successful",
      review
    });
  } catch( error ){
    next(error);
  }
}

/**
 * 
 * @function getReviews
 * @description This function create an event review 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method GET /api/v1/reviews
 * @access Public
 * @example http://localhost:5000/api/v1/reviews
 * @example request
 * { }
 * @example response - 200 OK
 * {
 * "message": "Successful",
 * "feedback": [
 *   {
 *     "_id": "651212ed1cb47fb960ae8b48",
 *     "event": "3501b2dae720c575f8e4e8ed",
 *     "rating": 4,
 *     "comment": "this is dope",
 *     "user": "3501b2dae720c575f8e4e8eb",
 *     "createdAt": "2023-09-25T23:08:29.977Z",
 *     "__v": 0
 *   },
 *   {
 *     "_id": "6512132aac7581454a53c9aa",
 *     "event": "3501b2dae720c575f8e4e8ed",
 *     "rating": 4,
 *     "comment": "this is dope",
 *     "user": "3501b2dae720c575f8e4e8eb",
 *     "createdAt": "2023-09-25T23:09:30.897Z",
 *     "__v": 0
 *   },
 * }
 */

export const getReviews = async (req, res, next) => {
  try {
    const feedback = await Review.find(req.query).exec();
    if (feedback.length > 0) {
      res.status(200).json({ message: "Successful", feedback });
    } else {
      res.status(404).json({ status: 404, message: "No feedback found" });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * 
 * @function getReview
 * @description This function get an event review 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method GET /api/v1/review
 * @access Public
 * @example http://localhost:5000/api/v1/review/3501b2dae720c575f8e4e8ed
 * @example request
 * { }
 * @example response - 200 OK
 * {
 * "message": "Successful",
 * "feedback": [
 *   {
 *     "_id": "651212ed1cb47fb960ae8b48",
 *     "event": "3501b2dae720c575f8e4e8ed",
 *     "rating": 4,
 *     "comment": "this is dope",
 *     "user": "3501b2dae720c575f8e4e8eb",
 *     "createdAt": "2023-09-25T23:08:29.977Z",
 *     "__v": 0
 *   },
 * }
 */
export const getReview = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const review = await Review.findById(eventId).exec();
    if (review) {
      res.status(200).json({
        message: "Successful",
        review,
      });
  } else {
      res.status(404).json({
        message: "Review does not exist",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 
 * @function averageRating
 * @description This function calculate average event reviews 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method GET /api/v1/reviews
 * @access Public
 * @example http://localhost:5000/api/v1/reviews/3501b2dae720c575f8e4e8ed
 * @example request
 * { }
 * @example response - 200 OK
 * {
 * "message": "success",
 * "averageRating": 3.8
}
 */
export const averageRating = async (req, res, next) => {
  const eventId = req.params.id;

  try {
    const reviews = await Review.find({ eventId });

    if (reviews.length === 0) {
      return res.status(404).json({ 
        message: 'No reviews found for this event' ,
      });
    }
    const sumOfRatings = reviews.reduce((total, review) => total + review.rating, 0);
    const averageRating = sumOfRatings / reviews.length;

    return res.status(200).json({ 
      message: "success",
      averageRating 
    });
  } catch(error) {
    next(error);
  }
}