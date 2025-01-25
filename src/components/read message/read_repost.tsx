import ReadPost from "./read_post";
import ReadThread from "./read_thread";
import ReadPoll from "./read_poll";
import UserProfile from "../profile/user_profile";
import { FiRepeat } from "react-icons/fi";
import { formatTimestamp } from "../../common/formatTimestamp";

interface ReadRepostProps {
  contentType?: string;
  source?: string;
  rePoster?: string;
  timestamp?: string;
  sequence_number?: string;
}

const ReadRepost = ({
  contentType,
  source,
  rePoster,
  timestamp,
  sequence_number,
}: ReadRepostProps) => {
  const renderContent = () => {
    switch (contentType?.toLowerCase()) {
      case "post":
        return source ? <ReadPost sequence_number={source} /> : null;
      case "thread":
        return source ? <ReadThread topicId={source} /> : null;
      case "poll":
        return source ? <ReadPoll topicId={source} /> : null;
      default:
        return (
          <div className="flex flex-col justify-center items-center py-6 rounded-xl bg-background/5">
            <FiRepeat className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-text">Unsupported content type</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-background text-text group">
      {/* Repost Header with User Info and Timestamp */}
      <div className="flex items-center justify-between pr-2 pl-3 sm:px-6 py-2.5 group-hover:-translate-y-[1px] transition-transform">
        <div className="flex items-center gap-3">
          <div className="transform-gpu group-hover:scale-[1.02] transition-transform">
            <UserProfile userAccountId={rePoster || ""} />
          </div>
          <div className="flex items-center text-primary group-hover:scale-[1.02] transition-transform origin-left">
            <FiRepeat className="w-4 h-4 mr-1.5 group-hover:rotate-[20deg] transition-transform" />
            <span className="text-sm font-medium">Reposted</span>
          </div>
        </div>
        <span className="text-sm text-gray-500 group-hover:text-primary/80 transition-colors">
          {formatTimestamp(timestamp || "")}
        </span>
      </div>

      {/* Main Content */}
      <div className="theme-divider group-hover:bg-background/5 transition-colors">
        <div className="pt-1.5 group-hover:translate-y-[1px] transition-transform">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ReadRepost;
