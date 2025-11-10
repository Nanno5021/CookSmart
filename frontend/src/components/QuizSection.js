import React, { useState } from "react";

function QuizSection({ quizData }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (question, option) => {
    setAnswers((prev) => ({ ...prev, [question]: option }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quizData.forEach((q) => {
      if (answers[q.question] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Course Quiz</h2>
      {quizData.map((q, i) => (
        <div key={i} className="mb-6">
          <p className="font-medium mb-2">{q.question}</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(q.question, opt)}
                className={`text-left px-3 py-2 rounded-md ${
                  answers[q.question] === opt
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg"
        >
          Submit Quiz
        </button>
      ) : (
        <p className="mt-4 text-yellow-400 font-semibold">
          You scored {score} / {quizData.length}
        </p>
      )}
    </div>
  );
}

export default QuizSection;
