# iBird: A Web3 Social Media Platform on Hedera Hashgraph

[iBird](https://ibird.io/) is a fully functional Web3 social media platform operating on Hedera Hashgraph built by [iAssets](https://iassets.org/). It offers users an opportunity to join, create an account, and post messages directly on the Hedera Network. Not only messages, iBird writes all user interactions including posting, liking, and commenting on a unique Hedera Consensus Service ([HCS Topic](https://hashscan.io/mainnet/topic/0.0.1290501)).

## iBird Explorer

**iBird Explorer** is an open-source tool providing you the freedom to retrieve and read messages from the iBird social media platform, even when the website is offline. iBird stores all these user actions securely on Hedera's robust network where every post carries a unique hash, thus allowing users to prove the ownership of their content.

By using iBird Explorer ([GitHub link](https://github.com/iassetsorg/ibird-explorer)), you can enter the hash of a message or content item and retrieve the corresponding content directly from the Hedera Network, ensuring permanent availability irrespective of the iBird website status.

## Project Harriet: The Journey Towards Decentralization

**Project Harriet** is on a mission to redefine social media by making iBird 100% open source and 100% decentralized. It marks the dawn of a new era in social networking, leveraging cutting-edge Web3 technologies on Hedera Hashgraph.

The ultimate goal is to foster a rapid, transparent, and decentralized social network, solidifying user's control on their data.

### [Web2 Version](https://ibird.io/)

### [Web3 Version(🛠️in progress⚙️)](https://ibird.community/)

### Project Building Blocks

- **Writer**: The interface for content creation including posts, comments, or any other user interactions.
- **Reader**: The data retrieval system which fetches the content from HCS, coupled with regular pull operations to keep the user data in sync.

## Structure

We plan to release multiple versions of the platform, starting from simple and gradually adding more features and complexity. Here are the details of some of the initial versions:

### v0.0.1 (Threads)

- Users can connect their wallet, supporting HashPack, Blade, and Metamask.
- Users can create topics(threads) and write messages.
- Users can read messages by entering a topic ID.
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets"
      "Type":"Thread",
      "Author": "AccountId",
    }
    ```
  - Message 2: User's first message
    ```
    {
      "Message": "Hello"
    }
    ```
  - Message 3: User's second message
    ```
    {
      "Message": "Good Morning"
    }
    ```

### v0.0.2 (Interactions)

- Users can reply to messages and interact with them.
- Users can like or dislike a message.
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets"
      "Type":"Thread",
      "Author": "AccountId",
    }
    ```
  - Message 2: User1 first message
    ```
    {
      "Author": "AccountId1",
      "Message": "Hello"
    }
    ```
  - Message 3: User2 comment to user1 first message
    ```
    {
      "Author": "AccountId2",
      "Reply_to": "Message 2",
      "Message": "Hi"
    }
    ```
  - Message 4: User1 like Message 3
    ```
    {
      "Author": "AccountId1",
      "Like_to": "Message 3",
    }
    ```

### v0.0.3 (Explore Feed)

- The platform now includes a globally accessible "Explore Feed".
- This feed is a directory of all threads created across the platform, which helps enhance discoverability and encourage interaction.
- Each thread is automatically added to the Explore Feed upon creation, covering a wide array of topics.
- Users have an option to choose if their threads should be visible on Explore Feed or not. This gives them control over the visibility of their posts.
- Users can access any thread from the Explore Feed, improving community engagement.
- [Explore Topic: 0.0.3946144](https://hashscan.io/mainnet/topic/0.0.3946144)

- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets",
      "Type":"Explore",
      "Author": "iAssets",
    }
    ```
  - Message 2: Thread1
    ```
    {
      "Thread": "TopicId1"
    }
    ```
  - Message 3: Thread2
    ```
    {
      "Thread": "TopicId2"
    }
    ```

### v0.0.4 (User Profile, UserThreads, Users, and Planet)

#### User Profile

- When a user creates a profile, a unique Topic is created for them. This acts as a personal profile page for a user. It houses the user's details.
- **Structure**:

  - Message 1: Profile information

    ```
    {
    "Identifier": "iAssets",
    "Type": "Profile",
    "Author": "signingAccount",
    "Name": "John Doe",
    "Bio": "Software Developer passionate about Web3",
    "Website": "https://johndoe.com",
    "Location":"Nevada"
    "Threads": "ThreadsTopicId",
    "Picture": "ipfs_hash",
    "Banner": "ipfs_hash"
    }
    ```

  - Message 2: Updated Profile information
    ```
    {
    "Identifier": "iAssets",
    "Type": "Profile",
    "Author": "signingAccount",
    "Name": "John Doe",
    "Bio": "Software Developer passionate about Web3",
    "Website": "https://johndoe.com",
    "Threads": "ThreadsTopicId",
    "Picture": "ipfs_hash",
    "Banner": "ipfs_hash"
    }
    ```

One of the major challenges we face with the v0.0.4 design is obtaining user profile data. The issue arises from the fact that user profiles are considered topics, and we aim to avoid relying on a centralized database to store this information. The reason behind this choice is our commitment to achieving a fully decentralized web3 social media platform.

In the context of open sourcing ibird, v0.0.4 stands out as the most complex, crucial, and demanding component. To address the challenge of user profile data, we propose leveraging NFTs (Non-Fungible Tokens). This involves creating an extensive NFT collection dedicated to ibird profiles. Upon a user creating a profile, an NFT is minted with the user's profile topic ID as metadata. This innovative approach ensures that each user maintains ownership of their profile, and the new decentralized system can retrieve user data directly from the network, eliminating the need for a centralized database.

#### UserThreads

- This is a directory for user threads. This Topic is linked back to the user's Profile.
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets",
      "Type":"UserThreads",
      "Author": "AccountId",
    }
    ```
  - Message 2: Thread1
    ```
    {
      "Thread": "TopicId1"
    }
    ```
  - Message 3: Thread2
    ```
    {
      "Thread": "TopicId2"
    }
    ```
  #### Users
- This is the highest level of organization and acts as the central Users directory of the platform.
- It stores IDs of all users and their associated profile topics.
- This can be seen as a big directory that holds the records of all users who join the platform.
- [Users Topic: 0.0.4320592](https://hashscan.io/mainnet/topic/0.0.4320592)

- **Structure**:

  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets",
      "Type":"Users",
      "Author": "iAssets",
    }
    ```
  - Message 2: User1
    ```
    {
      "AccountId1": "User Profile1"
    }
    ```
  - Message 3: User2
    ```
    {
      "AccountId2": "User Profile2"
    }
    ```

  #### Planet

- The Planet is a public topic that serves as an open bulletin board where everyone can post messages, but interactions such as replies and likes are disabled.
- It provides a one-way communication channel for users to share announcements, updates, or general information with the entire community.
- Posting a message on the Planet costs only $0.0001, making it a cost-effective way to broadcast information to the Planet.
- [Planet Topic: 0.0.4320596](https://hashscan.io/mainnet/topic/0.0.4320596)
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets",
      "Type":"Planet",
      "Author": "iAssets",
    }
    ```
  - Message 2: User1 post on the Planet
    ```
    {
    "Message": "Hello Earth!"
    }
    ```
  - Message 3: User2 post on the Planet
    ```
    {
    "Message": "Don't forget to check out the latest updates on iBird!"
    }
    ```

### v0.0.5 (Media Support - IPFS)

- Users can upload media files which get stored on IPFS. The IPFS hash of the uploaded media file is stored in the message, creating a permanent, unmodifiable record.
- Users can view or download this media by retrieving it from IPFS using the stored hash.
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets"
      "Type":"Thread",
      "Author": "AccountId",
    }
    ```
  - Message 2: User first message
    ```
    {
      "Message": "Hello"
      "Media_IPFS_Hash": "Qmbfvg7t"
    }
    ```
  - Message 3: User second message
    ```
    {
      "Message": "Good Morning"
      "Media_IPFS_Hash": "Qmbfvg7t"
    }
    ```

### v0.0.6 (Tipping - ASSET and HBAR Tokens)

- Users can send tips to each other using [ASSET](https://www.saucerswap.finance/swap/HBAR/0.0.1991880) and HBAR tokens.
- The platform supports peer-to-peer transactions, driving greater user engagement and monetizing content creation.
- **Structure**:
  - Transaction
    ```
    Tip Transaction | Sender: AccountId | Recipient: RecipientId | Amount: 10 ASSET | Timestamp: 2023-11-11T13:34:56Z
    Tip Transaction | Sender: AccountId | Recipient: RecipientId | Amount: 100 HBAR | Timestamp: 2023-11-11T13:34:56Z
    ```
  - Transaction Memo
    ```
    Memo: "Tip | For: Tread Topic Id"
    ```

### v0.0.7 (Boosting Threads)

- Users who hold an [iBird Gen 1: The First Flight](https://plaza.kabila.app/launchpads/127/ibird-gen-1-the-first-flight) can boost their Threads up to 4 time per month.
- The boosted Threads are given 10 times the normal visibility on the explore feed.
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets",
      "Type":"Boost",
      "Author": "iAssets",
    }
    ```
  - Message 2: Thread1
    ```
    {
      "Thread": "TopicId1"
    }
    ```
  - Message 3: Thread2
    ```
    {
      "Thread": "TopicId2"
    }
    ```

### v0.0.8 (Interactive Polls)

- Users can create interactive polls on their threads. These polls help gather feedback, spark discussions, or make democratic decisions within communities.
- Polls have a defined start and an end date, with users being able to vote only within this timeframe.
- Upon poll conclusion, an immutable record is created displaying the final results.
- **Structure**:
  - Message 1: Topic information
    ```
    {
      "Identifier":"iAssets",
      "Type":"Thread",
      "Author": "iAssets",
    }
    ```
  - Message 2: User creates a poll
    ```
        {
        "Poll": {
            "Title": "Favourite crypto?"
            "Options": ["Bitcoin", "Ethereum", "Other"],
            "Start_Time": "2023-11-11T13:34:56Z",
            "End_Time": "2023-12-11T13:34:56Z"
        }
        }
    ```
  - Message 3: User votes
    ```
      {
        "Author": "AccountId",
        "Vote": "Bitcoin"
      }
    ```
  - Message 4: Poll concludes
    ```
    {
      "Poll_Result": {
          "Title": "Favourite crypto?",
          "Votes": {
              "Bitcoin": 10,
              "Ethereum": 5,
              "Other": 2
          },
          "End_Time": "2023-12-11T13:34:56Z"
      }
    }
    ```

### v0.0.9 (iOS and Android Applications)

The platform now offers dedicated mobile applications for both iOS and Android devices, enhancing user accessibility and engagement.

### v0.1.0 (Community Governance)

- [ASSET](https://www.saucerswap.finance/swap/HBAR/0.0.1991880) Token Holders can propose and vote on platform-wide changes and updates.
- Voting mechanism and results are handled by HCS for transparency and efficiency.

## Building Together

Project-Harriet is an open-source venture and we appreciate contributions from our community. Feel free to participate in the project, propose improvements, or raise issues. Whether you're making changes to the existing code or suggesting new features, your contribution will shape the future!

## License

This project is anchored by the Creative Commons Attribution-NonCommercial 4.0 International Public License - see the [LICENSE](LICENSE.md) file for details.
