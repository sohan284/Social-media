import React from "react";
import Post from "../Post/Post";
import Story from "../Story/Story";

const Home = () => {
  return (
    <div className="px-2 md:px-4 xl:px-10">
      <Story />
      <div className="space-y-4">
        {[...Array(10)].map((_, index) => (
          <Post key={index} />
        ))}
      </div>
    </div>
  );
};

export default Home;
