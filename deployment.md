# Full-Stack CEN Template - Deployment

This Readme will describe the deployment on OpenShift.

## Our journey to a successful deployment 🏁

The steps should be performed in this exact order.

1. [Preparation](#preparation)
2. [Deploying the Database](#database)
3. [Deploying the Backend](#backend) ⚠️ It will run with errors until the [config map](#env-config-map) is finished (which we can only finish in the end).
4. [Deploying the Frontend](#frontend)
5. [Finish up the Env Config Map](#env-config-map)
6. [Setup a deployment hook](#setup-a-deployment-hook)

## Preparation

1. If not already done, have this codebase pushed to your Gitlab / Github repo
2. Create AccessToken for your project in Gitlab/Github
<!-- Hey Felix, die Bezeichnung "Project AccessToken" ist nur valid für GitLab.. Das gibt es so in Github garnicht. Da gibt es entweder nur "Deployment Keys" oder "Personal AccessTokens"... das sollten wir noch unterscheiden! -->
3. Get OpenShift Instance, Open the Console and access the "Developer View"
4. Create a new project in OpenShift
5. Put the AccessToken in OpenShift as a Secret (Source Secret)
   - Username is empty
   - Password is the token

![Source Secret](img/openshif-deployment-source-secret.png)

## Database

1. In you project click "+Add" → Developer Catalog → Database → PostgreSQL → Instantiate Template
2. Fill out the Template according to the Screeshot, **MAKE SURE TO CHANGE THE PASSWORD** of the PostgreSQL User.
3. Click "Create"
4. If you are not automatically redirected, you can monitor the instanciation progress in "Topology".

![Database](img/openshift-postgres-deployment.png)

## Backend

1. In you project click "+Add" → import from git
2. Input your repo-url and open "Advanced Git Options"
3. Then enter `/backend` as Context dir
4. Select the Source Secret, that you have set up before in [Preperation](#preperation)

![advanced options (backend)](<img/openshift-deployment-config(1).png>)

5. Select Dockerfile as Import Strategy
6. Define the Name of the Dockerfile to `Dockerfile`
7. Name your Application (Name for everything alltogether) and this particular Service (the backend)

![application (backend)](<img/openshift-deployment-config(2).png>)

8. Set the port to `8000`
9. If not already set choose "create route"

![ports (backend)](<img/openshift-deployment-config(3).png>)

10. Click "Create" and - again, monitor the deployment progress in "Topology"
11. Move your database container into the application group (with "⇧shift" + drag&drop)

**<mark>Don't worry, deployment will run with errors at this point, since config map is not set yet - we will solve this later</mark>**

## Frontend

---

We start with the deployment of the frontend. The steps are basically similar to the deployment steps of the backend, but we will go through every step needed, to make sure we got everything right!

1. In you project click "+Add" → import from git
2. Input your repo-url and open "Advanced Git Options"
3. Then enter `/frontend` as Context dir
4. Select the Source Secret, that you have set up before in [Preperation](#preperation)

![ConfigMap for the frontend](img/openshift-configmap-frontend.png)

5. Select Dockerfile as Import Strategy
6. Define the Name of the Dockerfile to `Dockerfile`
7. Use the same Application (Name for everything alltogether) and set a new name for this particular Service (the frontend)

![application (frontend)](<img/openshift-frontend-deployment-config(2).png>)

8. Set the port to `8080`
9. If not already set choose "create route"

![ports (frontend)](<img/openshift-frontend-deployment-config(3).png>)

10. Click "Create" and - again, monitor the deployment progress in "Topology"

You can either wait for the first successful build, or directly open the BuildConfig of the Frontend Deployment, where we have to tell the frontend under which URL it can find it's backend.

11. To do so, we copy the backend URL to our clipboard. This specific URL can be found trough the Topology view.
    ![Copy Backend URL](img/openshift-access-backend-url.png)

12. After we copied the URL we open up the BuildConfig of our frontend.

![access buildconfig (frontend)](img/openshift-frontend-buildconfig.png)

13. In the top bar of the BuildConfig, we switch the view from Details to Environment.
14. There we provide the BC with a new Name-Value pair. The name has to be set to `VITE_API_URL` and the Value is the copied URL from our backend.

      <button onclick="navigator.clipboard.writeText('VITE_API_URL')">
         Copy 'VITE_API_URL' to clipboard
      </button>

![enter backend URL](img/openshift-frontend-enter-backend-url.png)

15. We click on "Save" → head back to the Topology view → Click on the frontend-node → under Builds click on "Start Build".
16. After the second build is complete, the frontend knows under which URL the backend can be accessed.

🙌 In the end, the frontend is running without any errors. Now we have to finalize all the environment variables that the backend needs, to be able to fully function.

## Env Config Map

For the backend to fully function it needs these 12 environment variables we have to define within a ConfigMap in OS.

```yaml
POSTGRES_PASSWORD: <ichangedthis>
STACK_NAME: <your_stack_name>
FIRST_SUPERUSER_PASSWORD: <ichangedthis>
POSTGRES_DB: app
BACKEND_CORS_ORIGINS: "<the backend URL of the deployment>"
POSTGRES_PORT: "5432"
POSTGRES_SERVER: postgresql
SECRET_KEY: <ichangedthis>
PROJECT_NAME: <your_project_name>
POSTGRES_USER: postgres
ENVIRONMENT: production
FIRST_SUPERUSER: admin@example.com
```

1. We start with opening the ConfigMaps tab → on the top right corner we click on "Create ConfigMap".
2. We will provide it with an according name, e.g. `backend-envs` and start filling it with the defined 12 env variables.

![backend env config map](<img/openshift-env-config-map(1).png>)

3. Where do they get all the needed data...

## Adminer

Deploy the Adminer Service... It's debugging purposes.

## Setup a Deployment Hook

How we can setup the Deployment Hook for some kind of "Continuos Delivery" between the main branch of our GitHub/GitLab Project and OS-Deployment.
