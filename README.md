# SocialFi Built on Hedera

# iBird is an Open-Source, Community-Driven, Web3 Social Media Built on Hedera

iBird - A Decentralized Social Media Platform

## Introduction

iBird is a decentralized social media platform built on the Hedera Hashgraph network, leveraging its Hedera Consensus Service (HCS) and Hedera Token Service (HTS). The platform aims to provide a censorship-resistant, open-source, and user-controlled environment for social interactions, content creation, and sharing.

## Architecture

iBird consists of two main components:

1. **Backend: Hedera Hashgraph Network**

   - **Hedera Consensus Service (HCS):** Used for creating decentralized, auditable logs of timestamped events.
   - **Hedera Token Service (HTS):** Used for creating and managing user profile NFTs.

2. **Frontend: User Interface and Logic**
   - Handles the interface and user interactions.
   - Includes the logic for writing data to and reading data from the Hedera network.

## Data Structure and Communication

<!-- 1. **[Universal](https://hashscan.io/mainnet/topic/0.0.4976953) Explorer** -->

1. **Universal Explorer**

   - All posts, threads, and polls are recorded on this public topic.
   - Enables reading of all messages sent by users on iBird.

2. **Message Types**

   - **Posts**

     - Readable content that users can like or reply to.
     - Example:
       ```json
       {
         "Type": "Post",
         "Message": "Free speech is paramount, but in our current landscape, it's under threat. iBird emerges as a sanctuary for unfiltered expression, protected by Hedera, ensuring our voices soar beyond the reach of censorship.🎙️",
         "Media": null
       }
       ```

   - **Threads**

     - Saved on the explore topic with a reference to a separate topic for each thread.
     - Users can like, dislike, reply, and write comments on threads.
     - Example (Explore Topic):
       ```json
       { "Type": "Thread", "Thread": "0.0.5706419" }
       ```
     - Example (Thread Topic):
       ```json
       {
         "Message": "On iBird, every conversation, every interaction, is a step towards a freer digital world. Engage, create, share, and do it on your terms. Welcome to the future of social networking.",
         "Media": null
       }
       ```

   - **Polls**
     - Each poll is a separate topic, and all votes are saved on the poll topic.
     - Example (Explore Topic):
       ```json
       {
         "Type": "Poll",
         "Poll": "0.0.5679056"
       }
       ```
     - Example (Poll Topic):
       ```json
       {
         "Message": "Question?",
         "Media": "ipfs://bafkreicsd3imsxhqyjbew2uldrojftxkwcz2w2zjs2jjismdf4d75ns7hu",
         "Choice1": "A",
         "Choice2": "B",
         "Choice3": null,
         "Choice4": null,
         "Choice5": null
       }
       ```

3. **Media Storage**
   - All media files are stored on IPFS (InterPlanetary File System).
   - Users can obtain a free key from NFT.storage, an IPFS provider, to store their media.

## User Profiles

When a user creates a profile:

1. A USER MESSAGES topic is created to save the user's messages.
2. A USER PROFILE TOPIC is created to store user information and the USER MESSAGES topic.
3. A user profile NFT is minted, with the USER PROFILE TOPIC added as metadata.
4. The user has full control over their profile NFT, which is saved in their wallet.
5. To update profile information, the user sends a new message to the USER PROFILE TOPIC, and iBird reads the last message as the current user profile data.

   - Example:
     ```json
     {
       "Identifier": "iAssets",
       "Type": "Profile",
       "Author": "0.0.5706201",
       "Name": "iAssets",
       "Bio": "iBird is an Open-Source, Community-Driven, Web3 Social Media Built on Hedera by iAssets.",
       "Website": "ibird.community",
       "Location": "",
       "UserMessages": "0.0.5706263",
       "Picture": "ipfs://bafkreieltouugsbgruyd7u2pbwlp2oe2xd7scmvjzdkgv6a7a6gosksram",
       "Banner": null
     }
     ```

## Tipping and Rewards

- iBird supports user tipping, with 99% of each tip going to the content creator and 1% to iBird for platform improvement.

## Open Source and Decentralization

- iBird is open-source, allowing anyone to download and run the platform on their system.
- The platform does not rely on centralized servers, making it fully decentralized.

## Future Plans

- Develop mobile applications for iBird.
- Track the number of messages sent on the platform.
- Solve the challenge of storing follower and following relationships on-chain.
- Integrate additional decentralized data storage methods.
- Implement a reward engine to incentivize user participation and growth.

## Conclusion

iBird leverages the power of the Hedera Hashgraph network to create a decentralized, censorship-resistant social media platform. By utilizing HCS for message ordering and timestamping, HTS for user profile management, and IPFS for media storage, iBird offers a unique and innovative approach to social networking. The open-source nature of the platform ensures transparency and allows for community-driven development, while the decentralized architecture provides users with control over their data and interactions.

## Building Together

Project-Harriet is an open-source venture and we appreciate contributions from our community. Feel free to participate in the project, propose improvements, or raise issues. Whether you're making changes to the existing code or suggesting new features, your contribution will shape the future!

## License

This project is anchored by the Creative Commons Attribution-NonCommercial 4.0 International Public License - see the [LICENSE](LICENSE.md) file for details.
