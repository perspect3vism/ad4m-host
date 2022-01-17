import type { Arguments, Argv } from 'yargs';
import { init } from "ad4m-executor-test";
import path from 'path';
import fs from 'fs';
import { getAppDataPath } from "appdata-path";
import { binaryPath } from './init';

type Options = {
  graphqlPort?: number;
  hcAdminPort?: number;
  hcAppPort?: number;
  connectHolochain?: boolean;
};

export const command: string = 'serve';
export const desc: string = 'Serve ad4m service at given port';

export const builder = (yargs: Argv) =>
  yargs
    .options({
      graphqlPort: { type: 'number' },
      hcAdminPort: { type: 'number' },
      hcAppPort: { type: 'number' },
      connectHolochain: { type: "boolean" }
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { graphqlPort, hcAdminPort, hcAppPort, connectHolochain } = argv;

  const config = {
    appDataPath: getAppDataPath(),
    resourcePath: binaryPath,
    appDefaultLangPath: path.join(__dirname, "../../temp/languages"),
    ad4mBootstrapLanguages: {
      agents: "agent-expression-store",
      languages: "languages",
      neighbourhoods: "neighbourhood-store"
    },
    ad4mBootstrapFixtures: {
      languages: [
        {
          address: 'QmR1dV5KuAQtYG98qqmYEvHXfxJZ3jKyjf7SFMriCMfHVQ',
          meta:  {"author":"did:key:zQ3shkkuZLvqeFgHdgZgFMUx8VGkgVWsLA83w2oekhZxoCW2n","timestamp":"2021-10-07T21:39:36.607Z","data":{"name":"Direct Message Language","address":"QmR1dV5KuAQtYG98qqmYEvHXfxJZ3jKyjf7SFMriCMfHVQ","description":"Template source for personal, per-agent DM languages. Holochain based.","possibleTemplateParams":["recipient_did","recipient_hc_agent_pubkey"],"sourceCodeLink":"https://github.com/perspect3vism/direct-message-language"},"proof":{"signature":"e933e34f88694816ea91361605c8c2553ceeb96e847f8c73b75477cc7d9bacaf11eae34e38c2e3f474897f59d20f5843d6f1d2c493b13552093bc16472b0ac33","key":"#zQ3shkkuZLvqeFgHdgZgFMUx8VGkgVWsLA83w2oekhZxoCW2n","valid":true}},
          bundle: fs.readFileSync(path.join(path.join(__dirname, "../../temp/languages"), 'direct-message-language', 'build', 'bundle.js')).toString()
        }
      ],
      perspectives: [],
    },
    appBuiltInLangs: [],
    mocks: false,
    gqlPort: graphqlPort,
    hcPortAdmin: hcAdminPort,
    hcPortApp: hcAppPort,
    connectHolochain,
  };
  const ad4mCore = await init(config);
  
  await ad4mCore.waitForAgent();
  console.log("Agent has been init'd. Controllers now starting init...");

  ad4mCore.initControllers();
  console.log("Controllers init complete. Initializing languages...");

  await ad4mCore.initLanguages();
  console.log("All languages initialized.");
};