const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {

    const authHeader = req.get("Authorization");
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }

    const accessToken = authHeader.split(" ")[1]; //Bearer token
    if (!accessToken || accessToken === "") {
        req.isAuth = false;
        return next();
    }

    let data;
    try {
        data = jwt.verify(accessToken, process.env.AUTH_KEY);
        // console.log(data);
    } catch (err) {
        console.log(err);
        req.isAuth = false;
        return next();
    }

    if (data.vendorId) {
        req.vendorId = data.vendorId;
        req.name = data.name;
        req.email = data.email;
        req.pNumber = data.pNumber;
        req.fcmToken = data.fcmToken;
        req.isAuth = true;
    }

    if (data.riderId) {
        req.riderId = data.riderId;
        req.name = data.name;
        req.email = data.email;
        req.pNumber = data.pNumber;
        req.fcmToken = data.fcmToken;
        req.isAuth = true;
    }
    return next();
};