# ![Favicon](https://raw.githubusercontent.com/pkunv/fitgather/main/apps/www/public/favicon.ico) fitgather

![GitHub package.json version](https://img.shields.io/github/package-json/v/pkunv/fitgather)
![GitHub package.json next.js dependency version](https://img.shields.io/github/package-json/dependency-version/pkunv/fitgather/next)
[![Main](https://github.com/pkunv/fitgather/actions/workflows/main.yml/badge.svg)](https://github.com/pkunv/fitgather/actions/workflows/main.yml)

## Overview

Full stack web application to create clothing outfits using various E-commerce websites.\
Using rich metadata of todays E-commerce, it's possible to gather a complete outfit from various sources.\
Choose a clothing item type and paste the link from your favourite clothing shop!

## Tech stack

This project is scaffolded using [**Create T3 App**](https://create.t3.gg/en/introduction).
This is the fastest way to build type-safe web app using NEXT.js.

| **Subject**       | **Solution** |
| ----------------- | ------------ |
| Main framework    | NEXT.js      |
| Auth              | Kinde Auth   |
| API Library       | tRPC         |
| Database ORM      | Prisma       |
| Database          | Postgres     |
| CSS Framework     | Tailwind CSS |
| Component library | shadcn/ui    |
| E2E Tests         | Playwright   |

## Installation

1. Create and populate .env file accordingly to .env.example.

   > **Warning**
   > Project uses Kinde for Authentication. If you'd like to run this web app, you might need to create Kinde account.

2. Run `npm i` to install dependencies.

3. Run `npm run dev` to run local development server.

## Testing

1. Create a test user in your Kinde organization tab. Verify its email and copy the password.

2. Pass username and password to .env file accordingly.

3. Run `npm run test:e2e`
