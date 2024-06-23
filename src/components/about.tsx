import React from "react";

const About: React.FC = () => (
  <div className="container mx-auto p-6 sm:p-10 lg:p-16 xl:p-20 2xl:p-24 bg-background text-text shadow-xl ">
    <section>
      <div className="">
        <h1 className="text-5xl font-bold text-primary mb-12 text-center">
          Welcome to ibird
        </h1>

        <p className="text-xl mb-10 leading-relaxed ">
          ibird is a revolutionary web3, open-source, community-driven social
          media platform built on Hedera by iAssets. It leverages Hashgraph
          technology for unparalleled speed, security, and innovation.
        </p>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="bg-secondary shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-text mb-4">
              Community-Driven
            </h2>
            <p className="text-text">
              Governed democratically by its users, ibird evolves with the
              community at its heart. Your voice shapes its future.
            </p>
            <a
              href="https://discord.gg/xM7SkkTEAG"
              className="text-primary hover:text-accent transition duration-300 mt-4 inline-block"
            >
              Join The Community
            </a>
          </div>

          <div className="bg-secondary shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-text mb-4">
              Open-Source
            </h2>
            <p className="text-text">
              With transparent, open-source code, ibird fosters trust and
              continuous innovation, free from hidden agendas.
            </p>
            <a
              href="https://github.com/iassetsorg/Project-Harriet"
              className="text-primary hover:text-accent transition duration-300 mt-4 inline-block"
            >
              Start Building Freedom
            </a>
          </div>

          <div className="bg-secondary shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-text mb-4">
              Hedera-Powered
            </h2>
            <p className="text-text">
              Harnessing Hedera's advanced technology, ibird offers a fast,
              secure, and equitable social media experience.
            </p>
            <a
              href="https://hedera.com/"
              className="text-primary hover:text-accent transition duration-300 mt-4 inline-block"
            >
              Learn more about Hedera
            </a>
          </div>
        </div>
        <div className="text-center mt-16">
          <CallToAction />
        </div>
      </div>

      <div className="container mx-auto my-12 p-6 bg-background text-primary">
        <h2 className="text-4xl font-bold text-primary mb-8 text-center">
          Our Journey
        </h2>

        {/* v0.0.1 (Threads) */}
        <div className="mb-12">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅ </span>v0.0.1 Threads
          </h3>
          <ul>
            <li>🟢 Connect wallet</li>
            <li>🟢 Create threads</li>
            <li>🟢 Read thread's data</li>
            <li>🟢 Send message to threads</li>
          </ul>
        </div>

        {/* v0.0.2 (Interactions) */}
        <div className="mb-12">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.2 Interactions
          </h3>
          <ul>
            <li>🟢 Reply to messages</li>
            <ul className="ml-4 ">
              <li>🟢 Like</li>
              <li>🟢 Dislike </li>
              <li>🟢 Write Comments</li>
            </ul>
          </ul>
        </div>

        {/* v0.0.2 (Interactions) */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.3 Explore Feed
          </h3>
          <ul>
            <li>🟢Directory for all threads</li>
            <span className="">
              🟢Explore Topic:{" "}
              <a
                target="blank"
                href="https://hashscan.io/mainnet/topic/0.0.3946144"
                className="text-primary"
              >
                0.0.3946144
              </a>
            </span>
            <li>🟢Users can send their threads to the Explore Feed</li>
          </ul>
        </div>

        {/* v0.0.4 (Profile, Threads, and Planet) */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.4 Profile, Threads, and Planet
          </h3>
          <ul>
            <li>🟢 Profile</li>
            <ul className="ml-4 ">
              <li>🟢 Create user Profile NFT</li>
              <li>🟢 Create user Profile Topic</li>
              <li>🟢 Save Profile Topic in Profile NFT</li>
              <li>🟢 Create user Threads</li>
              <li>🟢 Save user Threads in Profile Topic</li>
            </ul>

            <li>🟢 Planet</li>
            <ul className="ml-4 ">
              <li>🟢Directory for all posts</li>
              <span className="">
                🟢 Planet Topic:{" "}
                <a
                  target="blank"
                  href="https://hashscan.io/mainnet/topic/0.0.4320596"
                  className="text-primary"
                >
                  0.0.4320596
                </a>
              </span>
            </ul>
          </ul>
        </div>

        {/* v0.0.5 (v0.0.5 Media Support - IPFS) */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.5 Media Support
          </h3>
          <ul>
            <li>🟢 Save media files on IPFS</li>
            <li>🟢 Send media files with messages</li>
          </ul>
        </div>

        {/* v0.0.6 (Tipping - ASSET and HBAR Tokens) */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.6 Tipping Support
          </h3>
          <ul>
            <li>🟢 Tip HBAR</li>
            <li>🟢 Tip ASSET</li>
            <li>🟢 Tip USDC</li>
            <li>🟢 Tip SAUCE</li>
            <li>🟢 Tip GRELF</li>
            <li>🟢 Tip XPH</li>
            <li>🟢 Tip DOVU</li>
            <li>🟢 Tip SAUCEINU</li>
            <li>🟢 Tip JAM</li>
            <li>🟢 Tip HSUITE</li>
            <li>🟢 Tip BSL</li>
            <li>🟢 Tip BULLBAR</li>
            <li>🟢 Tip MFM</li>
            <li>🟢 Tip NORDOGE</li>
            <li>🟢 Tip KARATE</li>
          </ul>
        </div>

        {/* v0.0.7 Boosting Threads */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.7 UPGRADO
          </h3>
          <ul>
            <li> 🟢 Hash Link #</li>
            <li> 🟢 Dark & light theme</li>
            <li> 🟢 Universal Topic</li>
            <li> 🟢 Interactive polls</li>
            <li> 🟢 Users profile</li>
          </ul>
        </div>

        {/* v0.0.8 Interactive Polls */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>✅</span> v0.0.8 Reward & Analyze
          </h3>

          <ul>
            <li>
              <li> 🟢 Reward engine</li>
              <li> 🟢 System Analytics</li>
            </li>
          </ul>
        </div>

        {/* v0.0.9 iOS and Android Applications */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>⏳</span> v0.0.9 Applications
          </h3>
          <ul>
            <li> 🟢 Date & Time Stamps </li>
            <li> 🟢 Character Counter</li>
            <li> 🟢 Link, #, $ Reader</li>
            <li> 🟢 Explorer Infinite Scrolling</li>
            <li> 🟠 IOS Application</li>
            <li> 🟠 Android Application</li>
            <li> 🟠 Desktop Application</li>
          </ul>
        </div>

        {/* v0.1.0 Community Governance */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>⏳</span> v0.1.0 Community Governance
          </h3>
          <ul>
            <li>
              <a
                className=" text-text mb-2"
                href="https://sentx.io/nft-marketplace/0.0.3844404"
                target="blank"
              >
                🟠 iBird Gen 1: The First Flight
              </a>{" "}
              <span className="text-text"> </span>
              Holders propose and vote on key platform updates
            </li>
          </ul>
        </div>
        {/* v0.1.1 Community Governance */}
        <div className="mb-6">
          <h3 className="text-2xl text-primary mb-2">
            <span>⏳</span> v0.1.1 Followers and Channels
          </h3>
          <ul>
            <li>🟠 Followers</li>
            <li>🟠 Channels</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
);

const CallToAction: React.FC = () => (
  <a
    href="https://iassets.gitbook.io/ibird/"
    target="blank"
    className="inline-flex items-center px-8 py-4 text-xl font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
  >
    Learn More!
  </a>
);

export default About;
