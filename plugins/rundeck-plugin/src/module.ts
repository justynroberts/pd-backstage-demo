import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createRundeckExecuteAction } from './actions/rundeck/rundeck';
import { coreServices } from '@backstage/backend-plugin-api';

export default createBackendModule({
  moduleId: 'rundeck',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ scaffolder, config, logger }) {
        scaffolder.addActions(createRundeckExecuteAction({ config, logger }));
      },
    });
  },
});