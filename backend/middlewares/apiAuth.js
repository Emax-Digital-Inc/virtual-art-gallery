/**
 * We start by creating a base-36 string that contains 30 chars in a-z,0-9
 * Then, in the authenticateKey method
 * If API key matches check the number of times the API has been used in a particular day
 * We then check If API is already used today
 * If Yes, stop if the usage exceeds max API calls
 * Else, have not hit todays max usage
 * Update todays's date and increase count by 1 and call next() 
 * Else, If API key does not match then Reject request with an error message
 * 
 */

import User from "../models/users.js";

const MAX = process.env.API_MAX || 25;
const WINDOW_SIZE_IN_HOURS = process.env.WINDOW_SIZE_IN_HOURS || 24;

export const genAPIKey = () => {
    return [...Array(30)]
      .map((e) => ((Math.random() * 36) | 0).toString(36))
      .join('');
  };

export const createUser = (_username, req) => {
    let today = new Date().toISOString().split('T')[0];
    let user = {
      _id: Date.now(),
      api_key: genAPIKey(),
      username: _username,
      host: req.headers.origin,
      usage: [{ date: today, count: 0 }],
    };
  
    console.log('add user', user);
    User.push(user);
    return user;
  };

export  const authenticateKey = async (req, res, next) => {
    let host = req.headers.origin;
    
    let api_key = req.header('x-api-key');
    let account = users.find((user) => user.api_key == api_key);

    if (account) {
      let today = new Date().toISOString().split("T")[0];
      let usageCount = account.usage.findIndex((day) => day.date == today);
      if (usageCount >= 0) {
        if (account.usage[usageCount].count >= MAX) {
        
          res.status(429).json({
            status: 429,
            message: `You have exceeded ${MAX} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`
          });
        } else {
          account.usage[usageCount].count++;
          console.log("Good API call", account.usage[usageCount]);
          next();
        }
      } else {
        account.usage.push({ date: today, count: 1 });
        next();
      }
    } else {
      res.status(403).json({ 
        status: 403, 
        message: "You not allowed to access this resource" 
      });
    }
  };