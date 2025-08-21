/*
  Dev-only script: seeds duplicate sample reviews so UI isn't empty.
  Usage:
    - Ensure server/.env has MONGODB_URL set
    - Optional: set COURSE_ID env var to target a specific course
    - Run: npm run seed:reviews
*/

const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndRaview");
const User = require("../models/User");

async function run() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error("MONGODB_URL not set in server/.env");
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to DB");

  const courseIdEnv = process.env.COURSE_ID;
  let course;
  if (courseIdEnv) {
    course = await Course.findById(courseIdEnv).exec();
  } else {
    course = await Course.findOne({}).exec();
  }
  if (!course) {
    console.error("No course found. Create a course first or set COURSE_ID in env.");
    process.exit(1);
  }
  console.log(`Using course: ${course._id} - ${course.courseName || "(no name)"}`);

  // Find some users to use as reviewers
  const users = await User.find({}).limit(3).exec();
  if (users.length === 0) {
    console.error("No users found. Create users first.");
    process.exit(1);
  }

  const texts = [
    "Great course! Helped me a lot.",
    "Very informative and well structured.",
    "Great course! Helped me a lot.", // duplicate on purpose
    "Great course! Helped me a lot.", // duplicate on purpose
  ];
  const ratings = [5, 4, 5, 5];

  const created = [];
  for (let i = 0; i < texts.length; i++) {
    const user = users[i % users.length];
    const doc = await RatingAndReview.create({
      user: user._id,
      course: course._id,
      rating: ratings[i],
      review: texts[i],
    });
    created.push(doc);
  }

  // Push into course.ratingAndReviews
  await Course.findByIdAndUpdate(
    course._id,
    { $push: { ratingAndReviews: { $each: created.map((d) => d._id) } } },
    { new: true }
  ).exec();

  console.log(`Inserted ${created.length} reviews (with duplicates).`);
  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
