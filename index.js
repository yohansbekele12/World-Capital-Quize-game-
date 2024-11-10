import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

let quiz = [
  { country: "France", capital: "Paris" },
  { country: "United Kingdom", capital: "London" },
  { country: "United States of America", capital: "New York" },
];

db.query("SELECT *FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query ", err.stack);
  } else {
    quiz = res.rows;
  }
  db.end();
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page

app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// post route

app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim();
  let isCorrect = false;
  if (answer.toLowerCase() === currentQuestion.capital.toLowerCase()) {
    totalCorrect++;

    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    totalScore: totalCorrect,
    wasCorrect: isCorrect,
    question: currentQuestion,
  });

  console.log(answer);
});

// middleware for question generation

function nextQuestion() {
  const randomquiz = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomquiz;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
