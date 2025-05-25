# Cute Grievance Portal

A kawaii-styled desktop app to share with your friends. Just a fun project I vibe coded in a few hours. It allows you to send grievances without any hosted server. It uses a Telegram bot to send messages directly to a channel or chat, which is absolutely free and easy to set up. 

## Setup and Run

1.  **Install Dependencies:**
    Open your terminal in the project root (`cute-grievance-portal/`) and run:
    ```bash
    npm install
    ```

2.  **Create Configuration File:**
    Create a file named `config.json` in the `cute-grievance-portal` directory.
    Add your Telegram Bot Token and Chat ID to this file:
    ```json
    {
      "BOT_TOKEN": "<YOUR_BOT_TOKEN_FROM_BOTFATHER>",
      "CHAT_ID": "<YOUR_TARGET_CHAT_ID>"
    }
    ```
    *   Replace `<YOUR_BOT_TOKEN_FROM_BOTFATHER>` with the token you received from @BotFather (e.g., `7295500229:AAHF-mm46xGgdbNRgJCkF5zX8d2Rvkj3EDc`).
    *   Replace `<YOUR_TARGET_CHAT_ID>` with the ID of your Telegram channel (e.g., `-1001234567890`). To get the chat id, type ```https://api.telegram.org/bot<BOT_ID>/getUpdates``` into your browser, replacing `<BOT_ID>` with your bot's token. The chat ID will be in the response JSON under `message.chat.id`. (If you've set it up correctly, that is.s)
    **Note:** As of now I have added my credentials in the `config.json` file, so you can test the app without creating your own bot. However, I recommend creating your own bot for security and privacy reasons.

3.  **Place Assets:**
    *   Place your desired background image as `pixelback.png` inside the `assets/` folder.
    *   Place your flapping bird animation as `bird.gif` inside the `assets/` folder.
    If the `assets` folder doesn't exist in `cute-grievance-portal/`, please create it.

4.  **Start the App:**
    Run the following command in your terminal from the project root:
    ```bash
    npm start
    ```

## Building the App (Optional)

To package the application for distribution:

```bash
npm run pack
```
This will create a distributable version in a `dist` or similar directory, based on your `electron-builder` configuration. Ensure you run this using admin privileges if you're on Windows, that is how it worked for me.
