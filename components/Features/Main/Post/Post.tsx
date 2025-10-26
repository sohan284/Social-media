"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { VscThumbsup } from "react-icons/vsc";

const Post = () => {
  const [showComments, setShowComments] = useState(false);
  return (
    <div>
      <div className="border border-slate-600 md:p-6 p-4 w-full rounded">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-[7px]">
            <Image
              src="/profile.jpg"
              alt="post"
              width={22}
              height={22}
              className="h-[30px] w-[30px] md:h-[22px] md:w-[22px] rounded-full object-cover"
            />
            <div className="flex flex-col sm:flex-row items-center md:gap-3.5  text-sm text-white">
              <p>John Doe</p>
              <p>2 hours ago</p>
            </div>
          </div>
          <button className="text-sm text-white cursor-pointer">Follow</button>
        </div>
        <div>
          <p className="text-base text-white mb-5">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam
            possimus esse qui! Qui blanditiis quidem temporibus voluptate
            consectetur impedit laudantium minima, expedita fugit deserunt dicta
            minus incidunt sapiente esse, tempore sunt sed quia. Similique nemo
            minus distinctio beatae voluptate explicabo, magni quas ipsum
            adipisci ducimus. Earum modi amet nam ducimus?
          </p>
          <div className="rounded-lg overflow-hidden">
            <Image
              src="/post.jpg"
              alt="post"
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Reactions */}
        <div className="flex items-center gap-4 mt-4">
          <button className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full">
            <VscThumbsup size={20} /> 255
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full"
          >
            <FaRegComment size={20} /> 255
          </button>
          <button className="text-sm text-white cursor-pointer flex items-center gap-2 px-2.5 py-[5px] bg-slate-700 rounded-full">
            <FaRegShareFromSquare size={20} /> 255
          </button>
        </div>
        {/* {showComments && <CommentSection />} */}
      </div>
    </div>
  );
};

export default Post;
