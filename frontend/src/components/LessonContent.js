import React from "react";
import VideoPlayer from "./VideoPlayer";

function LessonContent({ section }) {
  if (section.contentType === "text") {
    return (
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
          {section.content}
        </p>
      </div>
    );
  }

  if (section.contentType === "image") {
    return (
      <div className="flex justify-center">
        <img
          src={section.content}
          alt={section.title || "Lesson Content"}
          className="w-full max-w-3xl rounded-lg shadow-lg object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="hidden w-full p-8 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400">Failed to load image</p>
        </div>
      </div>
    );
  }

  if (section.contentType === "video") {
    return <VideoPlayer url={section.content} title={section.title} />;
  }

  return <p className="text-gray-400">Unknown content type.</p>;
}

export default LessonContent;