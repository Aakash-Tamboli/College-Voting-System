const express = require("express");
const User = require("../Models/user");
const { jwtAuthentication, generateToken } = require("../Middlewares/jwt");


// Temporary Segment started here

class ErrorResponse
{
/*
Incase of error
{
	"success": false,
	"status": 400,
	"error": {
		"message": "Invalid Data"
        // may be later on more field will added depends upon requirement
	}
}
*/
    constructor(success,status,errorObject)
    {
        this.success=success;
        this.status=status;
        this.error=errorObject;
    }
}

class ResponseBody
{
    /*
    {
	    "success": true,
    	"status": 200,
	    "message": "Request processed sucessfully",
    	"data" : [
    		{id: 124, name: "blah blah"},
    		{id: 125, name: "blah blah"},
    	]
    }
    */

    constructor(success,status,message,dataArray)
    {
        this.sucess=success;
        this.status=status;
        this.message=message;
        this.data=dataArray;
    }
}
// Temporary Segement end here



const router = express.Router();

router.post("/signup", async function (request, response) {
  try {
    const data = request.body;

    const adminUser = await User.findOne({ role: "admin" });

    // One Admin Policy implemented
    if (data.role === "admin" && adminUser) {
      return response.status(400).json({ error: "Admin Already exists" });
    }
    // here code to check length of addharcard
    const userExists = await User.findOne({
      aadharCardNumber: data.addharCardNumber,
    });

    if (userExists) {
      return response
        .status(400)
        .json({ error: "Aadhard Card Already exists" });
    }

    const user = new User(data);

    console.log(data);

    console.log(user);

    const savedDocument = await user.save();

    console.log("Data Saved");

    const payload = {
      id: savedDocument.id,
    };

    const token = generateToken(payload);

    response.status(200).json({ response: savedDocument, token: token });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async function (request, response) {
  try {
    const { aadharCardNumber, password } = request.body;
    if (!aadharCardNumber || !password)
      return response
        .status(400)
        .json({ error: "Aadhard Card Number and password required to login" });

    const user = await User.findOne({ aadharCardNumber });

    if (!user || !(await user.comparePassword(password)))
      return response
        .status(401)
        .json({ error: "Invalid Aadhar Card Number OR Password" });

    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);

    response.json({ token });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
});

router.get("/profile", jwtAuthentication, async function (request, response) {
  try {
    const userData = request.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    response.status(200).json({ user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
});

router.patch(
  "/profile/password",
  jwtAuthentication,
  async function (request, response) {
    try {
      const userData = request.user;

      const userId = userData.id;

      const { currentPassword, newPassword } = request.body;

      if (!currentPassword || !newPassword)
        return response
          .status(400)
          .json({ error: "Both current password and new password required." });

      const user = await User.findById(userId);

      if (!user || !(await user.comparePassword(currentPassword)))
        return response.status(401).json({ error: "Invalid current password" });

      user.password = newPassword;

      await user.save();

      console.log("Password Updated");

      response.status(200).json({ message: "Password updated" });
    } catch (error) {
      console.error(error.message);
      response.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
