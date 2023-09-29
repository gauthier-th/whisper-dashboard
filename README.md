# Whisper Dashboard

A simple dashboard for sending translations to [Whisper](https://github.com/openai/whisper) (Open source speech recognition model from OpenAI).

You can use this dashboard to create user accounts, upload audio files, and download the results of the speech recognition model.

This dashboard uses [Node.js](https://github.com/nodejs/node) and [Express](https://github.com/expressjs/express) for the backend with a [React](https://github.com/facebook/react) frontend. Whisper's Python API is used to run the speech recognition model.

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

## Environment variables

You can configure the dashboard with the following environment variables:

| Variable name               | Description                                          | Default value |
|-----------------------------|------------------------------------------------------|---------------|
| PORT                        | Port to run the server on                            | 3000          |
| JWT_SECRET                  | Secret key for signing JWT tokens                    |               |
| CORS_ORIGIN                 | If specified, the origin to allow CORS requests from |               |
| MAX_PARALLEL_TRANSCRIPTIONS | Maximum number of transcriptions to run in parallel  | 1             |
| WHISPER_MODEL               | Name of the Whisper model to use ([list here](https://github.com/openai/whisper?tab=readme-ov-file#available-models-and-languages)) | tiny          |

The variable `CORS_ORIGIN` is useful for development with the frontend running on http://localhost:5173 while the backend runs on http://localhost:3000.

## Installation with Docker

### With command line arguments

You can build the Docker image with:
```bash
docker build -t whisper-dashboard .
```

Or you can pull the image from GitHub Container Registry:
```bash
docker pull ghcr.io/gauthier-th/whisper-dashboard:latest
```

Then run the container with:

```bash
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=secret \
  -e MAX_PARALLEL_TRANSCRIPTIONS=1 \
  -e WHISPER_MODEL=tiny \
  -v /path/to/data:/config \
  ghcr.io/gauthier-th/whisper-dashboard:latest
```

### With a Docker Compose file

You can also use this Docker Compose to run the dashboard:

```yaml
version: "3.8"
services:
    whisper-dashboard:
        ports:
            - '3000:3000'
        environment:
            - JWT_SECRET=secret
            - MAX_PARALLEL_TRANSCRIPTIONS=1
            - WHISPER_MODEL=tiny
        volumes:
            - '/path/to/data:/config'
        image: 'ghcr.io/gauthier-th/whisper-dashboard:latest'
```

## Native installation

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
3. Copy the `.env.example` file to `.env` and fill in the values from the table above. You can leave the default values.
4. Install the dependencies for the frontend:
    ```bash
    cd app
    npm install
    ```
5. Copy the `.env.example` file to `.env` and fill in this value:
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

