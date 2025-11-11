import React from "react";

function LessonContent({ section }) {
  if (section.contentType === "text") {
    return <p className="text-gray-200 leading-relaxed">{section.content}</p>;
  }

  if (section.contentType === "image") {
    return (
      <img
        src={section.content}
        alt="Lesson Content"
        className="w-full rounded-lg shadow-lg"
      />
    );
  }

  if (section.contentType === "video") {
    return (
      <video
        controls
        className="w-full rounded-lg shadow-lg"
      >
        <source src={section.content} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return <p>Unknown content type.</p>;
}

export default LessonContent;
