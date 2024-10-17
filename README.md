# Introduction

The project, “Easy Task” uses the following technologies:

-   Typescript
-   NextJS
-   ReactJS
-   Material UI (MUI)
-   Suapbase
-   Postgresql DB
-   GitHub
-   Vercel
    This guide will walk you through all the necessary steps required to set up the project and deploy it to a working
    environment.

# Database

This project utilises the Supabase technology to handle authentication and database. In order to run the application, a
supabase project will be required. In order to set one up, complete the following steps:

1. Navigate to [supabase.com](https://supabase.com/) and create an account.
2. After you login, you will be navigated to the dashboard. Here create a project. Name it “Easy Task” for clarity of
   what the project is being used for.
3. This may take a couple of minutes to set up. Afterwards, navigate into the project dashboard, and using the sidebar,
   navigate to the “`Project Settings`” page.
4. Click on the “API” tab under Configuration
5. Here, you will be able to view all the credentials required to use supabase.
6. In the following steps, this page will be referred to as the “Supabase Credentials Page”
7. Keep this page open and continue onto the next section.

# Repository

The following steps will provide you with instructions required to setup the codebase for deployment

1. Navigate to this repo, and create a fork then clone your fork locally to access the files and create changes as
   required.
2. Duplicate the “.env.example” file, and name it “.env.local”
3. Set the value of the “SUPABASE_URL” variable to the url on “Project URL” value on the Supabase Credentials page.
4. Set the value of the “SUPABASE_ANON_KEY” to the “anon” key on the Supabse Credentials Page.
5. Set the value of the “SUPABASE_SERVICE_KEY” to the “service_role” key on the Supabase Credentials page.
6. Set the value of the “NEXT_PUBLIC_URL” to the domain at which the website will be hosted.
7. This will most likely be “http://localhost:3000” for local development, but should be the URL where the application
   is hosted for production.
8. Ensure the “.env.local” value is not pushed to GitHub as it contains sensitive credentials.
9. Save the file and continue to the next step.

# Deploying / Hosting

The application can be hosted and deployed on any platform / service that supports dynamic, SPA web applications.
However, since the application uses NextJS, we highly recommend using Vercel to host the application. The following
instructions will cover the steps required to deploy the application to Vercel.

1. Navigate to [vercel.com](https://vercel.com/) and create an account.
2. Click on “Add Project”, connect it to your GitHub account containing the repo you forked above, and grant Vercel the
   required permissions to access your repo, then select your repo.
3. Vercel is intelligent and should auto detect that the framework for the application is “Next.js” but ensure you
   double check that this value is correct. If it is incorrect, simply click on the dropdown and select “Next.js”.
4. Here, you will be given the option to add a list of environmental variables, or copy and paste an .env file.
5. Navigate back to your local copy of the repo, and copy the entire content of the “.env.local” file you created above.
6. Paste the contents of the file into the “Environment Variables” section and it will auto populate all the required
   variables.
7. Afterwards, click on “Deploy” to deploy the application.
8. It may take a couple of minutes for Vercel to build and deploy the application, but afterwards, Vercel will provide
   you with a URL which you can use to visit the application.
9. Navigate to the URL and ensure you can see the login page as expected.
10. If you can, you just successfully deployed the application and can commence using it.
11. However, if you cannot, go to the project settings on Vercel and ensure the project framework is “Next.js”, ensure
    all the environment variables from the “.env.local” file is present, and ensure the build and output settings are
    using npm rather than yarn.

# Local Development

The application can also be run locally, with a local instance of the database to ensure you do not pollute the
production database. The following steps will provide instructions on how to setup the application on a local machine

1. Ensure you have NodeJS installed. Refer to [this guide](https://nodejs.org/en/download/package-manager/current) for
   information.
2. Since the application uses TypeScript, it is required that it is installed on the local machine. Refer
   to [this guide](https://www.typescriptlang.org/download/) for steps to install based on your machine architecture.
3. Navigate to Supabase’ [guide](https://www.typescriptlang.org/download/) on installing the Supabase CLI in order to
   install supabase locally based on your machine architecture.
4. Once the Supabase CLI is installed on the local machine, navigate to the local repo that was forked above then run
   the “supabase init” in the root directory of the repo.
5. Execute the “supabase start” command to start the supabase instance.
6. Afterwards, you will see a list of variables. These variables can be retrieved again by running the “supabase status”
   command
7. In the “.env.local” file created above, change the “SUPABASE_URL” variable to the “API URL” variable in the console
   output.
8. Change the “SUPABASE_ANON_KEY” and “SUPABASE_SERVICE_KEY” to the respective “anon key” and “service_role key”
   variables.
9. Change the “NEXT_PUBLIC_URL” variable to “http://localhost:3000”
10. In the root folder of the application, execute the command “npm run dev”. This will start the local development
    server for the application.
11. The application will then be accessible via the URL “http://localhost:3000”
12. You have now successfully set up the application on your local machine. More information on local development with
    Supabase can be found [here](https://www.typescriptlang.org/download/).
