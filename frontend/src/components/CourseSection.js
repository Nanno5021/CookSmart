import React from "react";

function CourseSection({ sections, currentSection, onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold mb-2">Course Sections</h2>
      {sections.map((sec) => (
        <button
          key={sec.id}
          onClick={() => onSelect(sec)}
          className={`text-left px-3 py-2 rounded-md transition-all ${
            currentSection.id === sec.id
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {sec.title}
        </button>
      ))}
    </div>
  );
}

export default CourseSection;
