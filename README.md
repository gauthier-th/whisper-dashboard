# Whisper Dashboard

A simple dashboard for sending translations to [Whisper](https://github.com/openai/whisper) (Open source speech recognition model from OpenAI).

You can use this dashboard to create user accounts, upload audio files, and download the results of the speech recognition model.

This dashboard uses [Node.js](https://github.com/nodejs/node) and [Express](https://github.com/expressjs/express) for the backend with a [React](https://github.com/facebook/react) frontend.

## Overview

Login screen                                                                                                     |  Transcriptions list
-----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
![](https://github.com/gauthier-th/whisper-dashboard/blob/master/screenshots/login.png?raw=true)                 |  ![](https://github.com/gauthier-th/whisper-dashboard/blob/master/screenshots/homepage.png?raw=true)
Transcription result                                                                                             |  Admin panel
![](https://github.com/gauthier-th/whisper-dashboard/blob/master/screenshots/transcription-result.png?raw=true)  |  ![](https://github.com/gauthier-th/whisper-dashboard/blob/master/screenshots/admin-panel.png?raw=true)

## Usage

You can install this dashboard with Docker or by running the backend and frontend separately.

The first time the dashboard is started, an admin user will be created, with username "admin" and password "admin". You should change this user's password on the profile page.

As admin, you can create or delete users, manage user roles (`user` or `admin`), and view and manage transcriptions sent by all users.

## Installation with Docker

Coming soon...

## Installation without Docker

### Requirements

- Node.js 18+
- Python 3.8+

### Installation

1. Clone the repository
2. Install the dependencies for the backend:
    ```bash
    cd api
    npm install
    pip install -U openai-whisper
    ```
3. Copy the `.env.example` file to `.env` and fill in the values:
 - `PORT`: The port to run the server on
 - `JWT_SECRET`: A secret key for signing JWT tokens
 - `CORS_ORIGIN`: If specified, the origin to allow CORS requests from (useful for development with the frontend running on http://localhost:5173)
4. Install the dependencies for the frontend:
    ```bash
    cd app
    npm install
    ```
5. Copy the `.env.example` file to `.env` and fill in the values:
  - `VITE_API_URL`: The URL of the backend API (e.g. http://localhost:3000 for development)

### Development

You should run the backend and frontend in separate terminals. The backend will run on port 3000 by default, and the frontend will run on port 5173 by default. You can use the default values of the `.env.example` files to get started.

1. Start the backend:
   ```bash
   cd api
   npm run dev
   ```
2. Start the frontend:
    ```bash
    cd app
    npm run dev
    ```

### Production

1. Build the frontend:
    ```bash
    cd app
    npm run build
    ```
2. Start the backend:
    ```bash
    cd api
    npm start
    ```
3. The frontend will be served from the backend at the `/` path.

## Contributing

Pull requests are welcome! This project is still in early development, so there are many features that could be added. If you have any questions, feel free to open an issue or email me at [mail@gauthierth.fr](mailto:mail@gauthierth.fr).

## License

This project is licensed under the [MIT License](LICENSE).

