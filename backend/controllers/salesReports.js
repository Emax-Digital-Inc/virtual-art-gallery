import Payment from "../models/payments.js";
import { errorLogger } from "../middlewares/logging.js";
import { createObjectCsvWriter } from "csv-writer";
import Ticket from "../models/tickets.js";
import redisClient from "../config/redisConn.js";

/**
 * 
 * @function getAllTransactions
 * @description This function get all transactions 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method GET /api/v1/reports/all-transactions
 * @access Public
 * @example http://localhost:5000/api/v1/reports/all-transactions
 * @example request
 * {
 * "startDate": "2021-06-04",
 * "endDate": "2021-06-05",
 * "eventId": "60b9b0b0e6b3c2b4e8f3b0b1"
 * }
 * @example response - 200 OK
 * {
 *  "success": true,
 *  "transactions": [
 * {
 * "_id": "60b9b0b0e6b3c2b4e8f3b0b1",
 * "event": "6y79b0b0e6b3c2b4e8f378u6",
 * "user": "60b9b0b0e6b3c2b4e8f3b0b0",
 * "amount": "70",
 * "currency": "USD",
 * "status": "SUCCESS",
 * "transactionId": "89b9b0b0e6b78y64e8f3b078",
 * "transactionDate": "2021-06-04T15:12:48.000Z",
 * }
 * ]
 * }
 */
export const getAllTransactions = async (req, res, next) => {
    try {
        let startDate = req.body.startDate; 
        let endDate = req.body.endDate;
        let eventId = req.body.eventId;
        if(startDate === '' || endDate === '') {
            return res.status(400).json({
                message: 'Please ensure you pick two dates',
            });
        }
        console.log({ startDate, endDate});
        const transactions = await Payment.find({ 
            transactionDate: {$gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))},
            event: {eventId}    
       }).sort({ transactionDate: 'asc'})  
       
       if(!transactions) {
            errorLogger({statusCode: 404, message: "Could not retrieve transactions"}, req, res);
            return res.status(404).json({
                message:'Could not retrieve transactions',
                transactions
            })
        }
        res.status(200).json({
            message:'success',
            transactions
        })
    } catch(error) {
        errorLogger({statusCode: 500, message: "Error while retrieving transactions"}, req, res);
        return res.status(500).json({ error: 'Error while retrieving transactions' }); 
    }
}

/**
 * 
 * @function getTransactions
 * @description This function get transactions based on transaction status 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method GET /api/v1/reports/transactions
 * @access Public
 * @example http://localhost:5000/api/v1/reports/transactions
 * @example request
 * {
 * "startDate": "2021-06-04",
 * "endDate": "2021-06-05",
 * "eventId": "60b9b0b0e6b3c2b4e8f3b0b1",
 * "status": "PENDING",
 * }
 * @example response - 200 OK
 * {
 *  "success": true,
 *  "transactions": [
 * {
 * "_id": "60b9b0b0e6b3c2b4e8f3b0b1",
 * "event": "6y79b0b0e6b3c2b4e8f378u6",
 * "user": "60b9b0b0e6b3c2b4e8f3b0b0",
 * "amount": "70",
 * "currency": "USD",
 * "status": "PENDING",
 * "transactionId": "89b9b0b0e6b78y64e8f3b078",
 * "transactionDate": "2021-06-04T15:12:48.000Z",
 * }
 * ]
 * }
 */
export const getTransactions = async (req, res, next) => {
    try {
        let startDate = req.body.startDate; 
        let endDate = req.body.endDate;
        let status = req.body.status;
        let eventId = req.body.eventId;
        console.log("startDate: ", startDate, "endDate: ", endDate, "condition:", status, "eventId: ", eventId );
        if(
            startDate === '' || 
            endDate === '' ||
            status === '' ||
            eventId === '' ) {
            return res.status(400).json({
                message: 'Please ensure you pick two dates',
            });
        }
        startDate.setHours(0, 0, 0, 0); // Set start date to 00:00:00
        endDate.setHours(23, 59, 59, 999); // Set end date to 23:59:59  
        console.log({ startDate, endDate});
        const transactions = await Payment.find({ 
            transactionDate: {$gte: startDate, $lte: endDate}, 
            status: { status },
            event: {eventId}
       }).sort({ transactionDate: 'asc'})  
       if(!transactions) {
            errorLogger({statusCode: 404, message: "Could not retrieve transactions"}, req, res);
            return res.status(404).json({
                message:'Could not retrieve transactions',
                transactions
            })
        }
        res.status(200).json({
            message:'success',
            transactions
        })
    } catch(error) {
        errorLogger({statusCode: 500, message: "Error while retrieving transactions"}, req, res);
        return res.status(500).json({ error: 'Error generating sales report' });
    }
}

/**
 * 
 * @function getAttendance
 * @description This function get the number of people who attended the event 
 * @param {Object} req - The request
 * @param {Object} res - The response
 * @param {Function} next - The next middleware
 * @returns {Object}
 * @throws {Object}
 * 
 * @method GET /api/v1/reports/attendance
 * @access Public
 * @example http://localhost:5000/api/v1/reports/attendance
 * @example request (query parameter)
 * {
 * "event": "60b9b0b0e6b3c2b4e8f3b0b1",
 * }
 * @example response - 200 OK
 * {
 *  "success": true,
 *  "data": [
 * {
 * "fromCache": false, 
 * "message": "Successful",  
 * "countAttendees": "1349",
 * }
 * ]
 * }
 */
export const getAttendance = async (req, res, next) => {
    let evenntId = req.query.event;
    const query = {scanned: true};
    const cacheKey = `api-v1-reports-attendance-${JSON.stringify(req.query)}`;
    if (!evenntId) {
        return res.status(400).json({
            message: "Please fill in required parameter"
        })
    }
    try {
        const countAttendees = await Ticket.countDocuments(query);
        if (!countAttendees) {
            return res.status(400).json({
                message: "No-one attended this event",
            });
        }
        // TODO: have to delete cache in tickets controller when a new ticket is scanned
        await redisClient.set(cacheKey, JSON.stringify(countAttendees), {
            EX: 172800, 
            NX: true,
        });
        res.status(200).json({ 
            fromCache: false, 
            message: "Successful", 
            countAttendees 
        });
    } catch (error) {
        next(error);
    }
}