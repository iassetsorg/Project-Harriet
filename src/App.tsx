import Navbar from "./layouts/navbar";
import CreateTopic from "./components/create_topic";
import MessageTopic from "./components/message_topic";
import ReadMessages from "./components/read_message";

export default function App() {
  return (
    <main>
      {/* Navbar component */}
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 mx-3">
        {/* Column 1: CreateTopic component */}
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <CreateTopic />
        </div>

        {/* Column 2: MessageTopic component */}
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <MessageTopic />
        </div>

        {/* Column 3: ReadMessages component */}
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <ReadMessages />
        </div>
      </div>
    </main>
  );
}
