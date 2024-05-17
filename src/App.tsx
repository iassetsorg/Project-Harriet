import Navbar from "./layouts/navbar";

import Explorer from "./components/explorer/explorer";
import { Sidebar } from "./layouts/Sidebar";
import About from "./components/about";
import ReadSharedThread from "./components/read shared message/read_shared_thread";
import ReadSharedPost from "./components/read shared message/read_shared_post";
import ReadSharedPoll from "./components/read shared message/read_shared_poll";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import BottomBar from "./layouts/BottomBar";
import { NewMessage } from "./components/sending message/new_message";
// import PostThread from "./components/post_thread";

import Profile from "./components/profile/profile";

import NotFoundPage from "./components/404";

export default function App() {
  return (
    <main className="bg-background">
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
            <Route path="/Explore" element={<Explorer />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Threads/:topicId" element={<ReadSharedThread />} />
            <Route path="/Polls/:topicId" element={<ReadSharedPoll />} />
            <Route path="/Posts/:sequenceNumber" element={<ReadSharedPost />} />
            <Route path="*" element={<NotFoundPage />} />{" "}
            {/* Catch-all route */}
          </Routes>
        </div>
        <BottomBar />
        <NewMessage />
      </Router>
    </main>
  );
}
