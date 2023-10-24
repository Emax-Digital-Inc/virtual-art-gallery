/**
 * @module controllers/venues
 * @requires models/venues
 * @swagger definitions
 * - name: Venue
 *  description: Venue object
 * properties: {
 *  id: {type: String},
 * name: {type: String},
 * address: {type: String},
 * city: {type: String},
 * state: {type: String},
 * locationLat: {type: String},
 * locationLon: {type: String},
 * capacity: {type: Number},
 * availability: {type: String},
 * facilities: {type: String},
 * }
 * required: [id, name, address, city, state, locationLat, locationLon, capacity, availability, facilityType]
 * example: {
 * id: "5f7f5c5f4f1d9e2b7c9d4f1d",
 * name: "The Venue",
 * address: "123 Main St",
 * city: "New York",
 * state: "NY",
 * locationLat: "40.7128",
 * locationLon: "74.0060",
 * capacity: 100,
 * availability: "available",
 * facilities: "Bathroom, Kitchen, Parking",
 * }
 * @method GET /venues
 * @method GET /venues/:id
 * @method POST /venues
 * @method PATCH /venues/:id
 * @method DELETE /venues/:id
 */
import Venue from "../models/venues.js";

/**
 * @function getVenues
 * @description Get all venues
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Array of venues
 * @throws Will throw an error if one of the required fields is missing
 *
 * @method GET /venues
 * @example const response = await axios.get("/api/v1/venues")
 * @example response.status => 200
 * @example response.data => [{id: "5f7f5c5f4f1d9e2b7c9d4f1d", ...}]
 */
export const getVenues = async (req, res, next) => {
  const query = req.query;
  if (query.name) {
    query.name = { $regex: query.name, $options: "i" };
  }
  if (query.city) {
    query.city = { $regex: query.city, $options: "i" };
  }
  if (query.state) {
    query.state = { $regex: query.state, $options: "i" };
  }
  try {
    const venues = await Venue.find(query);
    if (venues.length > 0) {
      res.status(200).json(venues);
    } else {
      res.status(404).json({ message: "No venues found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function createVenue
 * @description Create a new venue
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - New venue
 * @throws Will throw an error if one of the required fields is missing
 *
 * @method POST /venues
 * @example const response = await axios.post("/api/v1/venues", {name: "The Venue", ...})
 * @example response.status => 201
 * @example response.data => {id: "5f7f5c5f4f1d9e2b7c9d4f1d", ...}
 */
export const createVenue = async (req, res, next) => {
  const venue = req.body;
  if (
    !venue.name ||
    !venue.address ||
    !venue.city ||
    !venue.state ||
    !venue.locationLat ||
    !venue.locationLon ||
    !venue.capacity
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const newVenue = await Venue.create(venue);
    res.status(201).json(newVenue);
  } catch (error) {
    next(error);
  }
};

/**
 * @function getVenue
 * @description Get a venue by id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Venue
 * @throws Will throw an error if venue is not found
 *
 * @method GET /venues/:id
 * @example const response = await axios.get("/api/v1/venues/5f7f5c5f4f1d9e2b7c9d4f1d")
 * @example response.status => 200
 * @example response.data => {id: "5f7f5c5f4f1d9e2b7c9d4f1d", ...}
 */
export const getVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (venue) {
      res.status(200).json(venue);
    } else {
      res.status(404).json({ message: "Venue not found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function updateVenue
 * @description Update a venue by id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Updated venue
 * @throws Will throw an error if venue is not found
 *
 * @method PATCH /venues/:id
 * @example const response = await axios.patch("/api/v1/venues/5f7f5c5f4f1d9e2b7c9d4f1d", {name: "The Venue", ...})
 * @example response.status => 200
 * @example response.data => {id: "5f7f5c5f4f1d9e2b7c9d4f1d", ...}
 */
export const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (venue) {
      res.status(200).json(venue);
    } else {
      res.status(404).json({ message: "Venue not found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @function deleteVenue
 * @description Delete a venue by id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {object} - Empty object
 * @throws Will throw an error if venue is not found
 *
 * @method DELETE /venues/:id
 * @example const response = await axios.delete("/api/v1/venues/5f7f5c5f4f1d9e2b7c9d4f1d")
 * @example response.status => 204
 * @example response.data => {}
 */
export const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (venue) {
      res.status(204).json({});
    } else {
      res.status(404).json({ message: "Venue not found" });
    }
  } catch (error) {
    next(error);
  }
};
