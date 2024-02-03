import Banner from "./layouts/banner";
import Navbar from "./layouts/navbar";
import CreateThread from "./components/create_thread";
import ExplorerFeed from "./components/explorer_feed";
import SendMessages from "./components/send_message";
import ReadThreadManually from "./components/read_thread_manually";
import { Sidebar } from "./layouts/Sidebar";
import About from "./components/about";
import ReadSharedThread from "./components/read_shared_thread";
import ReadSharedPost from "./components/read_shared_post";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import BottomBar from "./layouts/BottomBar";
import { NewThreadButton } from "./layouts/NewThreadButton";
// import PostThread from "./components/post_thread";
import Planet from "./components/planet_feed";
import useGetProfileData from "./hooks/use_profile_data";
import Profile from "./components/profile";
import Threads from "./components/threads";
import NotFoundPage from "./components/404";
export default function App() {
  return (
    <main className="bg-gray-800">
      <Router>
        {/* <Banner /> */}
        <Navbar />
        <div className="flex ">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Navigate to="/Explore" replace />} />
            <Route
              path="/Project-Harriet"
              element={<Navigate to="/Explore" replace />}
            />
            <Route path="/about" element={<About />} />
            <Route path="/Explore" element={<ExplorerFeed />} />
            <Route path="/Planet" element={<Planet />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Threads/:topicId" element={<ReadSharedThread />} />
            <Route path="/Posts/:sequenceNumber" element={<ReadSharedPost />} />
            <Route path="*" element={<NotFoundPage />} />{" "}
            {/* Catch-all route */}
          </Routes>
        </div>

        {/* <CreateThread />
        <SendMessages />
        <ReadThreadManually /> */}

        <BottomBar />
        <NewThreadButton />
      </Router>
    </main>
  );
}
