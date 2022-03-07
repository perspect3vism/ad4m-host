import type { Arguments, Argv } from 'yargs';
// @ts-ignore
import { init } from "@perspect3vism/ad4m-executor";
import path from 'path';
import fs from 'fs';
// @ts-ignore
import { getAppDataPath } from "appdata-path";
import getPort from 'get-port';

type Options = {
  port?: number;
  hcAdminPort?: number;
  hcAppPort?: number;
  connectHolochain?: boolean;
  dataPath?: string;
};

export const command: string = 'serve';
export const desc: string = 'Serve ad4m service at given port';

export const builder = (yargs: Argv) =>
  yargs
    .options({
      port: { 
        type: 'number', 
        describe: 'Use this port to run ad4m GraphQL service', 
        default: 4000, 
        alias: 'p'
      },
      hcAdminPort: { 
        type: 'number', 
        describe: 'Admin port of holochain conductor'
      },
      hcAppPort: { 
        type: 'number', 
        describe: 'Port used by hApp' 
      },
      connectHolochain: { 
        type: "boolean", 
        describe: 'Flag to connect existing running holochain process'
      },
      dataPath: { 
        type: 'string', 
        describe: 'The relative path for storing ad4m data', 
        alias: 'rp'
      },
      appDefaultLangPath: {
        type: 'string',
        describe: 'Location of the custom default languages',
        alias: 'dlp'
      }
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { port, hcAdminPort, hcAppPort, connectHolochain, dataPath, appDefaultLangPath } = argv;

  const binaryPath = path.join(getAppDataPath(dataPath || 'ad4m'), 'binary');

  const appDefaultLangLocation: string = path.join(__dirname, appDefaultLangPath as string || "../../temp/languages");

  const gqlPort = await getPort({ port })

  const config = {
    appDataPath: getAppDataPath(dataPath || ''),
    resourcePath: binaryPath,
    appDefaultLangPath: appDefaultLangLocation,
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
          bundle: fs.readFileSync(path.join(appDefaultLangLocation, 'direct-message-language', 'build', 'bundle.js')).toString()
        }
      ],
      perspectives: [],
    },
    appBuiltInLangs: [],
    mocks: false,
    gqlPort,
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
