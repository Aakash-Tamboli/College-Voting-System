const express = require("express");
const User = require("../Models/user");
const Candidate = require("../Models/candidate");
const { jwtAuthentication, generatePassword } = require("../Middlewares/jwt");

async function isAdmin(request, response, next) {
  try {
    const user = await User.findById(request.user.id);
    if (user.role === "admin") next();
    else response.status(403).json({ error: "User is not an admin" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

const router = express.Router();

router.post(
  "/",
  jwtAuthentication,
  isAdmin,
  async function (request, response) {
    try {
      const data = request.body;
      // validation pending

      const candidate = new Candidate(data);
      const document = await candidate.save();

      console.log("Candidate Created");

      response.status(200).json({ response: document });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/:candidateID",
  jwtAuthentication,
  isAdmin,
  async function (request, response) {
    try {
      const candidateID = request.params.candidateID;

      const dataToBeUpdated = request.body;

      // validation pending

      const document = await Candidate.findByIdAndUpdate(
        candidateID,
        dataToBeUpdated,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!document)
        return response.status(404).json({ error: "Candidate not found" });

      console.log("Candidate data updated");

      response.status(200).json({ response: document });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/:candidateID",
  jwtAuthentication,
  isAdmin,
  async function (request, response) {
    try {
      const candidateID = request.params.candidateID;
      const document = await Candidate.findByIdAndDelete(candidateID);

      if (!document)
        return response.status(404).json({ error: "Candidate not found" });

      console.log("Candidate Deleted");

      response.status(200).json({ response: document });
    } catch (error) {
      console.error(error.message);
      response.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/vote/:candidateID",
  jwtAuthentication,
  async function (request, response) {
    try {
      candidateID = request.params.candidateID;
      userId = request.user.id;

      const candidate = await Candidate.findById(candidateID);
      if (!candidate)
        return response.status(404).json({ error: "Candidate Not Found" });

      const user = await User.findById(userId);
      if (!user) return response.status(404).json({ error: "User not Found" });

      if (user.role === "admin")
        return response
          .status(403)
          .json({ error: "Admin not allowed to vote" });

      if (user.isVoted)
        return response.status(400).json({ error: "User Already voted!" });

      candidate.votes.push({ user: userId });
      candidate.voteCount++;
      await candidate.save();

      user.isVoted = true;
      await user.save();
      response.status(200).json({ response: "Vote recorded successfully" });
    } catch (error) {
      console.error(error.message);
      response.status(500).json({ error: error.message });
    }
  }
);

// below route is all for college student regardless they are participating in voting or not
router.get("/vote/count", async function (request, response) {
  try {
    const candidates = await Candidate.find({}).sort({ voteCount: "desc" });
    const voteRecords = candidates.map((candidate) => {
      return {
        organisation: candidate.organisation,
        voteCount: candidate.voteCount,
      };
    });
    return response.status(200).json(voteRecords);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ error: error.message });
  }
});

router.get("/", async function (request, response) {
  try {
    const candidates = await Candidate.find({}, "name organisation -id");
    response.status(200).json({ response: candidates });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
