import React, { useState } from "react";

function QuizSection({ quizData }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (question, option) => {
    setAnswers((prev) => ({ 
      ...prev, 
      [question]: option 
    }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quizData.forEach((q) => {
      if (answers[q.question] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  // Reset quiz
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Course Quiz</h2>
      {quizData.map((q, i) => (
        <div key={i} className="mb-6 p-4 bg-gray-800 rounded-lg">
          <p className="font-medium mb-3 text-white">{q.question}</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => !submitted && handleSelect(q.question, opt)}
                className={`text-left px-3 py-2 rounded-md transition-colors ${
                  submitted
                    ? opt === q.answer
                      ? "bg-green-600 text-white" // Correct answer
                      : answers[q.question] === opt && answers[q.question] !== q.answer
                      ? "bg-red-600 text-white" // Wrong selected answer
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : answers[q.question] === opt
                    ? "bg-blue-600 text-white" // Selected answer
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
                disabled={submitted}
              >
                {opt}
                {submitted && opt === q.answer && " ✓"}
                {submitted && answers[q.question] === opt && answers[q.question] !== q.answer && " ✗"}
              </button>
            ))}
          </div>
          {submitted && answers[q.question] && (
            <p className={`mt-2 text-sm ${
              answers[q.question] === q.answer ? "text-green-400" : "text-red-400"
            }`}>
              {answers[q.question] === q.answer 
                ? "Correct!" 
                : `Correct answer: ${q.answer}`
              }
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== quizData.length}
          className={`mt-4 px-4 py-2 rounded-lg ${
            Object.keys(answers).length === quizData.length
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Quiz ({Object.keys(answers).length}/{quizData.length} answered)
        </button>
      ) : (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-yellow-400 font-semibold text-lg mb-2">
            Quiz Results: {score} / {quizData.length}
          </p>
          <p className="text-gray-300 mb-4">
            {score === quizData.length ? "🎉 Perfect score! Well done!" :
             score >= quizData.length * 0.7 ? "👍 Good job!" :
             "💪 Keep practicing!"}
          </p>
          <button
            onClick={handleReset}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizSection;