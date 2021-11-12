
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Ad4mClient } from "@perspect3vism/ad4m";
import Ad4mExecutor from "@perspect3vism/ad4m-executor";

import getAppDataPath from "appdata-path";

const apolloClient = new ApolloClient({
  link: new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
      reconnect: true,
    },
  }),
  cache: new InMemoryCache({}),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "ignore",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

const ad4mClient = new Ad4mClient(apolloClient);

function main() {
  Ad4mExecutor.init({
    appDataPath: getAppDataPath("ad4m-host"),
    resourcePath: path.join(__dirname, ".."),
    appDefaultLangPath: DOWNLOADED_LANGS_PATH,
    ad4mBootstrapLanguages: {
      agents: "agent-expression-store",
      languages: "languages",
      neighbourhoods: "neighbourhoods-store"
    },
    ad4mBootstrapFixtures: {
      languages: [],
      perspectives: [],
    },
    appBuiltInLangs: [
      "social-context",
      "note-ipfs"
    ],
    mocks: false,
    hcUseMdns: false
  }).then((ad4mCore) => {
    ad4mCore.waitForAgent().then(async() => {
      console.log("Agent has been init'd. Controllers now starting init...");
      ad4mCore.initControllers();
      console.log("Controllers init complete. Initializing languages...");

      await ad4mCore.initLanguages();
      console.log("All languages initialized.");

    });
  });
}

main();