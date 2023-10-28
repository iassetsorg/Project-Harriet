# v0.0.1 (Threads)

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

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
